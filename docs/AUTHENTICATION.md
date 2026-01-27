# Authentication & Authorization

## User Roles

### 1. Admin
**Capabilities:**
- Create and manage nutritionist accounts
- View all nutritionists and their patient counts
- Access system-wide analytics
- Manage platform settings

**Creation Method:**
- CLI script that prompts for email and password
- Command: `npm run create:admin`

**Access Level:** Full system access

---

### 2. Nutritionist
**Capabilities:**
- Create and manage their own patients
- Generate patient invite codes
- View their patient list
- Access patient nutrition data
- Create meal plans and track progress

**Creation Methods:**
1. CLI script: `npm run create:nutritionist`
2. Via Admin dashboard (manual creation)

**Access Level:** Own patients only

---

### 3. Patient
**Capabilities:**
- View their own nutrition plans
- Track meals and progress
- Communicate with assigned nutritionist
- Update personal information

**Creation Method:**
- Self-registration using invite code from nutritionist
- Invite code stored as secure cookie for initial authentication

**Access Level:** Own data only

---

## Authentication Flow

### Admin Login
1. Navigate to `/admin/login`
2. Enter email and password
3. Session created with admin privileges
4. Redirect to admin dashboard

### Nutritionist Login
1. Navigate to `/nutritionist/login`
2. Enter email and password
3. Session created with nutritionist privileges
4. Redirect to nutritionist dashboard

### Patient Onboarding
1. Nutritionist generates unique invite code
2. Patient receives code from nutritionist (external communication)
3. Patient navigates to `/signup?code={invite-code}`
4. Code is validated and linked to nutritionist
5. Patient enters email, password, and basic info
6. Account created and code stored as cookie
7. Patient logged in and redirected to dashboard

---

## Security Considerations

### Password Storage
- Passwords hashed using bcrypt or Argon2
- Minimum password requirements enforced
- No plain text password storage

### Invite Codes
- Generated as secure random tokens (UUID or similar)
- One-time use (marked as used after signup)
- Expiration time (optional: 7 days)
- Tied to specific nutritionist

### Session Management
- HTTP-only cookies for session tokens
- Secure flag in production
- Session timeout after inactivity
- Refresh token strategy (if needed)

### Role-Based Access Control (RBAC)
- Middleware checks user role on protected routes
- API endpoints validate permissions
- Database queries filtered by user relationships

---

## Database Schema Requirements

### Users Table
- id, email, password_hash, role (enum: admin, nutritionist, patient)
- created_at, updated_at
- Relationships based on role

### Nutritionists Table (extends User)
- user_id (FK to users)
- professional_license
- specialization
- bio

### Patients Table (extends User)
- user_id (FK to users)
- nutritionist_id (FK to nutritionists)
- date_of_birth
- height, weight
- medical_notes

### Invite Codes Table
- id, code (unique)
- nutritionist_id (FK)
- used (boolean)
- used_by (FK to patients, nullable)
- expires_at
- created_at

---

## Implementation Checklist

- [ ] Database schema creation
- [ ] User authentication (email/password)
- [ ] Password hashing utility
- [ ] CLI script: create admin user
- [ ] CLI script: create nutritionist user
- [ ] Invite code generation system
- [ ] Patient signup with invite code validation
- [ ] Session management
- [ ] Role-based middleware
- [ ] Admin dashboard: nutritionist list
- [ ] Admin: create nutritionist UI
- [ ] Nutritionist dashboard
- [ ] Nutritionist: generate invite codes
- [ ] Nutritionist: patient list view
- [ ] Patient dashboard (basic)

---

Last Updated: 2026-01-26
