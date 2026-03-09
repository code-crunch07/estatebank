# Migration Guide: Moving from `frontend/` to Root Directory

## Overview
This guide helps you move all files from `/estatebank/frontend/` to `/estatebank/` root directory.

## ✅ **Yes, it's possible and safe!**

The move will **NOT affect** your application because:
- ✅ Next.js uses relative paths (`@/*` points to `./*`)
- ✅ All imports use `@/` alias which is relative
- ✅ No hardcoded "frontend" paths in code
- ✅ Configuration files use relative paths

---

## Step-by-Step Migration

### **Step 1: Backup First (IMPORTANT!)**
```bash
cd /Users/rahulshah/Downloads/EstateBANK.in
# Create a backup
cp -r frontend frontend-backup
```

### **Step 2: Move All Files**
```bash
cd /Users/rahulshah/Downloads/EstateBANK.in

# Move all files from frontend/ to root
mv frontend/* .
mv frontend/.* . 2>/dev/null || true  # Move hidden files (like .git, .env, etc.)

# Remove empty frontend directory
rmdir frontend
```

### **Step 3: Clean Up Unused Folders**
```bash
# Remove old React template (if not needed)
rm -rf frontend/  # This will be the old template folder if it still exists

# Remove resido-assets if not using (saves 41MB)
rm -rf public/resido-assets
```

### **Step 4: Verify Structure**
After moving, your structure should be:
```
estatebank/
├── app/              # Next.js app directory
├── components/        # React components
├── lib/              # Utilities
├── models/           # MongoDB models
├── public/           # Static assets
├── package.json      # Dependencies
├── next.config.js    # Next.js config
├── tsconfig.json     # TypeScript config
└── ... (other config files)
```

### **Step 5: Test the Application**
```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Test that everything works:
# 1. Visit http://localhost:3000
# 2. Visit http://localhost:3000/dashboard
# 3. Check API routes work
```

---

## What Will NOT Break

✅ **Imports** - All `@/` imports will still work  
✅ **API Routes** - All `/api/*` routes unchanged  
✅ **Components** - All component imports unchanged  
✅ **Configuration** - Next.js, TypeScript, Tailwind configs unchanged  
✅ **Database** - MongoDB connections unchanged  
✅ **Environment Variables** - `.env.local` will move with files  

---

## What You Need to Update

### **1. Deployment Scripts** (if using)
If you have deployment scripts that reference `frontend/`, update them:

**Before:**
```bash
cd frontend
npm run build
```

**After:**
```bash
npm run build
```

### **2. PM2 Configuration** (`ecosystem.config.js`)
Update the `cwd` path if it references `frontend/`:

**Before:**
```javascript
cwd: '/home/cloudpanel/htdocs/yourdomain.com/frontend',
```

**After:**
```javascript
cwd: '/home/cloudpanel/htdocs/yourdomain.com',
```

### **3. Documentation**
Update any documentation that references `frontend/` folder:
- README.md
- DEPLOYMENT.md
- QUICK_DEPLOY.md

### **4. Git (if using)**
If you have a `.gitignore` in `frontend/`, it will move to root automatically.

---

## Automated Migration Script

Here's a safe script to do the migration:

```bash
#!/bin/bash
# migration.sh - Move frontend to root

set -e  # Exit on error

cd /Users/rahulshah/Downloads/EstateBANK.in

echo "🔄 Starting migration..."
echo ""

# Step 1: Backup
echo "📦 Creating backup..."
cp -r frontend frontend-backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Step 2: Move files
echo "📁 Moving files..."
mv frontend/* . 2>/dev/null || true
mv frontend/.* . 2>/dev/null || true
echo "✅ Files moved"

# Step 3: Remove empty directory
echo "🧹 Cleaning up..."
rmdir frontend 2>/dev/null || echo "⚠️  frontend directory not empty or doesn't exist"
echo "✅ Cleanup complete"

# Step 4: Verify
echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "3. Test the application"
echo ""
echo "⚠️  If something breaks, restore from backup:"
echo "   mv frontend-backup-* frontend"
```

**To use the script:**
```bash
chmod +x migration.sh
./migration.sh
```

---

## Manual Migration (Safer)

If you prefer to do it manually:

### **Option 1: Using Finder (macOS)**
1. Open Finder
2. Navigate to `/Users/rahulshah/Downloads/estatebank/frontend`
3. Select all files (Cmd+A)
4. Cut (Cmd+X)
5. Navigate to `/Users/rahulshah/Downloads/EstateBANK.in`
6. Paste (Cmd+V)
7. Delete empty `frontend` folder

### **Option 2: Using Terminal**
```bash
cd /Users/rahulshah/Downloads/EstateBANK.in

# Create backup
cp -r frontend frontend-backup

# Move files one by one (safer)
mv frontend/app .
mv frontend/components .
mv frontend/lib .
mv frontend/models .
mv frontend/public .
mv frontend/package.json .
mv frontend/package-lock.json .
mv frontend/next.config.js .
mv frontend/tsconfig.json .
mv frontend/tailwind.config.ts .
mv frontend/postcss.config.mjs .
mv frontend/*.md .  # Move all markdown files
mv frontend/*.sh .  # Move all shell scripts
mv frontend/scripts .  # Move scripts folder
mv frontend/.env* . 2>/dev/null || true  # Move env files if exist
mv frontend/.git* . 2>/dev/null || true  # Move git files if exist

# Remove empty frontend directory
rmdir frontend
```

---

## After Migration Checklist

- [ ] Run `npm install` to ensure dependencies are installed
- [ ] Run `npm run dev` and test homepage
- [ ] Test dashboard login (`/login`)
- [ ] Test a few API endpoints
- [ ] Check that images load correctly
- [ ] Verify MongoDB connection (if using)
- [ ] Test property pages
- [ ] Check browser console for errors

---

## Rollback Plan

If something goes wrong:

```bash
cd /Users/rahulshah/Downloads/EstateBANK.in

# Remove moved files (be careful!)
rm -rf app components lib models public package.json next.config.js tsconfig.json tailwind.config.ts postcss.config.mjs *.md *.sh scripts

# Restore from backup
mv frontend-backup-* frontend
```

---

## Benefits of Moving to Root

✅ **Cleaner structure** - No nested folder  
✅ **Easier navigation** - Direct access to files  
✅ **Standard Next.js structure** - Matches Next.js conventions  
✅ **Simpler deployment** - One less folder level  
✅ **Better for CI/CD** - Standard project structure  

---

## Potential Issues (Very Low Risk)

1. **Hidden files** - Make sure `.env.local`, `.git`, etc. are moved
2. **Node modules** - You may need to reinstall: `rm -rf node_modules && npm install`
3. **Build cache** - Clear Next.js cache: `rm -rf .next`

---

## Quick Migration Command

If you're confident, here's the quickest way:

```bash
cd /Users/rahulshah/Downloads/EstateBANK.in
cp -r frontend frontend-backup  # Backup first!
cd frontend
cp -r . ..  # Copy everything to parent
cd ..
rm -rf frontend  # Remove old folder
npm install  # Reinstall if needed
npm run dev  # Test
```

---

## Summary

**✅ Safe to do** - No code changes needed  
**✅ Quick process** - Takes 2-5 minutes  
**✅ No breaking changes** - Everything uses relative paths  
**✅ Cleaner structure** - Better organization  

Just remember to:
1. **Backup first**
2. **Test after migration**
3. **Update deployment scripts** (if any)

