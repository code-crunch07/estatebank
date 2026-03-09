#!/bin/bash

# MongoDB Setup Script for EstateBANK.in
# This script helps set up MongoDB locally

echo "🔧 EstateBANK.in MongoDB Setup"
echo "=========================="
echo ""

# Check if MongoDB is installed
if command -v mongosh &> /dev/null; then
    echo "✅ MongoDB is installed"
    mongosh --version
else
    echo "❌ MongoDB is not installed"
    echo ""
    echo "To install MongoDB on macOS:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    exit 1
fi

echo ""
echo "Checking MongoDB service status..."

# Check if MongoDB is running
if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB is not running"
    echo ""
    echo "Starting MongoDB service..."
    
    # Try to start MongoDB service
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
        echo "Waiting for MongoDB to start..."
        sleep 3
        
        # Check again
        if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
            echo "✅ MongoDB started successfully"
        else
            echo "❌ Failed to start MongoDB"
            echo ""
            echo "Try starting manually:"
            echo "  brew services start mongodb-community"
            exit 1
        fi
    else
        echo "❌ Homebrew not found. Please start MongoDB manually."
        exit 1
    fi
fi

echo ""
echo "Setting up environment variables..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/estatebank

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created .env.local"
else
    echo "⚠️  .env.local already exists"
    echo ""
    echo "Current MONGODB_URI:"
    grep MONGODB_URI .env.local || echo "  Not found in .env.local"
fi

echo ""
echo "Testing MongoDB connection..."

# Test connection
if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    echo "✅ MongoDB connection successful"
    
    # Create database if it doesn't exist
    echo ""
    echo "Creating database 'estatebank'..."
    mongosh estatebank --eval "db.getName()" --quiet &> /dev/null
    echo "✅ Database ready"
else
    echo "❌ MongoDB connection failed"
    exit 1
fi

echo ""
echo "🎉 MongoDB setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start your Next.js server: npm run dev"
echo "  2. Test API endpoints: http://localhost:3000/api/properties"
echo "  3. View data in MongoDB Compass: mongodb://localhost:27017"
echo ""
