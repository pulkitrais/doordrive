import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DoorPageClient } from "./door-client";

interface DoorPageProps {
  params: Promise<{ token: string }>;
}

export default async function DoorPage({ params }: DoorPageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Security: Validate QR token server-side
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, door_instructions, qr_token")
    .eq("qr_token", token)
    .single();

  if (!profile) {
    notFound();
  }

  // Audit log: Record QR scan
  const headersList = await headers();
  await supabase.from("audit_logs").insert({
    profile_id: profile.id,
    action: "qr_scanned",
    details: "QR code scanned by visitor",
    ip_address: headersList.get("x-forwarded-for") || "unknown",
    user_agent: headersList.get("user-agent") || "unknown",
  });

  return (
    <DoorPageClient
      profileName={profile.name}
      doorInstructions={profile.door_instructions}
      qrToken={profile.qr_token}
    />
  );
}
