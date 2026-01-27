# Nutrify

A nutrition management platform connecting nutritionists with their patients.

## Overview

Nutrify is a multi-role application that enables:
- **Admins** to manage the platform and nutritionists
- **Nutritionists** to manage their patients and create nutrition plans
- **Patients** to track their progress and follow meal plans

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## Documentation

Complete documentation is available in the [`/docs`](./docs) folder:

- [Project Overview](./docs/PROJECT_OVERVIEW.md) - App features and roadmap
- [Authentication System](./docs/AUTHENTICATION.md) - User roles and auth flows
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Database design
- [CLI Scripts](./docs/CLI_SCRIPTS.md) - Admin command-line tools
- [Routes](./docs/ROUTES.md) - Application routing structure

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your PostgreSQL connection string:
```
DATABASE_URL=postgresql://user:password@localhost:5432/nutrify
```

3. Push the database schema:
```bash
npm run db:push
```

4. Create an admin user:
```bash
npm run create:admin
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

### User Management
- `npm run create:admin` - Create admin user (CLI)
- `npm run create:nutritionist` - Create nutritionist user (CLI)

## Project Status

🟡 **In Development** - Phase 1: Authentication & User Management

See [docs/README.md](./docs/README.md) for detailed status and progress tracking.
