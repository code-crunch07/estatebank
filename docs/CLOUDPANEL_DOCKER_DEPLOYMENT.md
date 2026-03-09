# CloudPanel Docker Deployment Guide - Step by Step

## 🎯 Goal
Deploy your Next.js application using Docker and CloudPanel's Proxy Site feature.

---

## Step 1: SSH to Your VPS

Open your terminal and connect:

```bash
ssh root@93.127.172.86
```

Enter your password when prompted.

---

## Step 2: Install Docker (if not installed)

```bash
# Check if Docker is installed
docker --version

# If not installed, run:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

---

## Step 3: Create Application Directory

```bash
# Create directory for your app
mkdir -p /opt/estatebank
cd /opt/estatebank
```

---

## Step 4: Upload Your Application Files

You have 3 options:

### Option A: Upload via SCP (from your local machine)

**On your local machine (not VPS):**
```bash
cd /Users/rahulshah/Downloads/estatebank
scp -r ./* root@93.127.172.86:/opt/estatebank/
```

### Option B: Upload via CloudPanel File Manager

1. Login to CloudPanel: `https://93.127.172.86:8443`
2. Go to **File Manager**
3. Navigate to `/opt/estatebank`
4. Upload all your application files

### Option C: Clone from Git (if you have a repo)

```bash
cd /opt/estatebank
git clone your-repo-url .
```

---

## Step 5: Create Environment File

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

Save: `Ctrl + X`, then `Y`, then `Enter`

---

## Step 6: Build and Start Docker Container

```bash
cd /opt/estatebank

# Build the Docker image
docker compose build

# Start the container
docker compose up -d

# Check if it's running
docker compose ps

# View logs (to verify it started correctly)
docker compose logs -f app
```

**Expected output:** You should see "Ready" or the app running on port 3000.

Press `Ctrl + C` to exit logs view.

---

## Step 7: Verify Docker Container is Running

```bash
# Check container status
docker compose ps

# Test if app responds
curl http://localhost:3000/api/health
```

You should get a response. If you see errors, check logs:
```bash
docker compose logs app
```

---

## Step 8: Configure CloudPanel Proxy Site

### 8.1 Login to CloudPanel

1. Open browser: `https://93.127.172.86:8443`
2. Login with your CloudPanel credentials

### 8.2 Create Proxy Site

1. Click **"Sites"** in the top navigation
2. Click **"Add Site"** button
3. Select **"Proxy Site"** (or "Create a Proxy Site")
4. Fill in the form:
   - **Domain:** `estatebank.in` (or your domain)
   - **Backend URL:** `http://localhost:3000`
   - **Backend Port:** `3000` (if asked separately)
5. Click **"Create"** or **"Save"**

### 8.3 Configure SSL Certificate

1. In your site settings, find **SSL/TLS** section
2. Click **"Let's Encrypt"** or **"SSL Certificate"**
3. Enter domain: `estatebank.in`
4. Click **"Install"** or **"Generate"**
5. CloudPanel will automatically configure SSL

---

## Step 9: Configure DNS (if not done)

Make sure your domain DNS points to your VPS:

```
Type: A
Name: @ (or blank)
Value: 93.127.172.86
TTL: 3600

Type: A
Name: www
Value: 93.127.172.86
TTL: 3600
```

---

## Step 10: Test Your Deployment

1. **Test locally on VPS:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test via domain:**
   - Open browser: `https://estatebank.in`
   - Should see your Next.js application

3. **Test API:**
   - `https://estatebank.in/api/health`

---

## ✅ Success Checklist

- [ ] Docker installed and running
- [ ] Application files uploaded to `/opt/estatebank`
- [ ] `.env.production` configured
- [ ] Docker container built and running (`docker compose ps`)
- [ ] Container responds on `http://localhost:3000`
- [ ] Proxy Site created in CloudPanel
- [ ] SSL certificate installed
- [ ] DNS configured (if needed)
- [ ] Application accessible via `https://estatebank.in`

---

## 🔄 Updating Your Application

When you make code changes:

```bash
# SSH to VPS
ssh root@93.127.172.86

# Navigate to app directory
cd /opt/estatebank

# Upload new files (via SCP or CloudPanel File Manager)

# Rebuild and restart
docker compose build --no-cache
docker compose down
docker compose up -d

# Check logs
docker compose logs -f app
```

---

## 🛠️ Troubleshooting

### Container not starting?

```bash
# Check logs
docker compose logs app

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart container
docker compose restart app
```

### Can't access via domain?

1. Check CloudPanel proxy settings:
   - Backend URL should be: `http://localhost:3000`
   - Port should be: `3000`

2. Check DNS:
   ```bash
   nslookup estatebank.in
   # Should return: 93.127.172.86
   ```

3. Check Docker container:
   ```bash
   docker compose ps
   curl http://localhost:3000/api/health
   ```

### SSL not working?

1. In CloudPanel, go to SSL/TLS section
2. Click "Let's Encrypt" again
3. Wait a few minutes for certificate generation
4. Check CloudPanel logs for SSL errors

---

## 📝 Quick Commands Reference

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f app

# Restart container
docker compose restart app

# Stop container
docker compose down

# Start container
docker compose up -d

# Rebuild and restart
docker compose build --no-cache && docker compose up -d

# Check container resource usage
docker stats
```

---

## 🎉 You're Done!

Your application should now be:
- ✅ Running in Docker
- ✅ Accessible via CloudPanel proxy
- ✅ SSL secured
- ✅ Live on `https://estatebank.in`

**Access your app:** `https://estatebank.in`
**Dashboard:** `https://estatebank.in/login`

