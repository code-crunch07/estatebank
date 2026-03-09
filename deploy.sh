#!/bin/bash

# EstateBANK.in Docker Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting EstateBANK.in deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template...${NC}"
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}⚠️  Please edit .env.production with your actual values before continuing.${NC}"
        read -p "Press Enter to continue after editing .env.production..."
    else
        echo -e "${RED}❌ .env.production.example not found. Please create .env.production manually.${NC}"
        exit 1
    fi
fi

# Pull latest code (if using Git)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull || echo "⚠️  Git pull failed, continuing with current code..."
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker compose build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Start containers
echo "🚀 Starting containers..."
docker compose up -d

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Health check
echo "🏥 Checking application health..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is running!${NC}"
        echo ""
        echo "🌐 Application URL: http://localhost:3002 (estatebank.in)"
        echo "📊 View logs: docker compose logs -f app"
        echo "🛑 Stop application: docker compose down"
        exit 0
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Waiting for application... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

echo -e "${RED}❌ Application failed to start. Check logs with: docker compose logs app${NC}"
docker compose logs app
exit 1
