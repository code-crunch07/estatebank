# Node.js Version Compatibility Fix

## Problem
Next.js 16.1.1 requires Node.js >= 20.9.0, but your server has Node.js v18.20.8.

## Solution Applied
I've downgraded the dependencies in `package.json` to versions compatible with Node.js 18:

- **Next.js**: `16.1.1` → `15.1.3` (supports Node.js 18)
- **React**: `19.2.3` → `18.3.1` (compatible with Next.js 15)
- **React DOM**: `19.2.3` → `18.3.1`
- **@types/react**: `19.2.0` → `18.3.0`
- **@types/react-dom**: `19.2.0` → `18.3.0`
- **eslint-config-next**: `16.1.1` → `15.1.3`

## Next Steps on Server

1. **Delete node_modules and package-lock.json** (if they exist):
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

## Alternative: Upgrade Node.js (Recommended for Long-term)

If you prefer to use Next.js 16, you can upgrade Node.js on your server:

### Using NVM (Node Version Manager)
```bash
# Install NVM if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify version
node -v  # Should show v20.x.x
```

### Using NodeSource Repository (Ubuntu/Debian)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node -v  # Should show v20.x.x
```

### After Upgrading Node.js
If you upgrade to Node.js 20, you can revert the package.json changes to use Next.js 16:
- Change `next` back to `^16.1.1`
- Change `react` and `react-dom` back to `^19.2.3`
- Change `@types/react` and `@types/react-dom` back to `^19.2.0`
- Change `eslint-config-next` back to `^16.1.1`

## Current Status
✅ Package.json updated for Node.js 18 compatibility
⚠️ Server needs to run `npm install` with updated package.json

