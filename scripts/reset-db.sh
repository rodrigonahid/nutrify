#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗑️  Resetting Database...${NC}\n"

# Step 1: Stop and remove containers and volumes
echo -e "${YELLOW}Step 1: Stopping containers and removing volumes...${NC}"
docker compose down -v
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to stop containers${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Containers stopped and volumes removed${NC}\n"

# Step 2: Remove any orphaned volumes
echo -e "${YELLOW}Step 2: Checking for orphaned volumes...${NC}"
ORPHANED_VOLUMES=$(docker volume ls -q | grep nutrify)
if [ ! -z "$ORPHANED_VOLUMES" ]; then
  echo -e "${YELLOW}Found orphaned volumes, removing...${NC}"
  docker volume rm $ORPHANED_VOLUMES
  echo -e "${GREEN}✓ Orphaned volumes removed${NC}\n"
else
  echo -e "${GREEN}✓ No orphaned volumes found${NC}\n"
fi

# Step 3: Start fresh database
echo -e "${YELLOW}Step 3: Starting fresh database container...${NC}"
docker compose up -d
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to start database${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Database container started${NC}\n"

# Step 4: Wait for database to be ready
echo -e "${YELLOW}Step 4: Waiting for database to be ready...${NC}"
sleep 3
echo -e "${GREEN}✓ Database is ready${NC}\n"

# Step 5: Drop and recreate schema (ensures clean slate)
echo -e "${YELLOW}Step 5: Dropping and recreating schema...${NC}"
docker compose exec -T postgres psql -U nutrify -d nutrify -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" > /dev/null 2>&1
echo -e "${GREEN}✓ Schema reset${NC}\n"

# Step 6: Push schema to database
echo -e "${YELLOW}Step 6: Creating database schema...${NC}"
npm run db:push
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to create schema${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Database schema created${NC}\n"

echo -e "${GREEN}✅ Database reset complete!${NC}"
echo -e "${BLUE}You can now run: ${YELLOW}npm run seed${BLUE} to populate with test data${NC}\n"
