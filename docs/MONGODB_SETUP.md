# MongoDB Setup Guide

This guide will help you set up MongoDB for the EstateBANK.in Admin Dashboard. You can choose between **Local MongoDB** or **MongoDB Atlas** (cloud).

## Option 1: MongoDB Atlas (Recommended for Production)

MongoDB Atlas is a cloud-hosted MongoDB service that's free to start and easy to set up.

### Steps:

1. **Create a MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Create" or "Build a Database"
   - Choose the FREE tier (M0)
   - Select a cloud provider and region (choose closest to you)
   - Click "Create Cluster"

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username and generate a secure password (save this!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, add only your server's IP address
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `estatebank` or leave it to use default

6. **Update Your Environment Variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and update `MONGODB_URI` with your Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/estatebank?retryWrites=true&w=majority
     ```

## Option 2: Local MongoDB

For local development, you can install MongoDB directly on your machine.

### macOS Setup (using Homebrew):

1. **Install MongoDB Community Edition**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB Service**
   ```bash
   brew services start mongodb-community
   ```

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   ```
   If you see a MongoDB shell prompt, you're good to go! Type `exit` to leave.

4. **Update Your Environment Variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - The default connection string should work:
     ```
     MONGODB_URI=mongodb://localhost:27017/estatebank
     ```

### Windows Setup:

1. **Download MongoDB**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Download the Windows installer (.msi)
   - Run the installer and follow the setup wizard
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service

2. **Verify Installation**
   - Open Command Prompt as Administrator
   - MongoDB should start automatically as a service
   - You can verify by running:
     ```bash
     mongosh
     ```

3. **Update Your Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Use the default connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/estatebank
     ```

### Linux Setup (Ubuntu/Debian):

1. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify Installation**
   ```bash
   mongosh
   ```

4. **Update Your Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Use the default connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/estatebank
     ```

## Verify Your Setup

After setting up MongoDB, verify the connection:

1. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Test an API endpoint:**
   - Open your browser and go to: `http://localhost:3000/api/properties`
   - You should see a JSON response (empty array if no data yet)
   - If you see an error, check your `MONGODB_URI` in `.env.local`

3. **Check MongoDB logs:**
   - For local MongoDB, check the connection in `mongosh`:
     ```bash
     mongosh
     use estatebank
     show collections
     ```

## Troubleshooting

### Connection Error: "MongoNetworkError"
- **Local MongoDB**: Make sure MongoDB service is running (`brew services list` on macOS)
- **Atlas**: Check that your IP address is whitelisted in Network Access

### Authentication Error
- **Atlas**: Verify your username and password in the connection string
- Make sure you URL-encode special characters in your password

### "Please define the MONGODB_URI environment variable"
- Make sure `.env.local` exists in the `frontend/` directory
- Restart your Next.js dev server after creating/updating `.env.local`

## Next Steps

Once MongoDB is connected:
1. Your API routes will automatically create collections as data is added
2. You can use MongoDB Compass (GUI tool) to view and manage your data
3. Download MongoDB Compass: [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)

## Useful MongoDB Commands

```bash
# Connect to MongoDB shell
mongosh

# Switch to your database
use estatebank

# List all collections
show collections

# View documents in a collection
db.properties.find()

# Count documents
db.properties.countDocuments()

# Exit MongoDB shell
exit
```
