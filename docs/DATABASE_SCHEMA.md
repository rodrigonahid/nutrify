# Database Schema

## Tables Overview

### users
Core user authentication table for all user types.

```typescript
{
  id: serial (PK)
  email: text (unique, not null)
  passwordHash: text (not null)
  role: enum ('admin', 'nutritionist', 'patient')
  createdAt: timestamp (default: now)
  updatedAt: timestamp (default: now)
}
```

**Indexes:**
- email (unique)
- role

**Relationships:**
- One-to-one with `nutritionists` (if role = nutritionist)
- One-to-one with `patients` (if role = patient)

---

### nutritionists
Extended profile for nutritionist users.

```typescript
{
  id: serial (PK)
  userId: integer (FK -> users.id, unique, not null)
  professionalLicense: text (nullable)
  specialization: text (nullable)
  bio: text (nullable)
  createdAt: timestamp (default: now)
  updatedAt: timestamp (default: now)
}
```

**Relationships:**
- Belongs to `users`
- Has many `patients`
- Has many `inviteCodes`

---

### patients
Extended profile for patient users.

```typescript
{
  id: serial (PK)
  userId: integer (FK -> users.id, unique, not null)
  nutritionistId: integer (FK -> nutritionists.id, not null)
  dateOfBirth: date (nullable)
  height: decimal (nullable) // in cm
  weight: decimal (nullable) // in kg
  medicalNotes: text (nullable)
  createdAt: timestamp (default: now)
  updatedAt: timestamp (default: now)
}
```

**Indexes:**
- nutritionistId

**Relationships:**
- Belongs to `users`
- Belongs to `nutritionists`

---

### inviteCodes
Invite codes for patient signup.

```typescript
{
  id: serial (PK)
  code: text (unique, not null) // UUID v4
  nutritionistId: integer (FK -> nutritionists.id, not null)
  used: boolean (default: false)
  usedBy: integer (FK -> patients.id, nullable)
  expiresAt: timestamp (nullable)
  createdAt: timestamp (default: now)
}
```

**Indexes:**
- code (unique)
- nutritionistId
- used

**Relationships:**
- Belongs to `nutritionists`
- Optionally belongs to `patients` (after use)

---

## Entity Relationships

```
users (1) ---- (1) nutritionists
nutritionists (1) ---- (many) patients
nutritionists (1) ---- (many) inviteCodes
patients (1) ---- (1) inviteCodes (used)
users (1) ---- (1) patients
```

---

## Role-Based Data Access

### Admin
- Full access to all tables
- Can query all users, nutritionists, and patients

### Nutritionist
- Read/write own nutritionist profile
- Read/write own invite codes
- Read/write patients where `patients.nutritionistId = current_user.nutritionistId`
- No access to other nutritionists' data

### Patient
- Read/write own patient profile
- Read own nutritionist (basic info only)
- No access to other patients' data

---

## Migration Strategy

1. Create `users` table
2. Create `nutritionists` table with FK to users
3. Create `patients` table with FK to users and nutritionists
4. Create `inviteCodes` table with FK to nutritionists and patients
5. Add indexes for performance
6. Seed initial admin user (optional)

---

---

### progress
Patient progress tracking with detailed body composition and measurements.

```typescript
{
  id: serial (PK)
  patientId: integer (FK -> patients.id, not null)

  // Body Composition
  bodyFatPercentage: decimal(4,2)
  height: decimal(5,2)
  totalWeight: decimal(5,2)
  bmi: decimal(4,2)

  // Perimeters - Trunk (cm)
  perimeterChest: decimal(5,2)
  perimeterShoulder: decimal(5,2)
  perimeterWaist: decimal(5,2)
  perimeterAbdomen: decimal(5,2)
  perimeterHip: decimal(5,2)

  // Perimeters - Upper Limbs (cm)
  perimeterBicepsLeftRelaxed: decimal(5,2)
  perimeterBicepsLeftContracted: decimal(5,2)
  perimeterBicepsRightRelaxed: decimal(5,2)
  perimeterBicepsRightContracted: decimal(5,2)
  perimeterForearmLeft: decimal(5,2)
  perimeterForearmRight: decimal(5,2)

  // Perimeters - Lower Limbs (cm)
  perimeterThighProximalLeft: decimal(5,2)
  perimeterThighProximalRight: decimal(5,2)
  perimeterThighMedialLeft: decimal(5,2)
  perimeterThighMedialRight: decimal(5,2)
  perimeterThighDistalLeft: decimal(5,2)
  perimeterThighDistalRight: decimal(5,2)
  perimeterCalfLeft: decimal(5,2)
  perimeterCalfRight: decimal(5,2)

  // Skinfolds (mm)
  skinfoldBiceps: decimal(5,2)
  skinfoldTriceps: decimal(5,2)
  skinfoldAxillary: decimal(5,2)
  skinfoldSuprailiac: decimal(5,2)
  skinfoldAbdominal: decimal(5,2)
  skinfoldSubscapular: decimal(5,2)
  skinfoldChest: decimal(5,2)
  skinfoldThigh: decimal(5,2)
  skinfoldCalf: decimal(5,2)

  createdAt: timestamp (default: now)
  updatedAt: timestamp (default: now)
}
```

**Indexes:**
- patientId
- createdAt

**Relationships:**
- Belongs to `patients`

---

## Future Tables (Planned)

- `mealPlans` - Nutrition plans created by nutritionists
- `meals` - Individual meals logged by patients
- `appointments` - Scheduled consultations
- `messages` - Communication between nutritionist and patient

---

Last Updated: 2026-01-28
