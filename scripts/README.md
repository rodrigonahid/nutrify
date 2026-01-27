# CLI Scripts

Command-line tools for managing Nutrify users.

## Prerequisites

1. **Docker must be running** with the PostgreSQL container:
   ```bash
   docker compose up -d
   ```

2. **Schema must be pushed** to the database:
   ```bash
   npm run db:push
   ```

## Available Scripts

### Create Admin User

```bash
npm run create:admin
```

Creates a new admin user with full platform access.

### Create Nutritionist User

```bash
npm run create:nutritionist
```

Creates a new nutritionist who can manage patients.

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
