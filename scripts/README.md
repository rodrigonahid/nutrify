# CLI Scripts

Command-line tools for managing Nutrify database and test data.

## Prerequisites

1. **Docker must be running** with the PostgreSQL container:
   ```bash
   docker compose up -d
   ```

2. **Database URL** must point to local database in `.env`:
   ```
   DATABASE_URL=postgresql://nutrify:nutrify_dev_password@localhost:5432/nutrify
   ```

3. **Schema must be pushed** to the database (or use `npm run db:reset`):
   ```bash
   npm run db:push
   ```

## Quick Start

**Reset database and populate with test data:**
```bash
npm run db:reset && npm run seed
```

This gives you:
- 1 admin, 2 nutritionists, 10 patients
- ~40 appointments (past and upcoming)
- All with default password: `Test1234`

---

## Database Management

### Reset Database

```bash
npm run db:reset
```

**What it does:**
- Stops and removes Docker containers/volumes
- Removes orphaned volumes
- Starts fresh database container
- Drops and recreates schema
- Creates all tables

**Use when:**
- You want a completely clean database
- You're getting duplicate key errors
- Database state is corrupted

---

### Seed Database

```bash
npm run seed
```

**What it creates:**

**Admin (1)**
- `admin@nutrify.com`

**Nutritionists (2)**
- `nutritionist1@nutrify.com` - Dr. Sarah Johnson (Sports Nutrition)
- `nutritionist2@nutrify.com` - Dr. Michael Chen (Clinical Nutrition)

**Patients (10)**
- `patient1@test.com` through `patient10@test.com`
- Alternately assigned to the two nutritionists (5 each)
- Random dates of birth (1970-2005)
- Random height (160-190 cm) and weight (50-100 kg)
- Invite codes already marked as used

**Appointments (30-50)**
- 3-5 appointments per patient
- **Past** (-60 to -2 days): Status = `completed` or `cancelled`
- **Recent** (today/yesterday): Status = `confirmed`
- **Future** (+1 to +30 days): Status = `confirmed`, `pending`, or `requested`
- Random times between 8:00 AM - 6:00 PM
- Durations: 30, 45, or 60 minutes

**Default password for all users:** `Test1234`

---

## User Management

### Create Admin User

```bash
npm run create:admin
```

Interactive CLI to create a new admin user with full platform access.

**Prompts:**
- Email address
- Password (with confirmation)

---

### Create Nutritionist User

```bash
npm run create:professional
```

Interactive CLI to create a new nutritionist who can manage patients.

**Prompts:**
- Email address
- Password (with confirmation)
- Name
- Professional license number
- Specialization
- Bio

---

## Test Data Generation

### Generate Meal Plans

```bash
npm run generate:meals
```

Interactive CLI to generate meal plans for a specific patient.

**How it works:**
1. **Select patient** from dropdown
2. **Choose meal plan templates** (multi-select):
   - Weight Loss Plan
   - Muscle Gain Plan
   - Vegetarian Plan
   - Low Carb Plan
   - Balanced Diet Plan
3. **Confirm** generation

**Each meal plan includes:**
- Breakfast (7:00 AM) - Multiple options
- Morning Snack (10:00 AM)
- Lunch (1:00 PM) - Multiple options
- Afternoon Snack (4:00 PM)
- Dinner (7:00 PM) - Multiple options

**Each meal option includes:**
- Ingredients with exact quantities
- Units (g, ml, spoons, cups, units)
- Preparation notes

**Requirements:**
- At least one patient must exist in the database

---

### Generate Progress Entries

```bash
npm run generate:progress
```

Generates 5 progressive test entries for a selected patient. Creates realistic data showing improvement over time.

**How it works:**
1. **Select patient** from dropdown
2. Generates 5 progress entries spaced 1 week apart

**What it generates:**
- Progressive improvements:
  - Weight loss: 1.5 kg per entry
  - Body fat reduction: 1.2% per entry
  - Waist reduction: 2 cm per entry
  - Muscle gain in arms and legs
  - Skinfold thickness reduction

**Requirements:**
- At least one patient must exist in the database

**Use case:**
Perfect for testing progress tracking features, delta indicators, and visualizations without manually entering data.

---

### Generate Appointments

```bash
npm run generate:appointments
```

Interactive CLI to generate appointments for a specific patient.

**How it works:**
1. **Select patient** from dropdown
2. Generates multiple appointments with varying dates and statuses

**Requirements:**
- At least one patient must exist in the database

---

## Database Tools

### Generate Migrations

```bash
npm run db:generate
```

Generates migration files from schema changes.

---

### Run Migrations

```bash
npm run db:migrate
```

Runs pending migrations against the database.

---

### Push Schema

```bash
npm run db:push
```

Pushes schema directly to database (development only).

---

### Open Database Studio

```bash
npm run db:studio
```

Opens Drizzle Studio GUI to inspect and edit database data in your browser.

---

## Common Workflows

### Starting Fresh

```bash
npm run db:reset && npm run seed
```

Complete database reset with test data.

---

### Testing Meal Plans

```bash
npm run seed
npm run generate:meals
# Select a patient and generate meal plans
```

---

### Testing Progress Tracking

```bash
npm run seed
npm run generate:progress
# Select a patient and view progress over time
```

---

### Adding Custom Data

```bash
npm run seed                    # Get base data
npm run generate:meals          # Add meal plans for specific patients
npm run generate:progress       # Add progress tracking for specific patients
npm run generate:appointments   # Add more appointments for specific patients
```

---

## Password Requirements

**Default seeded data:** All users have password `Test1234`

**Custom users:** Passwords are flexible (can be any length/complexity)

---

## Troubleshooting

### "Duplicate key error" when seeding

**Solution:**
```bash
npm run db:reset && npm run seed
```

### "Database connection error"

**Check:**
1. Docker is running: `docker ps` (should show `nutrify-db`)
2. `.env` has correct DATABASE_URL (local, not Supabase)
3. Database container is healthy: `docker compose logs postgres`

**Fix:**
```bash
docker compose down
docker compose up -d
npm run db:push
```

### Can't connect to Drizzle Studio

**Solution:**
```bash
docker compose up -d
npm run db:studio
```

Then open the URL shown in terminal (usually `https://local.drizzle.studio`)

---

## File Locations

- **Scripts**: `/scripts/*.ts`
- **Database Schema**: `/src/db/schema.ts`
- **Database Config**: `/drizzle.config.ts`
- **Environment**: `/.env`
- **Docker Config**: `/docker-compose.yml`

---

Last updated: 2026-02-01
