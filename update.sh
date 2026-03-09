#!/bin/bash

# EstateBANK.in Quick Update Script
# Run this after uploading new files or pulling code to deploy changes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project directory
cd /opt/estatebank/estatebank-prod

echo -e "${GREEN}🚀 Starting EstateBANK.in update...${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Pull latest code if git repository exists
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull || echo -e "${YELLOW}⚠️  Git pull failed, continuing with current code...${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping git pull...${NC}"
fi

# Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build --no-cache

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

# Wait for containers to be healthy
echo -e "${YELLOW}⏳ Waiting for containers to be healthy...${NC}"
sleep 10

# Check container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker compose ps

# Test health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy!${NC}"
else
    echo -e "${RED}⚠️  Health check failed. Check logs with: docker compose logs app${NC}"
fi

echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "  View logs: docker compose logs -f app"
echo "  Check status: docker compose ps"
echo "  Health check: curl http://localhost:3000/api/health"
