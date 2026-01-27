# CLI Scripts

Command-line scripts for user management and system administration.

---

## Create Admin User

**Command:** `npm run create:admin`

**Purpose:** Create a new admin user for platform management

**Prompts:**
1. Email address
2. Password (hidden input)
3. Confirm password (hidden input)

**Validation:**
- Email format validation
- Email uniqueness check
- Password minimum length (8 characters)
- Password confirmation match
- Password strength requirements (optional: uppercase, lowercase, number, special char)

**Output:**
```
✓ Admin user created successfully
  Email: admin@example.com
  Role: admin
  Created: 2026-01-26 10:30:45
```

**Error Handling:**
- Email already exists → Show error, exit
- Passwords don't match → Re-prompt for passwords
- Database connection error → Show error with details

**Implementation File:** `scripts/create-admin.ts`

---

## Create Nutritionist User

**Command:** `npm run create:nutritionist`

**Purpose:** Create a new nutritionist account via CLI

**Prompts:**
1. Email address
2. Password (hidden input)
3. Confirm password (hidden input)
4. Professional license number (optional)
5. Specialization (optional)
6. Bio (optional)

**Validation:**
- Same email/password validation as admin
- License format validation (if provided)

**Output:**
```
✓ Nutritionist user created successfully
  Email: nutritionist@example.com
  Role: nutritionist
  License: NUT-12345
  Created: 2026-01-26 10:35:12
```

**Error Handling:**
- Same as admin creation
- Partial success handling (user created but profile failed)

**Implementation File:** `scripts/create-nutritionist.ts`

---

## Future Scripts (Planned)

### List Users
**Command:** `npm run list:users [role]`
- Display all users or filter by role
- Show user count and basic info

### Delete User
**Command:** `npm run delete:user <email>`
- Remove user and all associated data
- Require confirmation prompt

### Reset Password
**Command:** `npm run reset:password <email>`
- Generate temporary password
- Force password change on next login

### Seed Database
**Command:** `npm run db:seed`
- Create demo admin, nutritionists, and patients
- Generate sample data for testing

---

## Script Setup

### package.json additions:
```json
{
  "scripts": {
    "create:admin": "tsx scripts/create-admin.ts",
    "create:nutritionist": "tsx scripts/create-nutritionist.ts"
  }
}
```

### Dependencies needed:
- `tsx` - TypeScript execution
- `@inquirer/prompts` - Interactive prompts
- `chalk` - Colored output
- `bcrypt` or `@node-rs/argon2` - Password hashing

---

Last Updated: 2026-01-26
