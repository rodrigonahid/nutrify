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

export const patientsRelations = relations(patients, ({ one }) => ({
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
