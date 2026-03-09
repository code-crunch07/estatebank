# Fix Migration Error - Quick Steps

**Error:** `Cannot find module '../lib/cloudinary'`

---

## ✅ Quick Fix (Choose One)

### **Option 1: Copy File into Container (Fastest - 30 seconds)**

On your server, run:

```bash
cd /opt/estatebank/estatebank-prod

# Copy lib/cloudinary.ts into container
docker compose cp lib/cloudinary.ts app:/app/lib/

# Verify it's there
docker compose exec app ls -la /app/lib/cloudinary.ts

# Run migration
docker compose exec app npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

### **Option 2: Use API Endpoint (No File Copying)**

**This is easier** - no need to copy files!

1. **Add migration secret to `.env`:**
   ```bash
   cd /opt/estatebank/estatebank-prod
   nano .env
   # Add this line:
   MIGRATION_SECRET=your-secret-key-12345
   ```

2. **Rebuild Docker** (includes API endpoint):
   ```bash
   docker compose build --no-cache
   docker compose down
   docker compose up -d
   ```

3. **Run migration via API:**
   ```bash
   curl -X POST http://localhost:3000/api/migrate-cloudinary \
     -H "Authorization: Bearer your-secret-key-12345"
   ```

**✅ Done! No file copying needed.**

---

### **Option 3: Upload File First, Then Copy**

If `lib/cloudinary.ts` doesn't exist on server:

**From your local machine:**
```bash
cd /Users/rahulshah/Downloads/estatebank-prod
scp lib/cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/lib/
```

**Then on server:**
```bash
docker compose cp lib/cloudinary.ts app:/app/lib/
docker compose exec app npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

## 🎯 Recommended: Use Option 2 (API Endpoint)

It's the cleanest solution - just rebuild Docker and call the API. No file copying needed!
