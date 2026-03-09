# Quick Start Guide

## Current Status

✅ **MongoDB is installed** on your system  
✅ **MongoDB Atlas connection** is configured in `.env.local`  
⚠️ **Local MongoDB service** needs to be started (if you want to use local instead of Atlas)

## Option 1: Use MongoDB Atlas (Already Configured) ✅

Your `.env.local` already has a MongoDB Atlas connection string. This is ready to use!

**Just start your Next.js server:**
```bash
npm run dev
```

The app will connect to your MongoDB Atlas database automatically.

## Option 2: Use Local MongoDB

If you prefer to use local MongoDB instead:

1. **Start MongoDB service:**
   ```bash
   brew services start mongodb-community
   ```

2. **Wait a few seconds for MongoDB to start**, then verify:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

3. **Update `.env.local`:**
   ```bash
   # Change from Atlas to local:
   MONGODB_URI=mongodb://localhost:27017/estatebank
   ```

4. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

## Verify Setup

Test your MongoDB connection by visiting:
- **API Test**: http://localhost:3000/api/properties
- Should return: `{"success":true,"data":[]}` (empty array if no data yet)

## Troubleshooting

### MongoDB Atlas Connection Issues
- Check your IP is whitelisted in Atlas Network Access
- Verify username/password in connection string
- Ensure database name matches (currently: `tobo`)

### Local MongoDB Issues
- Check service status: `brew services list | grep mongodb`
- View logs: `tail -f /opt/homebrew/var/log/mongodb/mongo.log`
- Restart service: `brew services restart mongodb-community`

## Need Help?

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.
