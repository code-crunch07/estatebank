# Fix Cloudinary "Invalid Signature" Error

**Date:** January 28, 2026

---

## 🚨 Error

```
Invalid Signature ... String to sign - 'folder=properties/featured&overwrite=0&timestamp=...'
http_code: 401
```

This means your **Cloudinary API credentials are incorrect**.

---

## ✅ Fix Steps

### **Step 1: Verify Credentials in Cloudinary Dashboard**

1. Go to [cloudinary.com](https://cloudinary.com) and login
2. Go to **Dashboard** → **Settings** (gear icon)
3. Scroll to **Product Environment Credentials**
4. **Copy these EXACTLY** (no extra spaces):
   - **Cloud name** (e.g., `dxample123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

---

### **Step 2: Check Your .env File**

On your server:

```bash
cd /opt/estatebank/estatebank-prod
nano .env
```

**Make sure these lines exist and are correct:**

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Common mistakes:**
- ❌ Extra spaces: `CLOUDINARY_CLOUD_NAME = value` (wrong)
- ✅ No spaces: `CLOUDINARY_CLOUD_NAME=value` (correct)
- ❌ Quotes: `CLOUDINARY_CLOUD_NAME="value"` (wrong - remove quotes)
- ✅ No quotes: `CLOUDINARY_CLOUD_NAME=value` (correct)

---

### **Step 3: Verify Credentials Are Loaded**

**Check in Docker container:**

```bash
docker compose exec app sh
env | grep CLOUDINARY
```

**Should show:**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**If empty or wrong:**
1. Fix `.env` file
2. Restart container: `docker compose restart app`
3. Check again

---

### **Step 4: Test Credentials**

Create a test script to verify:

```bash
docker compose exec app sh
node -e "
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');
"
```

---

## 🔍 Common Issues

### **Issue 1: Wrong API Secret**

- **Symptom:** Invalid Signature error
- **Fix:** Copy API Secret from Cloudinary dashboard (not API Key!)
- **Note:** API Secret is different from API Key

### **Issue 2: Credentials Not Loaded**

- **Symptom:** Empty values when checking `env | grep CLOUDINARY`
- **Fix:** 
  1. Check `.env` file exists
  2. Check no typos in variable names
  3. Restart container: `docker compose restart app`

### **Issue 3: Extra Spaces/Characters**

- **Symptom:** Credentials look correct but still fail
- **Fix:** Remove all spaces around `=`
- **Wrong:** `CLOUDINARY_CLOUD_NAME = value`
- **Right:** `CLOUDINARY_CLOUD_NAME=value`

### **Issue 4: Using Wrong Account**

- **Symptom:** Credentials work but wrong account
- **Fix:** Make sure you're using the correct Cloudinary account

---

## ✅ Quick Checklist

- [ ] Logged into correct Cloudinary account
- [ ] Copied Cloud Name from dashboard
- [ ] Copied API Key from dashboard
- [ ] Copied API Secret from dashboard (not API Key!)
- [ ] Added all three to `.env` file
- [ ] No spaces around `=` sign
- [ ] No quotes around values
- [ ] Restarted Docker container
- [ ] Verified with `env | grep CLOUDINARY`

---

## 🚀 After Fixing Credentials

1. **Restart container:**
   ```bash
   docker compose restart app
   ```

2. **Run migration again:**
   ```bash
   docker compose exec app npx tsx scripts/migrate-images-to-cloudinary.ts
   ```

   Or use API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/migrate-cloudinary \
     -H "Authorization: Bearer your-migration-secret"
   ```

---

## 📋 Example .env Format

```env
# Cloudinary - Make sure these match your dashboard EXACTLY
CLOUDINARY_CLOUD_NAME=dxample123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

**Important:** 
- No spaces
- No quotes
- Copy-paste directly from Cloudinary dashboard
- API Secret is LONG (usually 40+ characters)
