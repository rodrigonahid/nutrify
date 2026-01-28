# Progress Tracking Feature

## Overview

Track patient health metrics over time, allowing professionals to monitor progress and patients to see their evolution.

---

## Database Schema

### New Table: `patient_progress`

```typescript
export const patientProgress = pgTable("patient_progress", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),

  // Measurements
  height: decimal("height", { precision: 5, scale: 2 }), // in meters (e.g., 1.71)
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg (e.g., 67.1)
  bmi: decimal("bmi", { precision: 4, scale: 2 }), // Body Mass Index (calculated)

  // Optional measurements
  waistCircumference: decimal("waist_circumference", { precision: 5, scale: 2 }), // in cm
  hipCircumference: decimal("hip_circumference", { precision: 5, scale: 2 }), // in cm
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 4, scale: 2 }), // percentage

  // Notes
  notes: text("notes"), // Professional's observations

  // Metadata
  recordedBy: integer("recorded_by")
    .notNull()
    .references(() => users.id), // Professional who recorded this
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patientProgressRelations = relations(patientProgress, ({ one }) => ({
  patient: one(patients, {
    fields: [patientProgress.patientId],
    references: [patients.id],
  }),
  recordedByUser: one(users, {
    fields: [patientProgress.recordedBy],
    references: [users.id],
  }),
}));
```

### Relationships

- **One patient** → **Many progress records**
- **One professional** → **Records many progress entries** (across all their patients)
- Progress records are ordered by `recordedAt` to show timeline

---

## Field Details

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `height` | decimal(5,2) | Height in meters | 1.71 |
| `weight` | decimal(5,2) | Weight in kg | 67.1 |
| `bmi` | decimal(4,2) | Body Mass Index (auto-calculated) | 23.0 |

**BMI Calculation:** `weight / (height * height)`

### Optional Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `waistCircumference` | decimal(5,2) | Waist in cm | 75.5 |
| `hipCircumference` | decimal(5,2) | Hip in cm | 95.0 |
| `bodyFatPercentage` | decimal(4,2) | Body fat % | 18.5 |
| `notes` | text | Professional observations | "Patient reports increased energy" |

### Metadata
| Field | Type | Description |
|-------|------|-------------|
| `recordedBy` | integer | User ID of professional who recorded |
| `recordedAt` | timestamp | When measurement was taken |
| `createdAt` | timestamp | When record was created in system |

---

## Features

### For Professionals

#### 1. Record New Progress Entry
**Location:** `/professional/patients/[id]/progress/new`

**Form Fields:**
- Date/Time of measurement (defaults to now)
- Height (m) - optional if already recorded
- Weight (kg) - required
- Waist circumference (cm) - optional
- Hip circumference (cm) - optional
- Body fat % - optional
- Notes - optional text area

**Behavior:**
- BMI calculated automatically when height + weight entered
- Shows BMI category (underweight, normal, overweight, obese)
- Validates measurements are reasonable
- Can record multiple entries per day

#### 2. View Patient Progress History
**Location:** `/professional/patients/[id]/progress`

**Display:**
- Timeline view (newest first)
- Table with all measurements
- Weight trend chart (line graph)
- BMI trend chart
- Comparison with previous entry (weight change, BMI change)
- Filter by date range

**Actions:**
- Add new entry
- Edit recent entry (within 24h)
- Delete entry (with confirmation)
- Export to PDF/CSV

#### 3. Progress Dashboard Widget
**Location:** `/professional/patients/[id]` (patient detail page)

**Shows:**
- Latest measurement (date, weight, BMI)
- Weight change from previous entry (+/- kg)
- Quick "Add Progress" button
- Mini chart (last 5 entries)

### For Patients

#### 1. View Own Progress
**Location:** `/patient/progress`

**Display:**
- Timeline of all entries
- Visual charts:
  - Weight over time (line chart)
  - BMI over time (line chart)
  - Body measurements comparison (if available)
- Latest measurements highlighted
- Progress milestones (e.g., "Lost 5kg!")

**Read-Only:**
- Patients can view but not edit/delete
- Shows who recorded each entry (professional name)

#### 2. Progress Summary Widget
**Location:** `/patient` (dashboard)

**Shows:**
- Current weight & BMI
- Weight change from start (+/- kg)
- Last recorded date
- Link to full progress page

---

## API Endpoints

### Professional Endpoints

```typescript
// Create new progress entry
POST /api/professional/patients/[patientId]/progress
Body: {
  height?: number,      // meters
  weight: number,       // kg
  waistCircumference?: number,
  hipCircumference?: number,
  bodyFatPercentage?: number,
  notes?: string,
  recordedAt?: string  // ISO date (defaults to now)
}
Response: { progress: ProgressRecord }

// List patient progress (with pagination)
GET /api/professional/patients/[patientId]/progress
Query: ?limit=20&offset=0&startDate=&endDate=
Response: {
  progress: ProgressRecord[],
  total: number,
  patient: { name, currentWeight, currentBMI }
}

// Get single progress entry
GET /api/professional/patients/[patientId]/progress/[id]
Response: { progress: ProgressRecord }

// Update progress entry (within 24h)
PATCH /api/professional/patients/[patientId]/progress/[id]
Body: { weight?, height?, notes?, ... }
Response: { progress: ProgressRecord }

// Delete progress entry
DELETE /api/professional/patients/[patientId]/progress/[id]
Response: { success: true }

// Get progress statistics
GET /api/professional/patients/[patientId]/progress/stats
Response: {
  totalEntries: number,
  firstEntry: ProgressRecord,
  latestEntry: ProgressRecord,
  weightChange: number,  // kg
  bmiChange: number,
  averageWeeklyChange: number
}
```

### Patient Endpoints

```typescript
// View own progress
GET /api/patient/progress
Query: ?limit=20&offset=0
Response: {
  progress: ProgressRecord[],
  total: number,
  stats: {
    currentWeight: number,
    currentBMI: number,
    totalWeightChange: number,
    startDate: string
  }
}

// Get own progress stats
GET /api/patient/progress/stats
Response: { /* same as professional stats */ }
```

---

## UI Components

### Charts & Visualizations

1. **Weight Line Chart**
   - X-axis: Date
   - Y-axis: Weight (kg)
   - Show trend line
   - Highlight current weight

2. **BMI Chart**
   - X-axis: Date
   - Y-axis: BMI
   - Color zones (underweight, normal, overweight, obese)
   - Show WHO BMI categories

3. **Progress Table**
   - Sortable columns
   - Show change from previous (+/- indicators)
   - Actions column (edit/delete for professionals)

### Forms

1. **Add Progress Entry Form**
   ```
   Date/Time: [datetime picker] (defaults to now)

   Measurements:
   Height (m):    [1.71] (optional if exists)
   Weight (kg):   [67.1] (required)

   Body Composition (optional):
   Waist (cm):    [75.5]
   Hip (cm):      [95.0]
   Body Fat (%):  [18.5]

   BMI: 23.0 (calculated, read-only)
   Category: Normal weight

   Notes:
   [Textarea for observations]

   [Cancel] [Save Entry]
   ```

---

## Business Rules

1. **BMI Calculation**
   - BMI = weight (kg) / height² (m)
   - Stored with 2 decimal places
   - Recalculated if weight or height changes

2. **BMI Categories (WHO Standard)**
   - < 18.5: Underweight
   - 18.5 - 24.9: Normal weight
   - 25.0 - 29.9: Overweight
   - ≥ 30.0: Obese

3. **Measurement Validation**
   - Height: 0.50m - 2.50m
   - Weight: 20kg - 300kg
   - Waist: 40cm - 200cm
   - Hip: 50cm - 200cm
   - Body fat: 0% - 60%

4. **Edit/Delete Permissions**
   - Professionals can edit entries within 24 hours of creation
   - Professionals can delete any entry (with confirmation)
   - Patients cannot edit or delete
   - Only the professional who recorded can edit/delete

5. **First Entry**
   - If patient has initial height/weight in profile, auto-create first progress entry
   - Or prompt professional to record initial measurements

---

## Data Migration

### Update Patients Table
- Keep existing `height` and `weight` fields
- These serve as "profile" values
- When first progress entry is created, copy from profile if available

### Initial Data
- For existing patients with height/weight in profile:
  - Option 1: Auto-create initial progress entry (recordedAt = account creation date)
  - Option 2: Leave empty, professional records first entry manually

---

## Implementation Phases

### Phase 1: Database & API (Backend)
- [ ] Create `patient_progress` table schema
- [ ] Add relations to existing tables
- [ ] Create API endpoints for professionals
- [ ] Create API endpoints for patients
- [ ] Add validation and business rules

### Phase 2: Professional UI
- [ ] Patient detail page progress widget
- [ ] Full progress page with table
- [ ] Add new progress entry form
- [ ] Edit/delete functionality
- [ ] Basic charts (weight, BMI)

### Phase 3: Patient UI
- [ ] Patient dashboard progress widget
- [ ] Full progress page (read-only)
- [ ] Charts and visualizations

### Phase 4: Advanced Features
- [ ] Export to PDF/CSV
- [ ] Progress goals and milestones
- [ ] Notifications (e.g., "Time for weekly weigh-in")
- [ ] Body measurements chart (waist/hip)
- [ ] Progress photos (future)

---

## Questions to Consider

1. **Frequency:** How often should professionals record progress?
   - Weekly? Bi-weekly? Monthly?
   - Should system suggest/remind?

2. **Privacy:** Should patients see notes field?
   - Yes (full transparency)
   - No (professional notes only)
   - Separate fields (patient-visible vs private)

3. **Initial Data:** For existing patients with profile height/weight?
   - Auto-create entry?
   - Manual entry?
   - Ignore?

4. **Units:** Support both metric and imperial?
   - Current: Metric only (kg, meters, cm)
   - Future: Add lb/ft conversion?

5. **Photos:** Include progress photos?
   - Future feature
   - Storage considerations
   - Privacy concerns

---

## Technical Notes

- Use `decimal` type for precise measurements (not `float`)
- BMI calculated on backend (not frontend) for consistency
- Soft delete option for progress entries (keep history)
- Index on `patientId` and `recordedAt` for fast queries
- Consider caching latest entry per patient

---

Last Updated: 2026-01-27
