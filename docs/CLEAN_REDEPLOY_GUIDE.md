# Clean Production & Redeploy Guide

This guide will help you completely remove everything from production and redeploy fresh.

## ⚠️ IMPORTANT: Backup First!

Before removing anything, make sure you have:
- ✅ Database backup (MongoDB data)
- ✅ Environment variables saved (`.env` file)
- ✅ Any uploaded files/media backed up

---

## Step 1: Connect to Production Server

```bash
ssh your-user@your-server-ip
# or
ssh deploynew@your-vps-ip
```

Navigate to your project directory:
```bash
cd /opt/estatebank/estatebank-prod
# or wherever your project is located
```

---

## Step 2: Stop All Running Containers

```bash
# Stop and remove all containers
docker compose down

# Or if using docker-compose (older version)
docker-compose down
```

---

## Step 3: Remove All Containers, Images, and Volumes

```bash
# Remove all containers (including stopped ones)
docker ps -a | grep estatebank | awk '{print $1}' | xargs docker rm -f

# Remove all images
docker images | grep estatebank | awk '{print $3}' | xargs docker rmi -f

# Or remove all Docker images (be careful!)
docker image prune -a -f

# Remove volumes (THIS WILL DELETE DATABASE DATA!)
docker volume ls | grep estatebank | awk '{print $2}' | xargs docker volume rm

# Or remove all unused volumes
docker volume prune -f
```

**⚠️ WARNING**: Removing volumes will delete your MongoDB data! Only do this if you have a backup or want to start fresh.

---

## Step 4: Clean Docker System (Optional but Recommended)

```bash
# Remove all unused containers, networks, images, and volumes
docker system prune -a --volumes -f

# This removes:
# - All stopped containers
# - All networks not used by at least one container
# - All images without at least one container associated
# - All build cache
# - All volumes not used by at least one container
```

---

## Step 5: Verify Everything is Removed

```bash
# Check containers
docker ps -a | grep estatebank

# Check images
docker images | grep estatebank

# Check volumes
docker volume ls | grep estatebank

# Check networks
docker network ls | grep estatebank
```

All should return empty. If not, manually remove remaining items.

---

## Step 6: Clean Project Directory (Optional)

If you want to start completely fresh:

```bash
# Go to project directory
cd /opt/estatebank/estatebank-prod

# Remove node_modules (if exists)
rm -rf node_modules

# Remove .next build folder (if exists)
rm -rf .next

# Remove Docker build cache
rm -rf .docker
```

**Keep these files:**
- ✅ `.env` or `.env.production` (your environment variables)
- ✅ `docker-compose.yml`
- ✅ `Dockerfile`
- ✅ All source code files

---

## Step 7: Pull Latest Code (If Using Git)

```bash
cd /opt/estatebank/estatebank-prod

# Pull latest code
git pull origin main
# or
git pull origin master
```

---

## Step 8: Verify Environment File

```bash
# Check if .env file exists
ls -la .env*

# If using .env.production, make sure it's configured
cat .env.production | grep -v PASSWORD | grep -v SECRET
```

Make sure all required environment variables are set:
- `MONGODB_URI`
- `JWT_SECRET`
- `BREVO_SMTP_*` variables
- `ADMIN_*` variables
- etc.

---

## Step 9: Rebuild and Deploy

### Option A: Using Docker Compose

```bash
# Build fresh images (no cache)
docker compose build --no-cache

# Start containers
docker compose up -d

# View logs
docker compose logs -f app
```

### Option B: Using Deploy Script

```bash
# Make sure deploy script is executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

---

## Step 10: Verify Deployment

```bash
# Check container status
docker compose ps

# Check application health
curl http://localhost:3000/api/health

# Check logs
docker compose logs -f app
```

---

## Step 11: Recreate Admin User (If Needed)

If you removed the database, you'll need to create admin user again:

```bash
# Enter the app container
docker compose exec app sh

# Run admin creation script
node scripts/create-admin.js
# or
npx tsx scripts/create-admin.ts

# Exit container
exit
```

---

## Step 12: Verify Everything Works

1. **Check Application URL**: `http://your-server-ip:3000`
2. **Test Login**: Try logging into dashboard
3. **Check Database**: Verify MongoDB is running and connected
4. **Check Logs**: No errors in logs

```bash
# View all logs
docker compose logs

# View app logs only
docker compose logs app

# View MongoDB logs
docker compose logs mongodb
```

---

## Quick Clean & Redeploy (One Command)

If you want to do everything at once (be careful!):

```bash
cd /opt/estatebank/estatebank-prod && \
docker compose down && \
docker system prune -a --volumes -f && \
git pull && \
docker compose build --no-cache && \
docker compose up -d && \
docker compose logs -f app
```

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Issue: Permission Denied

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: MongoDB Won't Start

```bash
# Check MongoDB logs
docker compose logs mongodb

# Remove MongoDB volume and restart
docker volume rm estatebank_mongodb_data
docker compose up -d mongodb
```

### Issue: Build Fails

```bash
# Clean build cache
docker builder prune -a -f

# Rebuild
docker compose build --no-cache
```

---

## Post-Deployment Checklist

- [ ] Application is accessible
- [ ] Database is connected
- [ ] Admin user can login
- [ ] No errors in logs
- [ ] Environment variables are set correctly
- [ ] Health check endpoint works
- [ ] All services are running

---

## Summary Commands

```bash
# Complete cleanup
docker compose down
docker system prune -a --volumes -f

# Fresh deployment
git pull
docker compose build --no-cache
docker compose up -d
docker compose logs -f app
```

---

**Remember**: Always backup your data before cleaning production! 🚀
