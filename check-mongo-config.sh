#!/bin/bash

echo "=========================================="
echo "🔍 MongoDB Configuration Diagnostic"
echo "=========================================="
echo ""

echo "1️⃣  Checking .env.production file..."
if [ -f .env.production ]; then
    echo "✅ .env.production exists"
    echo ""
    echo "📄 MONGO_ROOT_PASSWORD from .env.production:"
    grep "^MONGO_ROOT_PASSWORD=" .env.production | sed 's/=.*/=***HIDDEN***/'
    echo ""
    echo "📄 MONGODB_URI from .env.production:"
    if grep -q "^MONGODB_URI=" .env.production; then
        grep "^MONGODB_URI=" .env.production | sed 's/@[^@]*@/@***PASSWORD***@/'
    else
        echo "   ⚠️  MONGODB_URI not set in .env.production"
        echo "   (Docker Compose will construct it from MONGO_ROOT_PASSWORD)"
    fi
else
    echo "❌ .env.production not found!"
fi
echo ""

echo "2️⃣  Checking .env file (for Docker Compose variable substitution)..."
if [ -f .env ]; then
    echo "✅ .env exists"
    if [ -L .env ]; then
        echo "   ℹ️  .env is a symlink to: $(readlink .env)"
    fi
else
    echo "⚠️  .env not found (Docker Compose needs this for variable substitution)"
fi
echo ""

echo "3️⃣  Checking MongoDB container environment..."
echo "📦 MONGO_INITDB_ROOT_PASSWORD in MongoDB container:"
docker compose exec -T mongodb env | grep MONGO_INITDB_ROOT_PASSWORD | sed 's/=.*/=***HIDDEN***/' 2>/dev/null || echo "   ⚠️  Could not read MongoDB container env"
echo ""

echo "4️⃣  Checking App container MONGODB_URI..."
echo "📦 MONGODB_URI in App container:"
docker compose exec -T app env | grep MONGODB_URI | sed 's/@[^@]*@/@***PASSWORD***@/' 2>/dev/null || echo "   ⚠️  Could not read App container env"
echo ""

echo "5️⃣  Testing MongoDB connection with current password..."
MONGO_PASS=$(grep "^MONGO_ROOT_PASSWORD=" .env.production 2>/dev/null | cut -d'=' -f2)
if [ -n "$MONGO_PASS" ]; then
    echo "   Testing connection..."
    docker compose exec -T mongodb mongosh -u admin -p "$MONGO_PASS" --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>&1 | head -5
else
    echo "   ⚠️  Could not extract password from .env.production"
fi
echo ""

echo "=========================================="
echo "✅ Diagnostic Complete"
echo "=========================================="

