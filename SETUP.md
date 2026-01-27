# Nutrify Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL with:
- Database: `nutrify`
- User: `nutrify`
- Password: `nutrify_dev_password`
- Port: `5432`

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Create Admin User

```bash
npm run create:admin
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start PostgreSQL |
| `docker compose down` | Stop PostgreSQL |
| `docker compose down -v` | Stop and delete data |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio GUI |

## User Management

| Command | Description |
|---------|-------------|
| `npm run create:admin` | Create admin user |
| `npm run create:nutritionist` | Create nutritionist |

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

PostgreSQL is not running. Start it with:
```bash
docker compose up -d
```

### Database Does Not Exist

```
error: database "nutrify" does not exist
```

The Docker container wasn't created properly. Reset with:
```bash
docker compose down -v
docker compose up -d
npm run db:push
```
