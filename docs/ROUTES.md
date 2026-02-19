# Application Routes

## Public Routes

### `/`
**Landing Page**
- App overview
- Features showcase
- Login/Signup CTAs

### `/login`
**Unified Login**
- Email and password fields
- Role detection based on database user role
- Redirects to appropriate dashboard based on role
- Includes "Create Account" link for patient signup

### `/signup`
**Patient Signup (Simplified)**
- Accessible from login page "Create Account" link
- No query parameters needed
- Form fields:
  - 8-digit invite code (validates instantly)
  - Email and password
  - Optional: date of birth, height, weight
- Creates patient account linked to nutritionist
- Auto-login after successful signup

---

## Admin Routes

**Base:** `/admin`

### `/admin/login`
- Admin-specific login page (optional, or use unified `/login`)

### `/admin/dashboard`
- Overview stats
- Total nutritionists
- Total patients
- Recent activity

### `/admin/nutritionists`
- List all nutritionists
- Patient count per nutritionist
- Actions: View details, Create new

### `/admin/nutritionists/create`
- Form to create new nutritionist
- Email, password, license, specialization, bio

### `/admin/nutritionists/[id]`
- Nutritionist details
- List of their patients
- Edit profile
- Deactivate account

---

## Nutritionist (Professional) Routes

**Base:** `/professional`

### `/professional`
- Dashboard with today's appointments carousel
- Quick actions: Pacientes, Consultas, Convites

### `/professional/patients`
- List all patients linked to this professional

### `/professional/patients/[id]`
- Patient profile with header (name, age, height, weight)
- Quick actions grid: Progresso, Planos alimentares, **Consultas**, Treino
- **Próxima consulta widget**: fetches earliest upcoming non-cancelled appointment; shows date, time, duration, status; links to patient appointments page; "Agendar" button opens modal with patient pre-selected
- Active meal plan widget
- Payment plan widget
- Recent progress widget

### `/professional/patients/[id]/appointments`
- **Patient-specific appointment history**
- Single flat list, newest date first (descending)
- No calendar view or filter pills — intentionally distinct from `/professional/appointments`
- "Agendar consulta" button opens modal with patient pre-selected
- Past date labels are muted; future labels are emphasized

### `/professional/patients/[id]/progress`
- Progress entries for this patient

### `/professional/patients/[id]/meal-plan`
- Meal plans for this patient

### `/professional/patients/[id]/training`
- Training plans for this patient

### `/professional/appointments`
- **All appointments across all patients** (merged Agenda + Consultas + Horários)
- Default view: calendar (react-big-calendar, month view)
- Toggle between calendar and list view
- Filter pills: Todos / Próximas / Anteriores
- "Adicionar horário" button opens create-appointment modal
- List view includes cancel (trash) button per row + cancel reason modal
- Calendar labels translated to PT-BR

### `/professional/schedules`
- **Redirects to `/professional/appointments`** (merged, no longer a separate page)

### `/professional/invite-codes`
- View all generated codes
- Generate new invite code
- Code status (unused, used, expired)

### `/professional/settings`
- Edit own profile and credentials

---

## Patient Routes

**Base:** `/patient`

### `/patient/dashboard`
- Overview of nutrition plan
- Recent meals
- Progress charts
- Upcoming appointments

### `/patient/profile`
- Edit personal information
- View assigned nutritionist
- Update measurements

### `/patient/meal-plan`
- View current meal plan
- Meal recommendations
- Daily/weekly goals

### `/patient/progress`
- List all progress entries
- Display creation dates
- Click to view details

### `/patient/progress/[id]`
- View single progress entry
- Body composition metrics
- All perimeter measurements
- All skinfold measurements
- Comparison with previous entry

### `/patient/meal-plan`
- List all meal plans
- Show active plan badge
- Display creation date and nutritionist
- Click to view full plan

### `/patient/meal-plan/[id]`
- View detailed meal plan
- All meals organized by time
- Multiple options per meal
- Ingredients with weights
- Preparation notes

### `/patient/nutritionist`
- View nutritionist profile
- Contact information
- Schedule consultation

---

## API Routes

**Base:** `/api`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/signup` - Patient signup with code
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update current user

### Admin
- `GET /api/admin/nutritionists` - List nutritionists
- `POST /api/admin/nutritionists` - Create nutritionist
- `GET /api/admin/nutritionists/[id]` - Get nutritionist
- `PATCH /api/admin/nutritionists/[id]` - Update nutritionist
- `DELETE /api/admin/nutritionists/[id]` - Deactivate nutritionist
- `GET /api/admin/stats` - Platform statistics

### Nutritionist
- `GET /api/nutritionist/patients` - List own patients
- `GET /api/nutritionist/patients/[id]` - Get patient details
- `POST /api/nutritionist/invite-codes` - Generate invite code
- `GET /api/nutritionist/invite-codes` - List own codes
- `PATCH /api/nutritionist/patients/[id]` - Update patient
- `GET /api/professional/patients/[patientId]/progress` - List patient progress
- `POST /api/professional/patients/[patientId]/progress` - Create progress entry
- `GET /api/professional/patients/[patientId]/progress/[id]` - Get progress entry
- `GET /api/professional/patients/[patientId]/meal-plan` - List meal plans
- `POST /api/professional/patients/[patientId]/meal-plan` - Create meal plan
- `GET /api/professional/patients/[patientId]/meal-plan/[id]` - Get meal plan details
- `PUT /api/professional/patients/[patientId]/meal-plan/[id]` - Update meal plan
- `DELETE /api/professional/patients/[patientId]/meal-plan/[id]` - Delete meal plan
- `PATCH /api/professional/patients/[patientId]/meal-plan/[id]` - Toggle active status

### Patient
- `GET /api/patient/profile` - Get own profile
- `PATCH /api/patient/profile` - Update profile
- `GET /api/patient/nutritionist` - Get assigned nutritionist
- `GET /api/patient/progress` - List own progress entries
- `GET /api/patient/progress/[id]` - Get own progress entry
- `GET /api/patient/meal-plan` - List own meal plans
- `GET /api/patient/meal-plan/[id]` - Get meal plan details

### Invite Codes
- `GET /api/invite-codes/validate?code={code}` - Validate 8-digit code
  - Returns: `{ valid: true/false, professional: {...}, error?: string }`

---

## Route Protection

### Middleware: `middleware.ts`
```typescript
// Public routes: /, /login, /signup
// Protected routes: All others
// Role-based access: Check user.role matches route prefix
```

### Protection Levels:
1. **Public** - No authentication required
2. **Authenticated** - Any logged-in user
3. **Role-specific** - Must have specific role
4. **Owner-only** - Must own the resource (e.g., patient accessing own data)

---

Last Updated: 2026-02-15

---

## Route Structure Summary

```
/
├── login
├── signup
├── admin/
│   └── professionals/
│       └── create
├── professional/
│   ├── appointments/          ← merged Agenda + Consultas + Horários
│   ├── schedules/             ← redirects to /professional/appointments
│   ├── invite-codes/
│   ├── settings/
│   └── patients/
│       └── [id]/
│           ├── appointments/  ← patient-specific list (newest first, no calendar)
│           ├── progress/
│           ├── meal-plan/
│           └── training/
└── patient/
    ├── progress/
    │   └── [id]
    └── meal-plan/
        └── [id]
```
