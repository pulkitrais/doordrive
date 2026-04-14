"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  registerSchema,
  loginSchema,
  visitorNoteSchema,
  profileUpdateSchema,
} from "@/lib/validations";
import { sanitizeInput, checkRateLimit } from "@/lib/sanitize";

// Helper to extract error messages from zod issues
function getFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

/**
 * Security: User registration with strong validation
 * - Zod schema validates all inputs
 * - Supabase Auth handles password hashing
 * - Profile created with unique opaque QR token (UUID)
 */
export async function registerAction(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phone") as string,
  };

  // Validate input with Zod
  const result = registerSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = getFieldErrors(result.error.issues);
    return { error: Object.values(fieldErrors)[0] || "Validation failed" };
  }

  const { name, email, password, phone } = result.data;

  // Register with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Registration failed. Please try again." };
  }

  // Generate opaque QR token (UUID) - Security: Never contains PII
  const qrToken = crypto.randomUUID();

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    name: sanitizeInput(name),
    phone: sanitizeInput(phone),
    qr_token: qrToken,
  });

  if (profileError) {
    return { error: "Failed to create profile. Please try again." };
  }

  // Log registration in audit log
  const headersList = await headers();
  await supabase.from("audit_logs").insert({
    profile_id: authData.user.id,
    action: "register",
    details: "User registered successfully",
    ip_address: headersList.get("x-forwarded-for") || "unknown",
    user_agent: headersList.get("user-agent") || "unknown",
  });

  redirect("/dashboard");
}

/**
 * Security: Login with validated credentials
 * - Rate limiting prevents brute force
 * - Supabase Auth handles session management
 */
export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // Rate limiting: max 5 login attempts per minute per IP
  if (!checkRateLimit(`login:${ip}`, 5, 60000)) {
    return { error: "Too many login attempts. Please try again later." };
  }

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = getFieldErrors(result.error.issues);
    return { error: Object.values(fieldErrors)[0] || "Validation failed" };
  }

  const { email, password } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

/**
 * Security: Secure session termination
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Security: Visitor note submission with full audit trail
 * - Input sanitization prevents XSS
 * - Rate limiting prevents spam
 * - Audit logging tracks all submissions
 */
export async function submitVisitorNote(formData: FormData) {
  const supabase = await createClient();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  // Rate limiting: max 5 notes per minute per IP
  if (!checkRateLimit(`note:${ip}`, 5, 60000)) {
    return { error: "Too many submissions. Please try again later." };
  }

  const qrToken = formData.get("qr_token") as string;

  if (!qrToken) {
    return { error: "Invalid request" };
  }

  // Validate the QR token exists and get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("qr_token", qrToken)
    .single();

  if (!profile) {
    return { error: "Invalid or expired QR code" };
  }

  const rawData = {
    visitor_name: formData.get("visitor_name") as string,
    visitor_phone: formData.get("visitor_phone") as string,
    message: formData.get("message") as string,
  };

  const result = visitorNoteSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = getFieldErrors(result.error.issues);
    return { error: Object.values(fieldErrors)[0] || "Validation failed" };
  }

  const { visitor_name, visitor_phone, message } = result.data;

  // Insert sanitized note
  const { error: noteError } = await supabase.from("visitor_notes").insert({
    profile_id: profile.id,
    qr_token_used: qrToken,
    visitor_name: visitor_name ? sanitizeInput(visitor_name) : null,
    visitor_phone: visitor_phone ? sanitizeInput(visitor_phone) : null,
    message: sanitizeInput(message),
    ip_address: ip,
    user_agent: userAgent,
  });

  if (noteError) {
    return { error: "Failed to submit note. Please try again." };
  }

  // Audit log: track note submission
  await supabase.from("audit_logs").insert({
    profile_id: profile.id,
    action: "note_submitted",
    details: `Visitor note submitted via QR token`,
    ip_address: ip,
    user_agent: userAgent,
  });

  return { success: true };
}

/**
 * Security: Profile update with ownership verification via RLS
 */
export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    door_instructions: formData.get("door_instructions") as string,
  };

  const result = profileUpdateSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = getFieldErrors(result.error.issues);
    return { error: Object.values(fieldErrors)[0] || "Validation failed" };
  }

  const { name, phone, door_instructions } = result.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      door_instructions: door_instructions
        ? sanitizeInput(door_instructions)
        : null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update profile" };
  }

  // Audit log
  const headersList = await headers();
  await supabase.from("audit_logs").insert({
    profile_id: user.id,
    action: "profile_updated",
    details: "Profile information updated",
    ip_address: headersList.get("x-forwarded-for") || "unknown",
    user_agent: headersList.get("user-agent") || "unknown",
  });

  return { success: true };
}

/**
 * Security: QR token regeneration - invalidates old QR code
 * Generates new opaque UUID token
 */
export async function regenerateQrAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const newToken = crypto.randomUUID();

  const { error } = await supabase
    .from("profiles")
    .update({ qr_token: newToken })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to regenerate QR code" };
  }

  // Audit log
  const headersList = await headers();
  await supabase.from("audit_logs").insert({
    profile_id: user.id,
    action: "qr_regenerated",
    details: "QR code token regenerated - old QR code invalidated",
    ip_address: headersList.get("x-forwarded-for") || "unknown",
    user_agent: headersList.get("user-agent") || "unknown",
  });

  return { success: true, token: newToken };
}
