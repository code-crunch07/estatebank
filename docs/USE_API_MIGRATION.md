# Use API Migration Endpoint (Easiest Solution)

**Date:** January 28, 2026

---

## 🎯 Problem

The migration script needs multiple files (`lib/cloudinary.ts`, `models/`, etc.) that aren't in the Docker container.

---

## ✅ Solution: Use API Endpoint (No File Copying!)

The API endpoint I created (`/api/migrate-cloudinary`) is **already in your codebase** and doesn't need any files copied. Just rebuild Docker and call it!

---

## 🚀 Steps

### **Step 1: Rebuild Docker Image**

On your server:

```bash
cd /opt/estatebank/estatebank-prod

# Rebuild (includes API endpoint and all dependencies)
docker compose build --no-cache

# Restart containers
docker compose down
docker compose up -d
```

### **Step 2: Add Migration Secret**

```bash
nano .env
```

Add this line:
```env
MIGRATION_SECRET=your-secret-key-change-this
```

Save and restart:
```bash
docker compose restart app
```

### **Step 3: Run Migration via API**

```bash
curl -X POST http://localhost:3000/api/migrate-cloudinary \
  -H "Authorization: Bearer your-secret-key-change-this" \
  -H "Content-Type: application/json"
```

**That's it!** The migration will run automatically.

---

## 📊 Check Results

The API will return a JSON response showing what was migrated:

```json
{
  "success": true,
  "message": "Migration completed successfully",
  "results": {
    "properties": { "migrated": 10, "skipped": 5 },
    "teamMembers": { "migrated": 3, "skipped": 2 },
    ...
  }
}
```

---

## ✅ Why This is Better

- ✅ **No file copying** - Everything is in Docker already
- ✅ **No entering container** - Just call API
- ✅ **Works from anywhere** - Can call from local machine too
- ✅ **Better error handling** - Returns JSON with results
- ✅ **Production-ready** - Secure with authentication

---

## 🔒 Security Note

The API requires authentication. Make sure to:
1. Use a strong `MIGRATION_SECRET` in `.env`
2. Don't share the secret publicly
3. Consider adding IP whitelist if needed

---

## 🆘 Troubleshooting

### **Error: "Unauthorized"**
- Check `MIGRATION_SECRET` is set in `.env`
- Verify Authorization header matches: `Bearer your-secret-key-change-this`
- Restart container after adding secret

### **Error: "Cloudinary credentials not found"**
- Add Cloudinary variables to `.env`:
  ```env
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```
- Restart container

### **Migration takes long time**
- This is normal - uploading many images takes time
- Check Cloudinary dashboard for progress
- API will return results when done

---

## 📝 Example Full Command

```bash
# From your local machine (if server allows external access)
curl -X POST http://your-server-ip:3000/api/migrate-cloudinary \
  -H "Authorization: Bearer your-secret-key-change-this"

# Or from server itself
curl -X POST http://localhost:3000/api/migrate-cloudinary \
  -H "Authorization: Bearer your-secret-key-change-this"
```

---

## ✅ Summary

**Just rebuild Docker and call the API** - No file copying, no container entry needed!
