# Complete CloudPanel Deployment Guide - Step by Step

## 🎯 Goal
Deploy your Next.js application with Docker and MongoDB using CloudPanel.

---

## 📋 Prerequisites Checklist

- [ ] VPS IP: `93.127.172.86`
- [ ] Domain: `estatebank.in`
- [ ] CloudPanel access: `https://93.127.172.86:8443`
- [ ] GitHub repo: `https://github.com/code-crunch07/estatebank`
- [ ] SSH access to VPS

---

## Step 1: Push Code to GitHub (From Your Local Machine)

### 1.1 Commit and Push

```bash
# Navigate to your project
cd /Users/rahulshah/Downloads/estatebank

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Add Docker setup with MongoDB configuration"

# Push to GitHub
git push origin main
```

**Verify:** Go to `https://github.com/code-crunch07/estatebank` and confirm all files are uploaded.

---

## Step 2: SSH to Your VPS

### 2.1 Connect via SSH

```bash
ssh root@93.127.172.86
```

Enter your password when prompted.

### 2.2 Verify Docker Installation

```bash
# Check if Docker is installed
docker --version
docker compose version

# If not installed, install Docker:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify installation
docker --version
```

---

## Step 3: Clone Repository from GitHub

### 3.1 Create Directory and Clone

```bash
# Create directory
mkdir -p /opt/estatebank
cd /opt/estatebank

# Clone from GitHub
git clone https://github.com/code-crunch07/estatebank.git .

# Verify files are cloned
ls -la
```

You should see files like `package.json`, `docker-compose.yml`, `Dockerfile`, etc.

---

## Step 4: Create Environment File

### 4.1 Create `.env.production`

```bash
cd /opt/estatebank
nano .env.production
```

### 4.2 Add Environment Variables

Paste this content (replace with your actual values):

```env
# MongoDB Configuration (Docker)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DATABASE=estatebank

# MongoDB URI (auto-configured for Docker MongoDB)
MONGODB_URI=mongodb://admin:your_secure_password_here@mongodb:27017/estatebank?authSource=admin

# Application Configuration
NODE_ENV=production
JWT_SECRET=your_very_strong_jwt_secret_key_here

# Email Configuration (Brevo/SendGrid)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_email@brevo.com
BREVO_SMTP_PASSWORD=your_smtp_password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in

# Admin Configuration
ADMIN_EMAIL=admin@estatebank.in
ADMIN_NAME_CREATE=Admin User
ADMIN_PASSWORD_CREATE=YourSecurePassword123
ADMIN_CREATE_SECRET=your_admin_create_secret

# Twilio Configuration (Optional - for OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Important:** 
- Replace `your_secure_password_here` with a strong password
- Replace `your_very_strong_jwt_secret_key_here` with a random secret key
- Update all other values with your actual credentials

### 4.3 Save and Exit

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## Step 5: Build Docker Images

### 5.1 Build Both Services

```bash
cd /opt/estatebank

# Build Docker images (this will take a few minutes)
docker compose build

# You'll see output like:
# => [internal] load build context
# => [internal] load .dockerignore
# => [1/8] FROM docker.io/library/node:20-alpine
# ... (build progress)
```

**Note:** First build may take 5-10 minutes. Subsequent builds will be faster.

### 5.2 Verify Images Built Successfully

```bash
# List Docker images
docker images

# You should see:
# estatebank-app (your Next.js app)
# mongo:7 (MongoDB)
```

---

## Step 6: Start Docker Containers

### 6.1 Start Services

```bash
cd /opt/estatebank

# Start MongoDB and Next.js app
docker compose up -d

# Output should show:
# Creating estatebank-mongodb ... done
# Creating estatebank-app     ... done
```

### 6.2 Verify Containers Are Running

```bash
# Check container status
docker compose ps

# You should see:
# NAME                  STATUS          PORTS
# estatebank-app       Up X seconds    0.0.0.0:3000->3000/tcp
# estatebank-mongodb    Up X seconds    0.0.0.0:27017->27017/tcp
```

### 6.3 Check Logs

```bash
# View MongoDB logs
docker compose logs mongodb

# View app logs
docker compose logs app

# Follow logs in real-time (press Ctrl+C to exit)
docker compose logs -f app
```

**Expected:** You should see MongoDB starting and your Next.js app starting on port 3000.

---

## Step 7: Test Application Locally

### 7.1 Test from VPS

```bash
# Test if app responds
curl http://localhost:3000/api/health

# Should return: {"success":true,"message":"API is healthy"}
```

### 7.2 Test MongoDB Connection

```bash
# Check MongoDB is accessible
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Should return: { ok: 1 }
```

---

## Step 7.5: Create Admin User (IMPORTANT!)

Before you can login to the admin dashboard, you need to create an admin user.

### 7.5.1 Add Admin Password to `.env.production`

```bash
cd /opt/estatebank
nano .env.production
```

Add this line (if not already present):
```env
ADMIN_PASSWORD_CREATE=YourSecurePassword123
```

**Important:** Choose a strong password! This will be your admin login password.

Save: `Ctrl + X`, then `Y`, then `Enter`

### 7.5.2 Restart App Container (to load new env variable)

```bash
docker compose restart app
```

### 7.5.3 Run Create Admin Script Inside Docker Container

```bash
# Execute the create-admin script inside the app container
docker compose exec app npx tsx scripts/create-admin.ts
```

**Expected output:**
```
📄 Loading environment from .env.production
✅ Connected to database
📧 Creating admin with email: admin@estatebank.in
👤 Admin name: Admin User
✅ Admin user created successfully!

📧 Email: admin@estatebank.in
🔑 Password: YourSecurePassword123

⚠️  IMPORTANT: Change the password after first login!
⚠️  Store these credentials securely!
```

### 7.5.4 Verify Admin User Created

```bash
# Check if admin user exists in MongoDB
docker compose exec mongodb mongosh estatebank --eval "db.users.find({role: 'admin'}).pretty()"
```

You should see your admin user document.

**✅ Admin user is now created!** You can login to the dashboard with:
- **Email:** `admin@estatebank.in` (or your `ADMIN_EMAIL` value)
- **Password:** The password you set in `ADMIN_PASSWORD_CREATE`

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
   - **Domain Name:** `estatebank.in`
   - **Reverse Proxy Url:** `http://127.0.0.1:3000`
   - **Site User:** `estatebank` (or leave default)
   - **Site User Password:** (use generated password or create your own)
5. Click **"Create"** or **"Save"**

### 8.3 Verify Proxy Site Created

- You should see `estatebank.in` in your sites list
- Status should show as active

---

## Step 9: Configure SSL Certificate

### 9.1 Add SSL in CloudPanel

1. Click on your site: `estatebank.in`
2. Find **SSL/TLS** section
3. Click **"Let's Encrypt"** or **"SSL Certificate"**
4. Enter domain: `estatebank.in`
5. Click **"Install"** or **"Generate"**
6. Wait for certificate generation (1-2 minutes)

### 9.2 Verify SSL

- CloudPanel will show "SSL Active" or green checkmark
- Certificate will auto-renew

---

## Step 10: Configure DNS (If Not Done)

### 10.1 Add DNS Records

In your domain registrar (where you bought `estatebank.in`):

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

### 10.2 Verify DNS Propagation

```bash
# From your local machine or VPS
nslookup estatebank.in
# Should return: 93.127.172.86
```

**Note:** DNS propagation can take 5 minutes to 48 hours. Usually takes 5-30 minutes.

---

## Step 11: Test Your Deployment

### 11.1 Test via Domain

1. Open browser: `https://estatebank.in`
2. You should see your Next.js application homepage
3. Test dashboard: `https://estatebank.in/login`

### 11.2 Test API Endpoints

```bash
# From VPS or your local machine
curl https://estatebank.in/api/health

# Should return: {"success":true,"message":"API is healthy"}
```

### 11.3 Test MongoDB

```bash
# From VPS
docker compose exec mongodb mongosh -u admin -p your_password --authenticationDatabase admin

# In MongoDB shell:
use estatebank
show collections
exit
```

---

## Step 12: Verify Everything Works

### 12.1 Checklist

- [ ] Docker containers running (`docker compose ps`)
- [ ] App responds on `http://localhost:3000`
- [ ] CloudPanel proxy site created
- [ ] SSL certificate installed
- [ ] Domain accessible: `https://estatebank.in`
- [ ] API health check works
- [ ] MongoDB is running and accessible
- [ ] Can login to dashboard

---

## 🔄 Updating Your Application (After Code Changes)

### Step 1: Push Changes to GitHub

```bash
# On your local machine
cd /Users/rahulshah/Downloads/estatebank
git add .
git commit -m "Your changes description"
git push origin main
```

### Step 2: Pull and Rebuild on VPS

```bash
# SSH to VPS
ssh root@93.127.172.86

# Navigate to app directory
cd /opt/estatebank

# Pull latest code
git pull origin main

# Rebuild Docker images
docker compose build --no-cache

# Restart containers
docker compose down
docker compose up -d

# Check logs
docker compose logs -f app
```

---

## 🛠️ Useful Commands Reference

### Docker Commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f app          # App logs
docker compose logs -f mongodb      # MongoDB logs
docker compose logs -f              # All logs

# Restart services
docker compose restart app
docker compose restart mongodb
docker compose restart              # Restart all

# Stop services
docker compose down

# Start services
docker compose up -d

# Rebuild and restart
docker compose build --no-cache && docker compose up -d

# View resource usage
docker stats
```

### MongoDB Commands

```bash
# Access MongoDB shell
docker compose exec mongodb mongosh -u admin -p your_password --authenticationDatabase admin

# Backup MongoDB
docker compose exec mongodb mongodump --out /data/backup --username admin --password your_password --authenticationDatabase admin

# Restore MongoDB
docker compose exec mongodb mongorestore /data/backup --username admin --password your_password --authenticationDatabase admin
```

### Git Commands

```bash
# Pull latest code
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -5
```

---

## 🐛 Troubleshooting

### Problem: Docker containers not starting

```bash
# Check logs
docker compose logs app
docker compose logs mongodb

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart Docker service
sudo systemctl restart docker
```

### Problem: Can't access via domain

1. **Check CloudPanel proxy settings:**
   - Backend URL should be: `http://127.0.0.1:3000`
   - Port should be: `3000`

2. **Check Docker container:**
   ```bash
   docker compose ps
   curl http://localhost:3000/api/health
   ```

3. **Check DNS:**
   ```bash
   nslookup estatebank.in
   ```

4. **Check CloudPanel site status:**
   - Login to CloudPanel
   - Check if site is active
   - Check Nginx logs in CloudPanel

### Problem: MongoDB connection error

```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test MongoDB connection
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Verify credentials in .env.production
cat .env.production | grep MONGO
```

### Problem: SSL certificate not working

1. In CloudPanel, go to SSL/TLS section
2. Click "Let's Encrypt" again
3. Wait for certificate generation
4. Check DNS is pointing correctly

### Problem: Build fails

```bash
# Check Dockerfile syntax
cat Dockerfile

# Check docker-compose.yml syntax
cat docker-compose.yml

# Try building without cache
docker compose build --no-cache

# Check available disk space
df -h
```

---

## 📊 Monitoring

### Check Application Health

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Or via domain
curl https://estatebank.in/api/health
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ `docker compose ps` shows both containers as "Up"
2. ✅ `curl http://localhost:3000/api/health` returns success
3. ✅ `https://estatebank.in` loads your application
4. ✅ SSL certificate is active (green lock in browser)
5. ✅ Can login to dashboard at `https://estatebank.in/login`
6. ✅ MongoDB is accessible and can create collections

---

## 🎉 You're Done!

Your application is now:
- ✅ Running in Docker
- ✅ MongoDB configured and running
- ✅ Accessible via CloudPanel proxy
- ✅ SSL secured
- ✅ Live on `https://estatebank.in`

**Access your app:** `https://estatebank.in`
**Dashboard:** `https://estatebank.in/login`

---

## 📝 Quick Reference

**VPS IP:** `93.127.172.86`  
**Domain:** `estatebank.in`  
**CloudPanel:** `https://93.127.172.86:8443`  
**GitHub:** `https://github.com/code-crunch07/estatebank`  
**App Directory:** `/opt/estatebank`  
**Docker Port:** `3000`  
**MongoDB Port:** `27017`

---

## 🆘 Need Help?

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify containers: `docker compose ps`
3. Test locally: `curl http://localhost:3000/api/health`
4. Check CloudPanel site status
5. Verify DNS propagation

Good luck with your deployment! 🚀

