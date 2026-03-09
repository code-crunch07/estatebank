#!/bin/bash

# Quick Fix Script for Migration Issues
# This script fixes common issues after moving from frontend/ to root

set -e

echo "🔧 Fixing Migration Issues..."
echo ""

cd /Users/rahulshah/Downloads/EstateBANK.in

# Step 1: Clear build cache
echo "1️⃣  Clearing Next.js build cache..."
rm -rf .next
echo "   ✅ Build cache cleared"

# Step 2: Clear node_modules (optional but recommended)
read -p "2️⃣  Do you want to reinstall node_modules? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Removing node_modules..."
    rm -rf node_modules
    echo "   Installing dependencies..."
    npm install
    echo "   ✅ Dependencies reinstalled"
else
    echo "   ⏭️  Skipping node_modules reinstall"
fi

# Step 3: Verify structure
echo ""
echo "3️⃣  Verifying file structure..."
if [ -d "app" ] && [ -d "components" ] && [ -d "lib" ]; then
    echo "   ✅ File structure looks good"
else
    echo "   ❌ Missing required folders!"
    echo "   Expected: app/, components/, lib/"
    exit 1
fi

# Step 4: Check fonts
echo ""
echo "4️⃣  Checking fonts..."
if [ -d "public/fonts" ]; then
    echo "   ✅ Fonts folder exists"
else
    echo "   ⚠️  Fonts folder missing (fonts may not load)"
fi

# Step 5: Check .env.local
echo ""
echo "5️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
else
    echo "   ⚠️  .env.local missing"
fi

echo ""
echo "✅ Fix script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run dev"
echo "2. Open browser console (F12)"
echo "3. Clear localStorage if data is missing:"
echo "   localStorage.clear(); location.reload();"
echo "4. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""

