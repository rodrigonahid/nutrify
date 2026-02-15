import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "professional",
  "patient",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "requested",
  "cancelled",
  "completed",
]);

// Users table - core authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  professional: one(professionals, {
    fields: [users.id],
    references: [professionals.userId],
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
}));

// Professionals table - extended profile for nutritionists/professionals
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  phone: text("phone"),
  professionalLicense: text("professional_license"),
  specialization: text("specialization"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalsRelations = relations(
  professionals,
  ({ one, many }) => ({
    user: one(users, {
      fields: [professionals.userId],
      references: [users.id],
    }),
    patients: many(patients),
    inviteCodes: many(inviteCodes),
    mealPlans: many(mealPlans),
    appointments: many(appointments),
    exercises: many(exercises),
    workouts: many(workouts),
    patientPlans: many(patientPlans),
  })
);

// Patients table - extended profile
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "restrict" }),
  name: text("name"),
  dateOfBirth: date("date_of_birth"),
  height: decimal("height", { precision: 5, scale: 2 }), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  professional: one(professionals, {
    fields: [patients.professionalId],
    references: [professionals.id],
  }),
  inviteCode: one(inviteCodes, {
    fields: [patients.id],
    references: [inviteCodes.usedBy],
  }),
  progressEntries: many(progress),
  mealPlans: many(mealPlans),
  appointments: many(appointments),
  muscleGroups: many(muscleGroups),
  exercises: many(exercises),
  workouts: many(workouts),
  trainingSessions: many(trainingSessions),
  patientPlan: one(patientPlans, {
    fields: [patients.id],
    references: [patientPlans.patientId],
  }),
}));

// Invite codes table - for patient signup
export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  patientName: text("patient_name").notNull(),
  used: boolean("used").default(false).notNull(),
  usedBy: integer("used_by").references(() => patients.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  professional: one(professionals, {
    fields: [inviteCodes.professionalId],
    references: [professionals.id],
  }),
  patient: one(patients, {
    fields: [inviteCodes.usedBy],
    references: [patients.id],
  }),
}));

// Sessions table - for authentication
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Progress table - detailed patient progress tracking
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),

  // Body Composition
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }), // meters
  totalWeight: decimal("total_weight", { precision: 5, scale: 2 }), // kg
  bmi: decimal("bmi", { precision: 4, scale: 2 }),

  // Perimeters - Trunk (cm)
  perimeterChest: decimal("perimeter_chest", { precision: 5, scale: 2 }),
  perimeterShoulder: decimal("perimeter_shoulder", { precision: 5, scale: 2 }),
  perimeterWaist: decimal("perimeter_waist", { precision: 5, scale: 2 }),
  perimeterAbdomen: decimal("perimeter_abdomen", { precision: 5, scale: 2 }),
  perimeterHip: decimal("perimeter_hip", { precision: 5, scale: 2 }),

  // Perimeters - Upper Limbs (cm)
  perimeterBicepsLeftRelaxed: decimal("perimeter_biceps_left_relaxed", {
    precision: 5,
    scale: 2,
  }),
  perimeterBicepsLeftContracted: decimal("perimeter_biceps_left_contracted", {
    precision: 5,
    scale: 2,
  }),
  perimeterBicepsRightRelaxed: decimal("perimeter_biceps_right_relaxed", {
    precision: 5,
    scale: 2,
  }),
  perimeterBicepsRightContracted: decimal("perimeter_biceps_right_contracted", {
    precision: 5,
    scale: 2,
  }),
  perimeterForearmLeft: decimal("perimeter_forearm_left", {
    precision: 5,
    scale: 2,
  }),
  perimeterForearmRight: decimal("perimeter_forearm_right", {
    precision: 5,
    scale: 2,
  }),

  // Perimeters - Lower Limbs (cm)
  perimeterThighProximalLeft: decimal("perimeter_thigh_proximal_left", {
    precision: 5,
    scale: 2,
  }),
  perimeterThighProximalRight: decimal("perimeter_thigh_proximal_right", {
    precision: 5,
    scale: 2,
  }),
  perimeterThighMedialLeft: decimal("perimeter_thigh_medial_left", {
    precision: 5,
    scale: 2,
  }),
  perimeterThighMedialRight: decimal("perimeter_thigh_medial_right", {
    precision: 5,
    scale: 2,
  }),
  perimeterThighDistalLeft: decimal("perimeter_thigh_distal_left", {
    precision: 5,
    scale: 2,
  }),
  perimeterThighDistalRight: decimal("perimeter_thigh_distal_right", {
    precision: 5,
    scale: 2,
  }),
  perimeterCalfLeft: decimal("perimeter_calf_left", {
    precision: 5,
    scale: 2,
  }),
  perimeterCalfRight: decimal("perimeter_calf_right", {
    precision: 5,
    scale: 2,
  }),

  // Skinfolds (mm)
  skinfoldBiceps: decimal("skinfold_biceps", { precision: 5, scale: 2 }),
  skinfoldTriceps: decimal("skinfold_triceps", { precision: 5, scale: 2 }),
  skinfoldAxillary: decimal("skinfold_axillary", { precision: 5, scale: 2 }),
  skinfoldSuprailiac: decimal("skinfold_suprailiac", {
    precision: 5,
    scale: 2,
  }),
  skinfoldAbdominal: decimal("skinfold_abdominal", { precision: 5, scale: 2 }),
  skinfoldSubscapular: decimal("skinfold_subscapular", {
    precision: 5,
    scale: 2,
  }),
  skinfoldChest: decimal("skinfold_chest", { precision: 5, scale: 2 }),
  skinfoldThigh: decimal("skinfold_thigh", { precision: 5, scale: 2 }),
  skinfoldCalf: decimal("skinfold_calf", { precision: 5, scale: 2 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const progressRelations = relations(progress, ({ one }) => ({
  patient: one(patients, {
    fields: [progress.patientId],
    references: [patients.id],
  }),
}));

// Meal Plans - nutrition meal plans for patients
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  patient: one(patients, {
    fields: [mealPlans.patientId],
    references: [patients.id],
  }),
  professional: one(professionals, {
    fields: [mealPlans.professionalId],
    references: [professionals.id],
  }),
  meals: many(meals),
}));

// Meals - individual meals within a meal plan
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  timeOfDay: text("time_of_day").notNull(), // HH:MM format
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealsRelations = relations(meals, ({ one, many }) => ({
  mealPlan: one(mealPlans, {
    fields: [meals.mealPlanId],
    references: [mealPlans.id],
  }),
  options: many(mealOptions),
}));

// Meal Options - alternative options for a meal
export const mealOptions = pgTable("meal_options", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealOptionsRelations = relations(mealOptions, ({ one, many }) => ({
  meal: one(meals, {
    fields: [mealOptions.mealId],
    references: [meals.id],
  }),
  ingredients: many(mealIngredients),
}));

// Meal Ingredients - ingredients within a meal option
export const mealIngredients = pgTable("meal_ingredients", {
  id: serial("id").primaryKey(),
  mealOptionId: integer("meal_option_id")
    .notNull()
    .references(() => mealOptions.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: decimal("quantity", { precision: 7, scale: 2 }).notNull(),
  unit: text("unit").default("g").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealIngredientsRelations = relations(
  mealIngredients,
  ({ one }) => ({
    mealOption: one(mealOptions, {
      fields: [mealIngredients.mealOptionId],
      references: [mealOptions.id],
    }),
  })
);

// Appointments - scheduling system for professional-patient appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  appointmentDate: date("appointment_date").notNull(), // YYYY-MM-DD
  appointmentTime: text("appointment_time").notNull(), // HH:MM (24-hour format)
  durationMinutes: integer("duration_minutes").default(60).notNull(),
  status: appointmentStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  cancelledBy: integer("cancelled_by").references(() => users.id, {
    onDelete: "set null",
  }),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id],
  }),
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  cancelledByUser: one(users, {
    fields: [appointments.cancelledBy],
    references: [users.id],
  }),
}));

// Training Feature Tables

// Muscle Groups — defaults (isDefault=true, patientId=null) + user-custom
export const muscleGroups = pgTable("muscle_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  patientId: integer("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const muscleGroupsRelations = relations(
  muscleGroups,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [muscleGroups.patientId],
      references: [patients.id],
    }),
    exercises: many(exercises),
    trainingSessions: many(trainingSessions),
  })
);

// Exercises — independent, reusable across workouts
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  muscleGroupId: integer("muscle_group_id").references(
    () => muscleGroups.id,
    { onDelete: "set null" }
  ),
  patientId: integer("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),
  professionalId: integer("professional_id").references(
    () => professionals.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  muscleGroup: one(muscleGroups, {
    fields: [exercises.muscleGroupId],
    references: [muscleGroups.id],
  }),
  patient: one(patients, {
    fields: [exercises.patientId],
    references: [patients.id],
  }),
  professional: one(professionals, {
    fields: [exercises.professionalId],
    references: [professionals.id],
  }),
  workoutExercises: many(workoutExercises),
  sessionExercises: many(sessionExercises),
  prs: many(exercisePrs),
}));

// Workouts — templates
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  assignedByProfessionalId: integer("assigned_by_professional_id").references(
    () => professionals.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  patient: one(patients, {
    fields: [workouts.patientId],
    references: [patients.id],
  }),
  assignedByProfessional: one(professionals, {
    fields: [workouts.assignedByProfessionalId],
    references: [professionals.id],
  }),
  workoutExercises: many(workoutExercises),
  trainingSessions: many(trainingSessions),
}));

// Workout Exercises — ordered exercises in a workout
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

// Training Sessions — actual day's training log
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  workoutId: integer("workout_id").references(() => workouts.id, {
    onDelete: "set null",
  }),
  muscleGroupId: integer("muscle_group_id").references(() => muscleGroups.id, {
    onDelete: "set null",
  }),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trainingSessionsRelations = relations(
  trainingSessions,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [trainingSessions.patientId],
      references: [patients.id],
    }),
    workout: one(workouts, {
      fields: [trainingSessions.workoutId],
      references: [workouts.id],
    }),
    muscleGroup: one(muscleGroups, {
      fields: [trainingSessions.muscleGroupId],
      references: [muscleGroups.id],
    }),
    sessionExercises: many(sessionExercises),
  })
);

// Session Exercises — exercises within a session
export const sessionExercises = pgTable("session_exercises", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => trainingSessions.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionExercisesRelations = relations(
  sessionExercises,
  ({ one, many }) => ({
    session: one(trainingSessions, {
      fields: [sessionExercises.sessionId],
      references: [trainingSessions.id],
    }),
    exercise: one(exercises, {
      fields: [sessionExercises.exerciseId],
      references: [exercises.id],
    }),
    exerciseSets: many(exerciseSets),
  })
);

// Exercise Sets — individual sets: weight × reps
export const exerciseSets = pgTable("exercise_sets", {
  id: serial("id").primaryKey(),
  sessionExerciseId: integer("session_exercise_id")
    .notNull()
    .references(() => sessionExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }),
  reps: integer("reps"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  sessionExercise: one(sessionExercises, {
    fields: [exerciseSets.sessionExerciseId],
    references: [sessionExercises.id],
  }),
}));

// Exercise PRs — manually logged personal records
export const exercisePrs = pgTable("exercise_prs", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps"),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercisePrsRelations = relations(exercisePrs, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exercisePrs.exerciseId],
    references: [exercises.id],
  }),
  patient: one(patients, {
    fields: [exercisePrs.patientId],
    references: [patients.id],
  }),
}));

// Patient Plans — billing/payment plan per patient (managed by professional)
export const patientPlans = pgTable("patient_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .unique()
    .references(() => patients.id, { onDelete: "cascade" }),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  // "monthly" | "quarterly" | "annual" | "custom"
  status: text("status").notNull().default("active"),
  // "active" | "paused" | "cancelled"
  startDate: date("start_date").notNull(),
  nextPaymentDate: date("next_payment_date"),
  lastPaymentDate: date("last_payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const patientPlansRelations = relations(patientPlans, ({ one }) => ({
  patient: one(patients, {
    fields: [patientPlans.patientId],
    references: [patients.id],
  }),
  professional: one(professionals, {
    fields: [patientPlans.professionalId],
    references: [professionals.id],
  }),
}));
