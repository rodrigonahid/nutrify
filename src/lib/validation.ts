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
 * Relaxed - just requires a password to be provided
 */
export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .max(100, "Password is too long")

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
 * Invite code validation - for checking code before signup
 */
export const validateInviteCodeSchema = z.object({
  inviteCode: inviteCodeSchema,
});

/**
 * Create invite code validation
 */
export const createInviteCodeSchema = z.object({
  patientName: z
    .string()
    .min(1, "Patient name is required")
    .max(255, "Patient name is too long"),
  expiresAt: z.string().optional(),
});

/**
 * Signup validation (patient registration)
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  inviteCode: inviteCodeSchema,
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .or(z.literal("")),
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
    .max(100, "Body fat percentage must be less than 100")
    .optional(),
  height: z
    .number()
    .min(30, "Height must be at least 30 cm")
    .max(300, "Height must be less than 300 cm")
    .optional(),
  totalWeight: z
    .number()
    .min(1, "Weight must be at least 1 kg")
    .max(500, "Weight must be less than 500 kg")
    .optional(),
  bmi: z
    .number()
    .min(5, "BMI must be at least 5")
    .max(100, "BMI must be less than 100")
    .optional(),

  // Perimeters - Trunk (cm)
  perimeterChest: z
    .number()
    .min(10, "Chest perimeter must be at least 10 cm")
    .max(300, "Chest perimeter must be less than 300 cm")
    .optional(),
  perimeterShoulder: z
    .number()
    .min(10, "Shoulder perimeter must be at least 10 cm")
    .max(300, "Shoulder perimeter must be less than 300 cm")
    .optional(),
  perimeterWaist: z
    .number()
    .min(10, "Waist perimeter must be at least 10 cm")
    .max(300, "Waist perimeter must be less than 300 cm")
    .optional(),
  perimeterAbdomen: z
    .number()
    .min(10, "Abdomen perimeter must be at least 10 cm")
    .max(300, "Abdomen perimeter must be less than 300 cm")
    .optional(),
  perimeterHip: z
    .number()
    .min(10, "Hip perimeter must be at least 10 cm")
    .max(300, "Hip perimeter must be less than 300 cm")
    .optional(),

  // Perimeters - Upper Limbs (cm)
  perimeterBicepsLeftRelaxed: z
    .number()
    .min(5, "Biceps perimeter must be at least 5 cm")
    .max(150, "Biceps perimeter must be less than 150 cm")
    .optional(),
  perimeterBicepsLeftContracted: z
    .number()
    .min(5, "Biceps perimeter must be at least 5 cm")
    .max(150, "Biceps perimeter must be less than 150 cm")
    .optional(),
  perimeterBicepsRightRelaxed: z
    .number()
    .min(5, "Biceps perimeter must be at least 5 cm")
    .max(150, "Biceps perimeter must be less than 150 cm")
    .optional(),
  perimeterBicepsRightContracted: z
    .number()
    .min(5, "Biceps perimeter must be at least 5 cm")
    .max(150, "Biceps perimeter must be less than 150 cm")
    .optional(),
  perimeterForearmLeft: z
    .number()
    .min(5, "Forearm perimeter must be at least 5 cm")
    .max(100, "Forearm perimeter must be less than 100 cm")
    .optional(),
  perimeterForearmRight: z
    .number()
    .min(5, "Forearm perimeter must be at least 5 cm")
    .max(100, "Forearm perimeter must be less than 100 cm")
    .optional(),

  // Perimeters - Lower Limbs (cm)
  perimeterThighProximalLeft: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterThighProximalRight: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterThighMedialLeft: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterThighMedialRight: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterThighDistalLeft: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterThighDistalRight: z
    .number()
    .min(10, "Thigh perimeter must be at least 10 cm")
    .max(200, "Thigh perimeter must be less than 200 cm")
    .optional(),
  perimeterCalfLeft: z
    .number()
    .min(10, "Calf perimeter must be at least 10 cm")
    .max(150, "Calf perimeter must be less than 150 cm")
    .optional(),
  perimeterCalfRight: z
    .number()
    .min(10, "Calf perimeter must be at least 10 cm")
    .max(150, "Calf perimeter must be less than 150 cm")
    .optional(),

  // Skinfolds (mm)
  skinfoldBiceps: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldTriceps: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldAxillary: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldSuprailiac: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldAbdominal: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldSubscapular: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldChest: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldThigh: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
    .optional(),
  skinfoldCalf: z
    .number()
    .min(0, "Skinfold cannot be negative")
    .max(100, "Skinfold must be less than 100 mm")
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
  quantity: z
    .number()
    .min(0.01, "Quantity must be at least 0.01")
    .max(9999.99, "Quantity must be less than 10000"),
  unit: z.enum(["g", "scoops", "spoons", "cups", "ml", "units"]).default("g"),
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

/**
 * Appointment validation schemas
 */

// Date validation helper - must be today or future
const futureDateSchema = z.string().refine(
  (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  },
  { message: "Appointment date must be today or in the future" }
);

// Time validation - HH:MM format (24-hour)
const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format (24-hour)");

// Create appointment validation
export const createAppointmentSchema = z.object({
  patientId: z.number().int().positive("Patient ID is required"),
  appointmentDate: futureDateSchema,
  appointmentTime: timeSchema,
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration must be less than 480 minutes (8 hours)")
    .default(60),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
});

// Update appointment validation
export const updateAppointmentSchema = z.object({
  appointmentDate: futureDateSchema.optional(),
  appointmentTime: timeSchema.optional(),
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration must be less than 480 minutes (8 hours)")
    .optional(),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
  status: z.enum(["pending", "confirmed", "requested", "cancelled", "completed"]).optional(),
});

// Cancel appointment validation
export const cancelAppointmentSchema = z.object({
  cancellationReason: z
    .string()
    .min(1, "Cancellation reason is required")
    .max(500, "Cancellation reason must be less than 500 characters"),
});
