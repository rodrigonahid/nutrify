# Progress Tracking Feature

## Overview
The Progress Tracking feature allows professionals to record and track detailed body composition and measurement data for their patients over time. Patients can view their historical progress data.

## Data Structure

### Body Composition
Macroscopic data and calculated indices.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `bodyFatPercentage` | Decimal(4,2) | Body fat percentage | 8.50% |
| `height` | Decimal(5,2) | Height in meters | 1.71 m |
| `totalWeight` | Decimal(5,2) | Weight in kilograms | 67.2 kg |
| `bmi` | Decimal(4,2) | Body Mass Index (calculated) | 23.0 |

### Perimeters (Circumferences)
All measurements in centimeters (cm).

#### Trunk
| Field | Type | Description |
|-------|------|-------------|
| `perimeterChest` | Decimal(5,2) | Chest circumference |
| `perimeterShoulder` | Decimal(5,2) | Shoulder circumference |
| `perimeterWaist` | Decimal(5,2) | Waist circumference |
| `perimeterAbdomen` | Decimal(5,2) | Abdomen circumference |
| `perimeterHip` | Decimal(5,2) | Hip circumference |

#### Upper Limbs (Arms)
| Field | Type | Description |
|-------|------|-------------|
| `perimeterBicepsLeftRelaxed` | Decimal(5,2) | Left biceps (relaxed) |
| `perimeterBicepsLeftContracted` | Decimal(5,2) | Left biceps (contracted) |
| `perimeterBicepsRightRelaxed` | Decimal(5,2) | Right biceps (relaxed) |
| `perimeterBicepsRightContracted` | Decimal(5,2) | Right biceps (contracted) |
| `perimeterForearmLeft` | Decimal(5,2) | Left forearm |
| `perimeterForearmRight` | Decimal(5,2) | Right forearm |

#### Lower Limbs (Legs)
| Field | Type | Description |
|-------|------|-------------|
| `perimeterThighProximalLeft` | Decimal(5,2) | Left thigh (proximal) |
| `perimeterThighProximalRight` | Decimal(5,2) | Right thigh (proximal) |
| `perimeterThighMedialLeft` | Decimal(5,2) | Left thigh (medial) |
| `perimeterThighMedialRight` | Decimal(5,2) | Right thigh (medial) |
| `perimeterThighDistalLeft` | Decimal(5,2) | Left thigh (distal) |
| `perimeterThighDistalRight` | Decimal(5,2) | Right thigh (distal) |
| `perimeterCalfLeft` | Decimal(5,2) | Left calf (panturrilha) |
| `perimeterCalfRight` | Decimal(5,2) | Right calf (panturrilha) |

### Skinfolds
All measurements in millimeters (mm) using a caliper (adipômetro).

| Field | Type | Description |
|-------|------|-------------|
| `skinfoldBiceps` | Decimal(5,2) | Biceps skinfold |
| `skinfoldTriceps` | Decimal(5,2) | Triceps skinfold |
| `skinfoldAxillary` | Decimal(5,2) | Mid-axillary skinfold |
| `skinfoldSuprailiac` | Decimal(5,2) | Suprailiac skinfold |
| `skinfoldAbdominal` | Decimal(5,2) | Abdominal skinfold |
| `skinfoldSubscapular` | Decimal(5,2) | Subscapular skinfold |
| `skinfoldChest` | Decimal(5,2) | Chest/Thoracic skinfold |
| `skinfoldThigh` | Decimal(5,2) | Thigh skinfold |
| `skinfoldCalf` | Decimal(5,2) | Calf skinfold |

## Features

### Professional Side

#### Patient Detail Page (`/professional/patients/:patientId`)
- Displays patient information
- Lists all progress entries with creation dates (col-12)
- Each progress entry is clickable to expand in a modal
- Header contains 3 action buttons (grid col-4):
  - **Subscription** (disabled for now)
  - **Diet** (disabled for now)
  - **Pictures** (disabled for now)
- Header contains "Add New Progress" button

#### Create Progress Page (`/professional/patients/:patientId/progress/create`)
- Form with all body composition, perimeter, and skinfold fields
- Submit creates new progress entry linked to patient
- Redirects back to patient detail page after creation

### Patient Side

#### Progress List Page (`/patient/progress`)
- Lists all progress entries for the logged-in patient
- Displays creation dates
- Clickable entries redirect to detail view

#### Progress Detail Page (`/patient/progress/:progressId`)
- Displays all progress data:
  - Body composition metrics
  - All perimeter measurements
  - All skinfold measurements
- Read-only view
- Shows comparison with previous entry (if available)

## Variation Calculation

**Important**: The database stores only absolute values. Variations (deltas like "+3.5" or "-0.5") are calculated dynamically by:
1. Fetching the previous progress entry for the same patient
2. Computing the difference between current and previous values
3. Displaying the variation in the UI

This approach:
- Prevents data duplication
- Ensures variations are always accurate
- Simplifies data entry (professionals only enter current values)

## Database Design

### Table: `progress`

```typescript
{
  id: serial (PK)
  patientId: integer (FK -> patients.id, not null)

  // Body Composition
  bodyFatPercentage: decimal(4,2)
  height: decimal(5,2)
  totalWeight: decimal(5,2)
  bmi: decimal(4,2)

  // Perimeters - Trunk
  perimeterChest: decimal(5,2)
  perimeterShoulder: decimal(5,2)
  perimeterWaist: decimal(5,2)
  perimeterAbdomen: decimal(5,2)
  perimeterHip: decimal(5,2)

  // Perimeters - Upper Limbs
  perimeterBicepsLeftRelaxed: decimal(5,2)
  perimeterBicepsLeftContracted: decimal(5,2)
  perimeterBicepsRightRelaxed: decimal(5,2)
  perimeterBicepsRightContracted: decimal(5,2)
  perimeterForearmLeft: decimal(5,2)
  perimeterForearmRight: decimal(5,2)

  // Perimeters - Lower Limbs
  perimeterThighProximalLeft: decimal(5,2)
  perimeterThighProximalRight: decimal(5,2)
  perimeterThighMedialLeft: decimal(5,2)
  perimeterThighMedialRight: decimal(5,2)
  perimeterThighDistalLeft: decimal(5,2)
  perimeterThighDistalRight: decimal(5,2)
  perimeterCalfLeft: decimal(5,2)
  perimeterCalfRight: decimal(5,2)

  // Skinfolds
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
- `patientId` (for efficient querying)
- `createdAt` (for sorting)

**Relationships:**
- Belongs to `patients`
- One patient has many progress entries

## API Endpoints

### Professional
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/professional/patients/:patientId/progress` | List all progress for a patient |
| POST | `/api/professional/patients/:patientId/progress` | Create new progress entry |
| GET | `/api/professional/patients/:patientId/progress/:progressId` | Get single progress entry |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/progress` | List own progress entries |
| GET | `/api/patient/progress/:progressId` | Get single progress entry |

## Implementation Checklist

### Database
- [x] Add `progress` table to schema
- [x] Add relationships to `patients` table
- [x] Push schema to database
- [x] Update TypeScript types

### API Routes
- [x] `POST /api/professional/patients/:patientId/progress` - Create progress
- [x] `GET /api/professional/patients/:patientId/progress` - List progress
- [x] `GET /api/professional/patients/:patientId/progress/:progressId` - Get progress
- [x] `GET /api/patient/progress` - List own progress
- [x] `GET /api/patient/progress/:progressId` - Get own progress

### UI Pages
- [x] `/professional/patients/:patientId` - Patient detail with progress list
- [x] `/professional/patients/:patientId/progress/create` - Create progress form
- [x] `/patient/progress` - Progress list
- [x] `/patient/progress/:progressId` - Progress detail

### Validation
- [x] Create Zod schemas for progress data
- [x] Validate all numeric fields
- [x] Ensure patient ownership on patient routes

### UI Components
- [x] Progress list item component
- [x] Progress detail modal (professional side)
- [x] Progress creation form
- [x] Variation display component (shows deltas)

---

Last Updated: 2026-01-28
