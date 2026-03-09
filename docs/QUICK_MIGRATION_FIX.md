# Quick Fix: Copy lib/cloudinary.ts into Container

**Date:** January 28, 2026

---

## 🚨 Current Error

```
Error: Cannot find module '../lib/cloudinary'
```

The `lib/cloudinary.ts` file is missing in the Docker container.

---

## ✅ Quick Fix

### **Step 1: Copy lib/cloudinary.ts into Container**

On your server:

```bash
cd /opt/estatebank/estatebank-prod

# Copy the file into container
docker compose cp lib/cloudinary.ts app:/app/lib/
```

### **Step 2: Verify File is Copied**

```bash
docker compose exec app ls -la /app/lib/cloudinary.ts
```

Should show the file exists.

### **Step 3: Run Migration**

```bash
docker compose exec app npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

## 🔄 If File Doesn't Exist on Server

If `lib/cloudinary.ts` doesn't exist on your server, upload it first:

### **From Your Local Machine:**

```bash
cd /Users/rahulshah/Downloads/estatebank-prod

# Upload to server
scp lib/cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/lib/
```

### **Then Copy into Container:**

```bash
# On server
cd /opt/estatebank/estatebank-prod
docker compose cp lib/cloudinary.ts app:/app/lib/
docker compose exec app npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

## 🚀 Alternative: Use API Endpoint (Easier!)

Instead of copying files, use the API endpoint:

### **Step 1: Rebuild Docker Image**

```bash
cd /opt/estatebank/estatebank-prod
docker compose build --no-cache
docker compose down
docker compose up -d
```

### **Step 2: Add Migration Secret**

```bash
nano .env
# Add: MIGRATION_SECRET=your-secret-123
docker compose restart app
```

### **Step 3: Run Migration via API**

```bash
curl -X POST http://localhost:3000/api/migrate-cloudinary \
  -H "Authorization: Bearer your-secret-123"
```

**✅ No file copying needed!**
