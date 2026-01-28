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
}));

// Invite codes table - for patient signup
export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
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
