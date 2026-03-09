# Cloudinary Migration in Docker

**Date:** January 28, 2026

---

## 🐳 Problem

The migration script `migrate-images-to-cloudinary.ts` was created after the Docker image was built, so it's not in the container.

---

## ✅ Solution Options

### **Option 1: Use API Endpoint (Easiest - No File Upload Needed!)**

**This is the easiest option** - no need to upload files or enter Docker container!

1. **Add migration secret to `.env`** (on server):
   ```bash
   nano .env
   # Add this line:
   MIGRATION_SECRET=your-secret-key-here
   ```

2. **Restart container**:
   ```bash
   docker compose restart app
   ```

3. **Run migration via API** (from anywhere):
   ```bash
   curl -X POST http://localhost:3000/api/migrate-cloudinary \
     -H "Authorization: Bearer your-secret-key-here" \
     -H "Content-Type: application/json"
   ```

   Or from your local machine:
   ```bash
   curl -X POST http://your-server-ip:3000/api/migrate-cloudinary \
     -H "Authorization: Bearer your-secret-key-here"
   ```

**✅ This API endpoint is already created and ready to use!**

---

### **Option 2: Upload Files Then Copy into Container**

**First, upload files to server:**

From your **local machine**:
```bash
cd /Users/rahulshah/Downloads/estatebank-prod

# Upload files via SCP
scp scripts/migrate-images-to-cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/scripts/
scp lib/cloudinary.ts deploynew@srv504049:/opt/estatebank/estatebank-prod/lib/
```

**Then copy into container:**
```bash
# On server
cd /opt/estatebank/estatebank-prod
docker compose cp scripts/migrate-images-to-cloudinary.ts app:/app/scripts/
docker compose cp lib/cloudinary.ts app:/app/lib/
docker compose exec app sh
npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

### **Option 2: Rebuild Docker Image (Recommended)**

Rebuild the Docker image to include the new script:

```bash
# On your server
cd /opt/estatebank/estatebank-prod

# Rebuild with new files
docker compose build --no-cache

# Restart containers
docker compose down
docker compose up -d

# Enter container
docker compose exec app sh

# Run migration
npx tsx scripts/migrate-images-to-cloudinary.ts
```

---

### **Option 3: Create API Endpoint (Best for Production)**

Create an API endpoint to run migration without entering container:

```typescript
// app/api/migrate-cloudinary/route.ts
import { NextRequest } from 'next/server';
import { migrateAllImages } from '@/lib/cloudinary-migrate';

export async function POST(request: NextRequest) {
  // Add authentication check here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await migrateAllImages();
    return Response.json({ success: true, message: 'Migration completed' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

Then call from outside:
```bash
curl -X POST http://localhost:3000/api/migrate-cloudinary \
  -H "Authorization: Bearer your-migration-secret"
```

---

## 🚀 Quick Steps (Option 1 - Fastest)

```bash
# 1. Copy files into container
cd /opt/estatebank/estatebank-prod
docker compose cp scripts/migrate-images-to-cloudinary.ts app:/app/scripts/
docker compose cp lib/cloudinary.ts app:/app/lib/

# 2. Enter container
docker compose exec app sh

# 3. Run migration
npx tsx scripts/migrate-images-to-cloudinary.ts

# 4. Exit container
exit
```

---

## 📋 Verify Files Are in Container

```bash
# Enter container
docker compose exec app sh

# Check if script exists
ls -la /app/scripts/migrate-images-to-cloudinary.ts

# Check if lib file exists
ls -la /app/lib/cloudinary.ts

# Exit
exit
```

---

## 🔧 If Script Still Fails

### **Check Dependencies**

The script needs `cloudinary` package. Verify it's installed:

```bash
docker compose exec app sh
npm list cloudinary
```

If not installed, install it:
```bash
docker compose exec app sh
npm install cloudinary
```

### **Check Environment Variables**

Verify Cloudinary credentials are set:

```bash
docker compose exec app sh
env | grep CLOUDINARY
```

If missing, add to `.env` file and restart:
```bash
# On server (outside container)
cd /opt/estatebank/estatebank-prod
nano .env
# Add Cloudinary variables
docker compose restart app
```

---

## ✅ After Migration

1. **Verify in Cloudinary Dashboard** - Check images uploaded
2. **Test Website** - Images should load from Cloudinary
3. **Check MongoDB** - URLs should be Cloudinary URLs, not base64

---

## 🆘 Troubleshooting

### **Error: "Cannot find module"**
- Script not copied into container → Use Option 1 or 2
- Dependencies missing → Install cloudinary package

### **Error: "Cloudinary credentials not found"**
- Add to `.env` file
- Restart container: `docker compose restart app`

### **Error: "MongoDB connection failed"**
- Check `MONGODB_URI` in `.env`
- Verify MongoDB container is running: `docker compose ps`
