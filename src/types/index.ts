// Auth & User Types
export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'professional' | 'patient';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Patient Types
export interface Patient {
  id: number;
  userId: number;
  email: string;
  name: string | null;
  dateOfBirth: string | null;
  height: string | null;
  weight: string | null;
  medicalNotes: string | null;
  createdAt: string;
  userCreatedAt: string;
}

// Invite Code Types
export interface InviteCode {
  id: number;
  code: string;
  patientName: string;
  used: boolean;
  usedBy: number | null;
  expiresAt: string | null;
  createdAt: string;
  patientEmail: string | null;
}

// Meal Plan Types
export interface MealPlan {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  meals?: Meal[];
}

export interface MealPlanListItem {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  mealCount: number;
  professionalEmail?: string;
}

export interface Meal {
  id: number;
  timeOfDay: string;
  orderIndex: number;
  options: MealOption[];
}

export interface MealOption {
  id: number;
  name: string;
  notes: string | null;
  ingredients: Ingredient[];
}

export interface Ingredient {
  id: number;
  ingredientName: string;
  quantity: string;
  unit: string;
  orderIndex: number;
}

// Progress Types
export interface Progress {
  id: number;
  patientId: number;

  // Body Composition
  bodyFatPercentage: string | null;
  height: string | null;
  totalWeight: string | null;
  bmi: string | null;

  // Perimeters - Trunk (cm)
  perimeterChest: string | null;
  perimeterShoulder: string | null;
  perimeterWaist: string | null;
  perimeterAbdomen: string | null;
  perimeterHip: string | null;

  // Perimeters - Upper Limbs (cm)
  perimeterBicepsLeftRelaxed: string | null;
  perimeterBicepsLeftContracted: string | null;
  perimeterBicepsRightRelaxed: string | null;
  perimeterBicepsRightContracted: string | null;
  perimeterForearmLeft: string | null;
  perimeterForearmRight: string | null;

  // Perimeters - Lower Limbs (cm)
  perimeterThighProximalLeft: string | null;
  perimeterThighProximalRight: string | null;
  perimeterThighMedialLeft: string | null;
  perimeterThighMedialRight: string | null;
  perimeterThighDistalLeft: string | null;
  perimeterThighDistalRight: string | null;
  perimeterCalfLeft: string | null;
  perimeterCalfRight: string | null;

  // Skinfolds (mm)
  skinfoldBiceps: string | null;
  skinfoldTriceps: string | null;
  skinfoldAxillary: string | null;
  skinfoldSuprailiac: string | null;
  skinfoldAbdominal: string | null;
  skinfoldSubscapular: string | null;
  skinfoldChest: string | null;
  skinfoldThigh: string | null;
  skinfoldCalf: string | null;

  createdAt: string;
}

export interface ProgressWithComparison {
  progress: Progress;
  previous: Progress | null;
}

// Professional Types
export interface Nutritionist {
  id: number;
  name: string | null;
  professionalLicense: string | null;
  specialization: string | null;
  bio: string | null;
  email: string;
  createdAt: string;
}

// Appointment Types
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'requested'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: number;
  professionalId: number;
  patientId: number;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  notes: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithPatient extends Appointment {
  patientEmail: string;
}

export interface AppointmentWithProfessional extends Appointment {
  professionalEmail: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes?: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  durationMinutes?: number;
  notes?: string;
  status?: AppointmentStatus;
}
