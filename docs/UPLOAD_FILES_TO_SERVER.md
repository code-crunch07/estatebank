# Upload New Files to Server

**Date:** January 28, 2026

---

## 🚨 Problem

The new Cloudinary files (`scripts/migrate-images-to-cloudinary.ts` and `lib/cloudinary.ts`) don't exist on your server yet.

---

## ✅ Solution: Upload Files to Server

### **Option 1: Upload via SCP (From Your Local Machine)**

On your **local machine** (not the server):

```bash
# Navigate to project directory
cd /Users/rahulshah/Downloads/estatebank-prod

# Upload migration script
scp scripts/migrate-images-to-cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/scripts/

# Upload Cloudinary library
scp lib/cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/lib/

# Upload Cloudinary upload utility (optional)
scp lib/cloudinary-upload.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/lib/
```

### **Option 2: Upload via CloudPanel File Manager**

1. Login to CloudPanel: `https://srv504049:8443`
2. Go to **File Manager**
3. Navigate to `/opt/estatebank/estatebank-prod/`
4. Upload:
   - `scripts/migrate-images-to-cloudinary.ts` → `/opt/estatebank/estatebank-prod/scripts/`
   - `lib/cloudinary.ts` → `/opt/estatebank/estatebank-prod/lib/`
   - `lib/cloudinary-upload.ts` → `/opt/estatebank/estatebank-prod/lib/`

### **Option 3: Create Files Directly on Server**

SSH to server and create files:

```bash
# SSH to server
ssh deploynew@srv504049
cd /opt/estatebank/estatebank-prod

# Create directories if needed
mkdir -p scripts lib

# Then copy-paste file contents using nano or vi
```

---

## 🔄 After Uploading Files

### **Step 1: Copy Files into Container**

```bash
# On server
cd /opt/estatebank/estatebank-prod

# Copy script into container
docker compose cp scripts/migrate-images-to-cloudinary.ts app:/app/scripts/

# Copy library into container
docker compose cp lib/cloudinary.ts app:/app/lib/
```

### **Step 2: Verify Files Are in Container**

```bash
docker compose exec app sh
ls -la /app/scripts/migrate-images-to-cloudinary.ts
ls -la /app/lib/cloudinary.ts
exit
```

### **Step 3: Run Migration**

```bash
docker compose exec app sh
npx tsx scripts/migrate-images-to-cloudinary.ts
exit
```

---

## 🚀 Alternative: Rebuild Docker Image

If copying doesn't work, rebuild the Docker image:

```bash
# On server
cd /opt/estatebank/estatebank-prod

# Rebuild (includes new files)
docker compose build --no-cache

# Restart
docker compose down
docker compose up -d

# Run migration
docker compose exec app sh
npx tsx scripts/migrate-images-to-cloudinary.ts
exit
```

---

## 📋 Quick Checklist

- [ ] Upload `scripts/migrate-images-to-cloudinary.ts` to server
- [ ] Upload `lib/cloudinary.ts` to server
- [ ] Copy files into Docker container
- [ ] Verify Cloudinary credentials in `.env`
- [ ] Run migration script
- [ ] Verify images in Cloudinary dashboard
