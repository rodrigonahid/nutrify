import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  professionals,
  patients,
  inviteCodes,
  sessions,
} from "./schema";

// Select types (for reading from DB)
export type User = InferSelectModel<typeof users>;
export type Professional = InferSelectModel<typeof professionals>;
export type Patient = InferSelectModel<typeof patients>;
export type InviteCode = InferSelectModel<typeof inviteCodes>;
export type Session = InferSelectModel<typeof sessions>;

// Insert types (for inserting into DB)
export type NewUser = InferInsertModel<typeof users>;
export type NewProfessional = InferInsertModel<typeof professionals>;
export type NewPatient = InferInsertModel<typeof patients>;
export type NewInviteCode = InferInsertModel<typeof inviteCodes>;
export type NewSession = InferInsertModel<typeof sessions>;

// User roles
export type UserRole = "admin" | "professional" | "patient";

// Extended types with relations
export type UserWithProfessional = User & {
  professional: Professional | null;
};

export type UserWithPatient = User & {
  patient: Patient | null;
};

export type ProfessionalWithUser = Professional & {
  user: User;
};

export type PatientWithUser = Patient & {
  user: User;
};

export type PatientWithProfessional = Patient & {
  user: User;
  professional: Professional & {
    user: User;
  };
};

export type ProfessionalWithPatients = Professional & {
  user: User;
  patients: PatientWithUser[];
};
