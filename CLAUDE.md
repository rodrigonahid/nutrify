# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nutrify is a nutrition management platform connecting nutritionists with their patients. It's a Next.js 16 application using the App Router with a PostgreSQL database via Drizzle ORM.

**Current Phase**: Authentication & User Management (in development)

## Development Commands

### Running the Application
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Operations
```bash
docker compose up -d     # Start PostgreSQL container
docker compose down      # Stop PostgreSQL container
docker compose down -v   # Stop and delete all data

npm run db:push          # Push schema to database (use during development)
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio GUI for database inspection
```

### User Management
```bash
npm run create:admin            # Interactive CLI to create admin user
npm run create:professional     # Interactive CLI to create nutritionist user
```

## Architecture Overview

### Authentication System

**Session-based authentication** using HTTP-only cookies stored in PostgreSQL:
- Session duration: 7 days
- Password hashing: Argon2 (via `@node-rs/argon2`)
- Session management: `/src/lib/session.ts`
- Password utilities: `/src/lib/auth.ts`

**Key authentication utilities:**
- `createSession(userId)` - Creates session token and sets cookie
- `getSession()` - Retrieves current user from session cookie
- `destroySession()` - Logout functionality
- `requireAuth()` - Throws if not authenticated
- `requireRole(role)` - Throws if user doesn't have specified role

**Middleware**: `/src/middleware.ts` protects routes at the request level based on session cookie presence.

**API Routes**:
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current authenticated user

### User Roles & Database Schema

**Three user roles** (defined in `src/db/schema.ts`):
1. **Admin**: Platform administrator, manages nutritionists
2. **Professional**: Nutritionist who manages patients via invite codes
3. **Patient**: End user linked to a specific nutritionist

**Database tables**:
- `users` - Core authentication (email, passwordHash, role)
- `professionals` - Nutritionist profiles (license, specialization, bio)
- `patients` - Patient profiles (dateOfBirth, height, weight, medicalNotes)
- `inviteCodes` - Professional invitation system for patient signup
- `sessions` - Session management

**Key relationships**:
- One user → one professional OR one patient (based on role)
- One professional → many patients
- One professional → many invite codes
- Patients are linked to professionals via invite codes

### Source Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Root page (redirects by role)
│   ├── login/             # Login page
│   ├── admin/             # Admin dashboard
│   ├── professional/      # Nutritionist dashboard
│   ├── patient/           # Patient dashboard
│   └── api/auth/          # Authentication API endpoints
├── db/
│   ├── schema.ts          # Drizzle ORM schema (5 tables)
│   ├── index.ts           # Database client
│   └── types.ts           # TypeScript types from schema
├── lib/
│   ├── auth.ts            # Password hashing/verification (Argon2)
│   ├── session.ts         # Session management
│   ├── validation.ts      # Zod validation schemas
│   └── utils.ts           # Tailwind merge utilities
├── components/
│   └── ui/                # shadcn/ui components (Button, Card, Input, Label)
└── middleware.ts          # Route protection middleware

scripts/
├── create-admin.ts         # CLI to create admin users
└── create-professional.ts  # CLI to create nutritionist users
```

### Page Protection Patterns

**Server-side protection** (recommended for dashboards):
```typescript
import { requireAuth, requireRole } from '@/lib/session'

export default async function AdminPage() {
  const user = await requireAuth() // Throws if not authenticated
  await requireRole('admin')        // Throws if not admin role
  // ... rest of component
}
```

**Client-side forms** use `"use client"` directive and call API endpoints.

**Middleware** redirects unauthenticated users to `/login?redirect=/original-path`.

### UI Components

**Component library**: shadcn/ui with Tailwind CSS v4
- Install new components: Follow shadcn/ui docs, they go in `src/components/ui/`
- Icon library: `lucide-react`
- Styling utility: `cn()` function combines `clsx` + `tailwindcss/merge`

**Theming**: Uses CSS variables with OKLCH color space in `src/app/globals.css`

## Development Workflow

### Initial Setup
1. `npm install`
2. `docker compose up -d` (starts PostgreSQL)
3. `npm run db:push` (creates tables)
4. `npm run create:admin` (creates first admin user)
5. `npm run dev`

### Making Database Changes
1. Edit `src/db/schema.ts`
2. Run `npm run db:push` to update database
3. For production, use `npm run db:generate` then `npm run db:migrate`

### Adding New Routes
- Server pages go in `src/app/[route]/page.tsx`
- Use `requireAuth()` and `requireRole()` for protection
- Add route to middleware public/protected lists if needed

### Validation
- Use Zod schemas from `src/lib/validation.ts`
- Add new validation schemas to this file for consistency

### Documentation Maintenance

**IMPORTANT**: The `/docs` directory contains comprehensive documentation that MUST be kept up-to-date with code changes.

**Update documentation whenever:**
- New features are added
- Routes are changed or added
- Database schema is modified
- User roles or permissions change
- CLI scripts are added or modified

**Update process:**
1. Make code changes
2. Update relevant `/docs/*.md` file(s)
3. Update "Last Updated" date at bottom of documentation file
4. Commit documentation changes WITH code changes (same commit)

**Key documentation files:**
- `/docs/PROJECT_OVERVIEW.md` - Features and roadmap
- `/docs/AUTHENTICATION.md` - Auth flows and security
- `/docs/DATABASE_SCHEMA.md` - Database design and relationships
- `/docs/CLI_SCRIPTS.md` - Command-line tools
- `/docs/ROUTES.md` - Application routing structure
- `/docs/PROGRESS.md` - Implementation status tracking

## Important Notes

- **Database**: Development uses Docker Compose with PostgreSQL. Connection details in `docker-compose.yml` and `.env`
- **Type Safety**: Drizzle generates types from schema, available in `src/db/types.ts`
- **CLI Scripts**: Use `tsx` to run TypeScript directly (see `scripts/` directory)
- **Documentation**: Comprehensive docs in `/docs` directory covering authentication, database schema, routes, and progress tracking
