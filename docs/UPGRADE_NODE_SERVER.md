# Upgrade Node.js on Production Server

## Current Situation
- **Server Node.js Version**: v18.20.8
- **Required Version**: >= 20.9.0 (for Next.js 16.1.1)
- **Your Choice**: Keep Next.js 16 and React 19

## Solution: Upgrade Node.js to Version 20 LTS

### Option 1: Using NVM (Node Version Manager) - Recommended

```bash
# 1. Install NVM if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Reload your shell configuration
source ~/.bashrc
# OR if using zsh:
source ~/.zshrc

# 3. Install Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# 4. Verify installation
node -v    # Should show v20.x.x
npm -v    # Should show npm version compatible with Node 20
```

### Option 2: Using NodeSource Repository (Ubuntu/Debian)

```bash
# 1. Install Node.js 20.x from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. Install Node.js
sudo apt-get install -y nodejs

# 3. Verify installation
node -v    # Should show v20.x.x
npm -v
```

### Option 3: Using CloudPanel/Managed Hosting

If you're using CloudPanel or similar managed hosting:

1. **SSH into your server**
2. **Check if you have root/sudo access**
3. **Use one of the methods above**

### Option 4: Manual Binary Installation

```bash
# Download Node.js 20 LTS binary
cd /tmp
wget https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz

# Extract
tar -xf node-v20.18.0-linux-x64.tar.xz

# Move to /usr/local
sudo mv node-v20.18.0-linux-x64 /usr/local/nodejs

# Create symlinks
sudo ln -sf /usr/local/nodejs/bin/node /usr/local/bin/node
sudo ln -sf /usr/local/nodejs/bin/npm /usr/local/bin/npm
sudo ln -sf /usr/local/nodejs/bin/npx /usr/local/bin/npx

# Verify
node -v
npm -v
```

## After Upgrading Node.js

1. **Verify Node.js version**:
   ```bash
   node -v  # Should be >= 20.9.0
   ```

2. **Clean install dependencies**:
   ```bash
   cd /home/optimaxmedia-estatebanknew/htdocs/estatebanknew.optimaxmedia.in/pfprod
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Restart your application** (if using PM2 or similar):
   ```bash
   pm2 restart all
   # OR
   pm2 restart estatebank
   ```

## Troubleshooting

### If npm install still shows warnings:
- Make sure you're using the correct Node.js version: `node -v`
- Clear npm cache: `npm cache clean --force`
- Try: `npm install --legacy-peer-deps` if needed

### If you get permission errors:
- Use `sudo` for system-wide installation
- Or use NVM for user-level installation (recommended)

### Check which Node.js is being used:
```bash
which node
which npm
```

## Verification Checklist

- [ ] Node.js version is >= 20.9.0 (`node -v`)
- [ ] npm install completes without engine warnings
- [ ] `npm run build` succeeds
- [ ] Application runs correctly

## Notes

- **NVM** is recommended because it allows easy switching between Node.js versions
- **Node.js 20 LTS** is the current Long Term Support version (supported until April 2026)
- Make sure to test your application after upgrading
- Consider backing up your current setup before upgrading

