# Nutrify Documentation

Welcome to the Nutrify project documentation. These files track the app's features, architecture, and implementation progress.

## 📚 Documentation Index

### [Project Overview](./PROJECT_OVERVIEW.md)
High-level overview of the application, target users, core features, and tech stack.

### [Authentication & Authorization](./AUTHENTICATION.md)
Complete authentication system design including:
- User roles (Admin, Nutritionist, Patient)
- Authentication flows
- Security considerations
- Implementation checklist

### [Database Schema](./DATABASE_SCHEMA.md)
Database design and relationships:
- Table structures
- Entity relationships
- Role-based access patterns
- Migration strategy

### [CLI Scripts](./CLI_SCRIPTS.md)
Command-line tools for user management:
- Create admin user
- Create nutritionist user
- Future admin tools

### [Simplified Signup Flow](./SIMPLIFIED_SIGNUP_FLOW.md)
New simplified patient signup process:
- 8-digit invite codes instead of UUIDs
- Direct signup from login page
- Easy code sharing via SMS/verbal communication
- Implementation guide and migration strategy

### [Application Routes](./ROUTES.md)
Complete routing structure:
- Public routes
- Admin dashboard routes
- Nutritionist dashboard routes
- Patient dashboard routes
- API endpoints

### [Progress Tracker](./PROGRESS.md)
Implementation status and task tracking:
- Completed features
- Work in progress
- Planned features
- Blockers and next steps

---

## 🔄 Keeping Documentation Updated

**These docs should be updated whenever:**
- New features are added
- Routes are changed or added
- Database schema is modified
- User roles or permissions change
- CLI scripts are added or modified

**Update Process:**
1. Make code changes
2. Update relevant .md file(s)
3. Update "Last Updated" date at bottom of file
4. Commit docs with code changes

---

## 📝 Current Status

**Phase:** Authentication & User Management

**Completed:**
- ✅ Next.js + Drizzle setup
- ✅ shadcn/ui setup
- ✅ Documentation structure

**In Progress:**
- 🟡 Database schema implementation
- 🟡 CLI scripts for user creation

**Planned:**
- ⏳ Authentication system
- ⏳ Admin dashboard
- ⏳ Nutritionist dashboard
- ⏳ Patient signup flow

---

Last Updated: 2026-01-26
