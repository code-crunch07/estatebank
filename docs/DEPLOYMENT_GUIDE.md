# EstateBANK.in - Complete Deployment Guide

This is the **final, comprehensive deployment guide** for the EstateBANK.in Next.js application on a Hostinger VPS using Docker and CloudPanel.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Setup](#vps-setup)
3. [Application Deployment](#application-deployment)
4. [Environment Configuration](#environment-configuration)
5. [CloudPanel Configuration](#cloudpanel-configuration)
6. [Admin User Creation](#admin-user-creation)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Code Updates Workflow](#code-updates-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 1. Prerequisites

### Required:
- ✅ Hostinger VPS (Ubuntu 22.04 or later)
- ✅ CloudPanel installed on VPS
- ✅ Domain name pointed to VPS IP
- ✅ SSH access to VPS
- ✅ Git repository access (GitHub/GitLab)
- ✅ Email service credentials (Brevo/SendGrid)
- ✅ Twilio credentials (for OTP - optional)

### VPS Specifications (Recommended):
- **CPU**: 4+ cores
- **RAM**: 16GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

---

## 2. VPS Setup

### 2.1 SSH into VPS

```bash
ssh root@your-vps-ip
# or
ssh deploynew@your-vps-ip
```

### 2.2 Create Deployment User (Optional but Recommended)

```bash
# Create user
sudo adduser deploynew

# Add to docker group
sudo usermod -aG docker deploynew

# Switch to new user
su - deploynew

# Verify docker access
docker ps
```

### 2.3 Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (if not already)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2.4 Install Git

```bash
sudo apt install git -y
git --version
```

---

## 3. Application Deployment

### 3.1 Clone Repository

```bash
# Create project directory
sudo mkdir -p /opt/estatebank
sudo chown $USER:$USER /opt/estatebank
cd /opt/estatebank

# Clone repository
git clone https://github.com/your-username/estatebank-prod.git estatebank-prod
cd estatebank-prod
```

### 3.2 Create Environment File

```bash
# Create .env file
nano .env
```

**Copy the following template and fill in your values:**

```env
# MongoDB Configuration (Docker)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DATABASE=estatebank

# MongoDB Connection String (for app)
MONGODB_URI=mongodb://admin:your_secure_password_here@mongodb:27017/estatebank?authSource=admin

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Brevo Email Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_PASSWORD=your_brevo_smtp_password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in

# Admin User Creation
ADMIN_EMAIL=admin@estatebank.in
ADMIN_NAME_CREATE=Admin User
ADMIN_PASSWORD_CREATE=YourSecureAdminPassword123!
ADMIN_CREATE_SECRET=your_admin_creation_secret

# Twilio Configuration (for OTP - optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Save and exit** (Ctrl+X, then Y, then Enter)

### 3.3 Create Symlink for Docker Compose

```bash
# Docker Compose reads .env file, so ensure it exists
# (We already created it above, but verify)
ls -la .env

# If you created .env.production, create symlink
# ln -s .env.production .env
```

### 3.4 Build and Start Containers

```bash
# Build Docker images
docker compose build --no-cache

# Start containers
docker compose up -d

# Check container status
docker compose ps
```

**Expected output:**
```
NAME                 STATUS
estatebank-app       Up (healthy)
estatebank-mongodb   Up (healthy)
```

### 3.5 Verify Application is Running

```bash
# Check app logs
docker compose logs app

# Check MongoDB logs
docker compose logs mongodb

# Test health endpoint
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "connectionTime": "50ms",
    "queryTime": "10ms",
    "propertyCount": 0
  }
}
```

---

## 4. Environment Configuration

### 4.1 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `SecurePass123!` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://admin:pass@mongodb:27017/estatebank?authSource=admin` |
| `JWT_SECRET` | Secret for JWT tokens | `random_32_char_string` |
| `BREVO_SMTP_USER` | Brevo SMTP username | `your_brevo_user` |
| `BREVO_SMTP_PASSWORD` | Brevo SMTP password | `your_brevo_password` |
| `BREVO_FROM_EMAIL` | Sender email address | `noreply@estatebank.in` |
| `ADMIN_EMAIL` | Admin login email | `admin@estatebank.in` |
| `ADMIN_PASSWORD_CREATE` | Admin login password | `SecurePass123!` |

### 4.2 Generate Secure Passwords

```bash
# Generate MongoDB password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

---

## 5. CloudPanel Configuration

### 5.1 Access CloudPanel

1. Open browser: `https://your-vps-ip:8443`
2. Login with root credentials

### 5.2 Create Site (Proxy Site)

1. Click **"Sites"** → **"Add Site"**
2. Select **"Proxy Site"**
3. Fill in:
   - **Domain Name**: `estatebank.in` (or your domain)
   - **Site User**: `estatebank` (or create new)
   - **Reverse Proxy URL**: `http://127.0.0.1:3000`
4. Click **"Create"**

### 5.3 Configure Reverse Proxy

1. Go to **Sites** → Select your site
2. Click **"Reverse Proxy"**
3. Ensure:
   - **Backend URL**: `http://127.0.0.1:3000`
   - **Proxy Preset**: `Default`
4. Click **"Save"**

### 5.4 Verify Site is Accessible

```bash
# Test from VPS
curl http://127.0.0.1:3000

# Test from browser
http://your-domain.com
```

---

## 6. Admin User Creation

### 6.1 Create Admin via Docker

```bash
# Navigate to project directory
cd /opt/estatebank/estatebank-prod

# Run admin creation script
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
🔑 Password: YourSecureAdminPassword123!

⚠️  IMPORTANT: Change the password after first login!
⚠️  Store these credentials securely!
```

### 6.2 Login to Admin Dashboard

1. Open browser: `https://your-domain.com/dashboard`
2. Enter credentials:
   - **Email**: `admin@estatebank.in`
   - **Password**: `YourSecureAdminPassword123!`
3. Click **"Login"**

### 6.3 Change Admin Password (Recommended)

1. After login, go to **Settings** → **Profile**
2. Update password
3. Save changes

---

## 7. SSL Certificate Setup

### 7.1 Enable SSL in CloudPanel

1. Go to **Sites** → Select your site
2. Click **"SSL"**
3. Click **"Let's Encrypt"**
4. Select:
   - **Domain**: `estatebank.in`
   - **Email**: `your-email@example.com`
   - **Include www**: Yes (if you have www subdomain)
5. Click **"Issue Certificate"**

### 7.2 Force HTTPS Redirect

1. In CloudPanel, go to **Sites** → Your site → **SSL**
2. Enable **"Force HTTPS"**
3. Save changes

### 7.3 Verify SSL

```bash
# Test SSL
curl -I https://your-domain.com

# Should return 200 OK
```

---

## 8. Code Updates Workflow

### 8.1 Update Code via Git (Recommended)

```bash
# Navigate to project directory
cd /opt/estatebank/estatebank-prod

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker compose build --no-cache
docker compose down
docker compose up -d

# Verify containers are running
docker compose ps
```

### 8.2 Quick Update Script

Create `update.sh`:

```bash
#!/bin/bash
set -e
echo "🚀 Starting EstateBANK.in update..."

cd /opt/estatebank/estatebank-prod

echo "📥 Pulling latest code..."
git pull || echo "⚠️  Git pull failed, continuing with current code..."

echo "🔨 Building Docker image..."
docker compose build --no-cache

echo "🛑 Stopping existing containers..."
docker compose down

echo "🚀 Starting containers..."
docker compose up -d

echo "⏳ Waiting for containers to be healthy..."
sleep 10

echo "✅ Update complete!"
docker compose ps
```

**Make executable:**
```bash
chmod +x update.sh
```

**Run update:**
```bash
./update.sh
```

### 8.3 Update via CloudPanel File Manager

1. Go to CloudPanel → **Sites** → Your site → **File Manager**
2. Upload changed files
3. SSH into VPS and rebuild:
   ```bash
   cd /opt/estatebank/estatebank-prod
   docker compose build --no-cache
   docker compose restart app
   ```

---

## 9. Troubleshooting

### 9.1 Container Not Starting

```bash
# Check container logs
docker compose logs app
docker compose logs mongodb

# Check container status
docker compose ps

# Restart containers
docker compose restart
```

### 9.2 MongoDB Connection Issues

```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test MongoDB connection
docker compose exec mongodb mongosh -u admin -p

# Verify MONGODB_URI in .env
cat .env | grep MONGODB_URI
```

### 9.3 Application Unhealthy

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Check app logs
docker compose logs app --tail=100

# Restart app container
docker compose restart app
```

### 9.4 Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### 9.5 Permission Denied Errors

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER /opt/estatebank
```

### 9.6 Email Not Sending

```bash
# Verify Brevo credentials in .env
cat .env | grep BREVO

# Test email from app logs
docker compose logs app | grep -i email

# Check Brevo dashboard for delivery status
```

### 9.7 Domain Not Accessible

```bash
# Verify DNS is pointing to VPS IP
nslookup your-domain.com

# Check CloudPanel reverse proxy settings
# Ensure Backend URL is: http://127.0.0.1:3000

# Test from VPS
curl http://127.0.0.1:3000
```

---

## 10. Maintenance

### 10.1 Regular Backups

#### MongoDB Backup

```bash
# Create backup script
cat > /opt/estatebank/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/estatebank/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker compose exec -T mongodb mongodump \
  --uri="mongodb://admin:YOUR_PASSWORD@localhost:27017/estatebank?authSource=admin" \
  --archive > $BACKUP_DIR/mongodb_backup_$DATE.archive

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_backup_*.archive" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/mongodb_backup_$DATE.archive"
EOF

chmod +x /opt/estatebank/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/estatebank/backup-mongodb.sh
```

#### Restore MongoDB Backup

```bash
# Restore from backup
docker compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:YOUR_PASSWORD@localhost:27017/estatebank?authSource=admin" \
  --archive < /opt/estatebank/backups/mongodb_backup_YYYYMMDD_HHMMSS.archive
```

### 10.2 Monitor Container Health

```bash
# Check container status
docker compose ps

# Monitor logs
docker compose logs -f app

# Check resource usage
docker stats
```

### 10.3 Update Docker Images

```bash
# Update MongoDB image
docker compose pull mongodb
docker compose up -d mongodb

# Rebuild app image
docker compose build --no-cache app
docker compose up -d app
```

### 10.4 Clean Up Docker

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

### 10.5 View Application Logs

```bash
# Real-time logs
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app

# Logs with timestamps
docker compose logs -f --timestamps app
```

---

## 11. Quick Reference Commands

### Container Management

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View logs
docker compose logs -f app

# Check status
docker compose ps
```

### Database Management

```bash
# Access MongoDB shell
docker compose exec mongodb mongosh -u admin -p

# Backup database
docker compose exec mongodb mongodump --uri="mongodb://admin:PASSWORD@localhost:27017/estatebank?authSource=admin"

# Create admin user
docker compose exec app npx tsx scripts/create-admin.ts
```

### Application Management

```bash
# Rebuild app
docker compose build --no-cache app

# Restart app
docker compose restart app

# Check health
curl http://localhost:3000/api/health
```

---

## 12. Security Checklist

- [ ] Changed default MongoDB password
- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enabled SSL/HTTPS
- [ ] Restricted MongoDB port (27017) to localhost only
- [ ] Set up firewall rules
- [ ] Regular backups configured
- [ ] Updated system packages
- [ ] Docker containers running as non-root user
- [ ] Environment variables secured (not in Git)

---

## 13. Support & Resources

### Important Files

- `docker-compose.yml` - Docker services configuration
- `Dockerfile` - Application build configuration
- `.env` - Environment variables (DO NOT COMMIT)
- `healthcheck.js` - Health check script
- `scripts/create-admin.ts` - Admin creation script

### Useful Links

- **CloudPanel Docs**: https://www.cloudpanel.io/docs/
- **Docker Docs**: https://docs.docker.com/
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com/

### Common Issues

1. **Container unhealthy**: Check logs, verify MongoDB connection
2. **Email not sending**: Verify Brevo credentials
3. **Domain not working**: Check CloudPanel reverse proxy settings
4. **Permission errors**: Add user to docker group

---

## 14. Production Checklist

Before going live, ensure:

- [ ] All environment variables set correctly
- [ ] SSL certificate installed and working
- [ ] Admin user created and tested
- [ ] Email notifications working
- [ ] MongoDB backups configured
- [ ] Domain DNS configured correctly
- [ ] Application accessible via domain
- [ ] Health checks passing
- [ ] All containers running and healthy
- [ ] Firewall configured
- [ ] Monitoring set up (optional)

---

## 📝 Notes

- **Never commit `.env` file to Git**
- **Always backup before major updates**
- **Test in staging before production**
- **Keep Docker and system packages updated**
- **Monitor container logs regularly**

---

## 🎉 Deployment Complete!

Your EstateBANK.in application should now be live at `https://your-domain.com`

**Admin Dashboard**: `https://your-domain.com/dashboard`

For issues or questions, refer to the Troubleshooting section above.

---

**Last Updated**: January 2025
**Version**: 1.0

