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

## Nutritionist Routes

**Base:** `/nutritionist`

### `/nutritionist/login`
- Nutritionist-specific login (optional)

### `/nutritionist/dashboard`
- Overview stats
- Total patients
- Recent patient activity
- Quick actions (generate code, view patients)

### `/nutritionist/patients`
- List all their patients
- Search and filter
- Patient stats overview

### `/nutritionist/patients/[id]`
- Patient profile
- Medical notes
- Nutrition plans
- Progress tracking

### `/nutritionist/invite-codes`
- View all generated codes
- Generate new invite code
- Code status (unused, used, expired)
- Copy code to clipboard

### `/nutritionist/invite-codes/generate`
- Form to generate new code
- Optional: Set expiration date
- Optional: Add note/label

### `/nutritionist/profile`
- Edit own profile
- Update credentials
- Professional information

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
- Weight tracking
- Measurement history
- Progress photos

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

### Patient
- `GET /api/patient/profile` - Get own profile
- `PATCH /api/patient/profile` - Update profile
- `GET /api/patient/nutritionist` - Get assigned nutritionist

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

Last Updated: 2026-01-26
