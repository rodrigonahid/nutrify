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
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  )

/**
 * Invite code validation - 8 digits
 */
export const inviteCodeSchema = z
  .string()
  .regex(/^\d{8}$/, "Invite code must be 8 digits")
  .length(8, "Invite code must be exactly 8 digits");

/**
 * User creation validation
 */
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "professional", "patient"]),
});

/**
 * Signup validation (patient registration)
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  inviteCode: inviteCodeSchema,
  dateOfBirth: z.string().optional(),
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
 * Progress entry validation
 * All measurements are optional to allow partial data entry
 */
export const progressSchema = z.object({
  // Body Composition
  bodyFatPercentage: z
    .number()
    .min(0, "Body fat percentage cannot be negative")
    .max(60, "Body fat percentage must be less than 60")
    .optional(),
  height: z
    .number()
    .min(0.5, "Height must be at least 0.5 meters")
    .max(2.5, "Height must be less than 2.5 meters")
    .optional(),
  totalWeight: z
    .number()
    .min(20, "Weight must be at least 20 kg")
    .max(300, "Weight must be less than 300 kg")
    .optional(),
  bmi: z
    .number()
    .min(10, "BMI must be at least 10")
    .max(60, "BMI must be less than 60")
    .optional(),

  // Perimeters - Trunk (cm)
  perimeterChest: z
    .number()
    .min(40, "Chest perimeter must be at least 40 cm")
    .max(200, "Chest perimeter must be less than 200 cm")
    .optional(),
  perimeterShoulder: z
    .number()
    .min(40, "Shoulder perimeter must be at least 40 cm")
    .max(200, "Shoulder perimeter must be less than 200 cm")
    .optional(),
  perimeterWaist: z
    .number()
    .min(40, "Waist perimeter must be at least 40 cm")
    .max(200, "Waist perimeter must be less than 200 cm")
    .optional(),
  perimeterAbdomen: z
    .number()
    .min(40, "Abdomen perimeter must be at least 40 cm")
    .max(200, "Abdomen perimeter must be less than 200 cm")
    .optional(),
  perimeterHip: z
    .number()
    .min(50, "Hip perimeter must be at least 50 cm")
    .max(200, "Hip perimeter must be less than 200 cm")
    .optional(),

  // Perimeters - Upper Limbs (cm)
  perimeterBicepsLeftRelaxed: z
    .number()
    .min(15, "Biceps perimeter must be at least 15 cm")
    .max(80, "Biceps perimeter must be less than 80 cm")
    .optional(),
  perimeterBicepsLeftContracted: z
    .number()
    .min(15, "Biceps perimeter must be at least 15 cm")
    .max(80, "Biceps perimeter must be less than 80 cm")
    .optional(),
  perimeterBicepsRightRelaxed: z
    .number()
    .min(15, "Biceps perimeter must be at least 15 cm")
    .max(80, "Biceps perimeter must be less than 80 cm")
    .optional(),
  perimeterBicepsRightContracted: z
    .number()
    .min(15, "Biceps perimeter must be at least 15 cm")
    .max(80, "Biceps perimeter must be less than 80 cm")
    .optional(),
  perimeterForearmLeft: z
    .number()
    .min(15, "Forearm perimeter must be at least 15 cm")
    .max(60, "Forearm perimeter must be less than 60 cm")
    .optional(),
  perimeterForearmRight: z
    .number()
    .min(15, "Forearm perimeter must be at least 15 cm")
    .max(60, "Forearm perimeter must be less than 60 cm")
    .optional(),

  // Perimeters - Lower Limbs (cm)
  perimeterThighProximalLeft: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterThighProximalRight: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterThighMedialLeft: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterThighMedialRight: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterThighDistalLeft: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterThighDistalRight: z
    .number()
    .min(30, "Thigh perimeter must be at least 30 cm")
    .max(120, "Thigh perimeter must be less than 120 cm")
    .optional(),
  perimeterCalfLeft: z
    .number()
    .min(20, "Calf perimeter must be at least 20 cm")
    .max(70, "Calf perimeter must be less than 70 cm")
    .optional(),
  perimeterCalfRight: z
    .number()
    .min(20, "Calf perimeter must be at least 20 cm")
    .max(70, "Calf perimeter must be less than 70 cm")
    .optional(),

  // Skinfolds (mm)
  skinfoldBiceps: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldTriceps: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldAxillary: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldSuprailiac: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldAbdominal: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldSubscapular: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldChest: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldThigh: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
  skinfoldCalf: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(50, "Skinfold must be less than 50 mm")
    .optional(),
});

/**
 * Meal plan validation schemas
 */

// Ingredient validation
export const mealIngredientSchema = z.object({
  ingredientName: z
    .string()
    .min(1, "Ingredient name is required")
    .max(255, "Ingredient name is too long"),
  weightGrams: z
    .number()
    .min(0.01, "Weight must be at least 0.01 grams")
    .max(9999.99, "Weight must be less than 10000 grams"),
  orderIndex: z.number().int().min(0),
});

// Meal option validation
export const mealOptionSchema = z.object({
  name: z
    .string()
    .min(1, "Option name is required")
    .max(255, "Option name is too long"),
  notes: z.string().max(2000, "Notes are too long").optional(),
  ingredients: z
    .array(mealIngredientSchema)
    .min(1, "Each option must have at least one ingredient"),
});

// Meal validation
export const mealSchema = z.object({
  timeOfDay: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  orderIndex: z.number().int().min(0),
  options: z
    .array(mealOptionSchema)
    .min(1, "Each meal must have at least one option"),
});

// Meal plan validation (for API - includes isActive)
export const mealPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Meal plan name is required")
    .max(255, "Meal plan name is too long"),
  isActive: z.boolean().default(false),
  meals: z.array(mealSchema).min(1, "Meal plan must have at least one meal"),
});

// Meal plan form validation (for client-side - excludes isActive since it's set on submit)
export const mealPlanFormSchema = z.object({
  name: z
    .string()
    .min(1, "Meal plan name is required")
    .max(255, "Meal plan name is too long"),
  meals: z.array(mealSchema).min(1, "Meal plan must have at least one meal"),
});

// Update meal plan (partial)
export const updateMealPlanSchema = mealPlanSchema.partial();
