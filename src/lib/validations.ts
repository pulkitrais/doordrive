import { z } from "zod";

// Security: Strong password validation
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be less than 15 digits")
    .regex(/^\+?[0-9]+$/, "Phone must contain only digits"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Security: Input sanitization for visitor notes
export const visitorNoteSchema = z.object({
  visitor_name: z
    .string()
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]*$/, "Name contains invalid characters")
    .optional()
    .or(z.literal("")),
  visitor_phone: z
    .string()
    .max(15, "Phone must be less than 15 digits")
    .regex(/^\+?[0-9]*$/, "Phone must contain only digits")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message must be less than 500 characters"),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be less than 15 digits")
    .regex(/^\+?[0-9]+$/, "Phone must contain only digits"),
  door_instructions: z
    .string()
    .max(500, "Instructions must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VisitorNoteInput = z.infer<typeof visitorNoteSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
