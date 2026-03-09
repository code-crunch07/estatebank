# Simple Docker Setup for estatebank.in

## 🚀 Quick Setup (5 Steps)

### Step 1: SSH to Your VPS

```bash
ssh root@93.127.172.86
```

### Step 2: Install Docker (if not installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Step 3: Upload Your App

```bash
# Create directory
mkdir -p /opt/estatebank
cd /opt/estatebank

# Upload files (from your local machine):
# scp -r ./* root@93.127.172.86:/opt/estatebank/
```

Or use CloudPanel File Manager to upload to `/opt/estatebank`

### Step 4: Configure Environment

```bash
cd /opt/estatebank
nano .env.production
```

Add your environment variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_email
BREVO_SMTP_PASSWORD=your_password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in
ADMIN_EMAIL=your_admin_email
ADMIN_CREATE_SECRET=your_secret
NODE_ENV=production
```

### Step 5: Start Docker Container

```bash
cd /opt/estatebank
docker compose build
docker compose up -d

# Check if running
docker compose ps
docker compose logs -f app
```

---

## 🌐 Configure Domain in CloudPanel

### In CloudPanel Interface:

1. **Login to CloudPanel**
   - Go to: `https://93.127.172.86:8443`

2. **Add Site**
   - Click **Sites** → **Add Site**
   - **Domain:** `estatebank.in`
   - Choose **Node.js** or **Custom** type

3. **Set Reverse Proxy**
   - Go to site settings
   - Find **Reverse Proxy** or **Proxy Settings**
   - Set **Backend URL:** `http://localhost:3000`
   - Save

4. **Add SSL**
   - Go to **SSL/TLS** section
   - Click **Let's Encrypt**
   - Enter: `estatebank.in`
   - CloudPanel will auto-configure SSL

---

## ✅ Done!

Your site should now be live at:
- **https://estatebank.in**

---

## 📤 Updating Your Code (Deploy Changes to Production)

After you make code changes, follow these steps:

### Method 1: Upload Files via SCP (From Your Local Machine)

```bash
# From your local machine, upload all files:
scp -r ./* root@93.127.172.86:/opt/estatebank/

# Then SSH to VPS and rebuild:
ssh root@93.127.172.86
cd /opt/estatebank
docker compose build --no-cache
docker compose up -d
```

### Method 2: Upload via CloudPanel File Manager

1. **Login to CloudPanel** → Go to **File Manager**
2. **Navigate to:** `/opt/estatebank`
3. **Upload your changed files** (or entire folder)
4. **SSH to VPS** and rebuild:
   ```bash
   ssh root@93.127.172.86
   cd /opt/estatebank
   docker compose build --no-cache
   docker compose up -d
   ```

### Method 3: Quick Update Script (Recommended)

Create a simple update script on your VPS:

```bash
# SSH to VPS
ssh root@93.127.172.86

# Create update script
cd /opt/estatebank
nano update.sh
```

Paste this into `update.sh`:
```bash
#!/bin/bash
cd /opt/estatebank
echo "🔄 Rebuilding Docker container..."
docker compose build --no-cache
echo "🛑 Stopping old container..."
docker compose down
echo "🚀 Starting new container..."
docker compose up -d
echo "✅ Update complete! Your changes are now live."
echo "📊 View logs: docker compose logs -f app"
```

Make it executable:
```bash
chmod +x update.sh
```

**Now whenever you upload files, just run:**
```bash
cd /opt/estatebank
./update.sh
```

---

## 🔧 Useful Commands

```bash
# View logs
docker compose logs -f app

# Restart (without rebuilding)
docker compose restart app

# Stop
docker compose down

# Update (after code changes - full rebuild)
cd /opt/estatebank
docker compose build --no-cache
docker compose up -d

# Quick update (if you created update.sh)
cd /opt/estatebank
./update.sh
```

### Local Development (Without Docker)

```bash
# Development mode (no standalone needed)
npm run dev

# Production build (for testing locally)
npm run build
# Then run: node .next/standalone/server.js
# Or use: npm start (uses node server.js - works in Docker)
```

**Note:** The `start` script uses `node server.js` which works in Docker. For local testing after build, use `node .next/standalone/server.js` from the project root.

---

## 🛠️ Troubleshooting

**Container not starting?**
```bash
docker compose logs app
```

**Can't access site?**
```bash
# Check if container is running
docker compose ps

# Test locally
curl http://localhost:3000/api/health

# Check CloudPanel reverse proxy settings
```

**Port conflict?**
- Edit `docker-compose.yml`
- Change: `"3001:3000"` (or any free port)
- Update CloudPanel reverse proxy to new port

---

That's it! Simple and straightforward. 🎉

