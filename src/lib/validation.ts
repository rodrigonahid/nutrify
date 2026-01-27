import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required")
  .max(255, "Email is too long");

/**
 * Password validation schema
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * User creation validation
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "nutritionist", "patient"]),
});

/**
 * Nutritionist profile validation
 */
export const nutritionistProfileSchema = z.object({
  professionalLicense: z.string().optional(),
  specialization: z.string().max(255).optional(),
  bio: z.string().max(2000).optional(),
});

/**
 * Patient profile validation
 */
export const patientProfileSchema = z.object({
  nutritionistId: z.number().int().positive(),
  dateOfBirth: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  medicalNotes: z.string().max(5000).optional(),
});

/**
 * Invite code validation
 */
export const inviteCodeSchema = z
  .string()
  .uuid("Invalid invite code format")
  .or(z.string().length(36, "Invalid invite code format"));
