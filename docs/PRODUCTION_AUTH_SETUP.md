# Production Authentication Setup Guide

Complete guide to set up secure authentication for EstateBANK.in dashboard in production.

## 🔐 Current System vs Production System

### Current (Development):
- ✅ Hardcoded credentials (`admin@test.com` / `admin123`)
- ✅ localStorage-based authentication
- ✅ No database storage
- ⚠️ **Not secure for production**

### Production System:
- ✅ Database-stored users
- ✅ Password hashing (bcrypt)
- ✅ JWT tokens
- ✅ Secure httpOnly cookies
- ✅ Role-based access control

---

## 🚀 Step 1: Install Dependencies

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## 🔑 Step 2: Set Environment Variables

Add to `.env` or `.env.local`:

```env
# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Creation Secret (for one-time admin creation)
ADMIN_CREATE_SECRET=your-admin-creation-secret-key

# Database URL (MongoDB)
MONGODB_URI=your-mongodb-connection-string
```

**Generate Secure Secrets:**
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Admin Creation Secret
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 👤 Step 3: Create Admin User

### Option A: Using API Endpoint (Recommended)

Create a script `scripts/create-admin.ts`:

```typescript
import mongoose from 'mongoose';

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String,
      status: String,
    }));
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('your-secure-password', 10);
    
    const admin = new User({
      email: 'admin@estatebank.in',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
```

Run:
```bash
npx tsx scripts/create-admin.ts
```

### Option B: Using API Endpoint

```bash
curl -X PUT http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@estatebank.in",
    "password": "your-secure-password",
    "name": "Admin User",
    "secretKey": "your-admin-creation-secret"
  }'
```

---

## 🔄 Step 4: Update Login Page

The login page (`app/login/page.tsx`) needs to call the API:

```typescript
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Token is stored in httpOnly cookie automatically
    toast.success('Login successful! Redirecting...');
    router.push('/dashboard');
  } catch (error: any) {
    setIsLoading(false);
    setError(error.message || 'Invalid email or password');
    toast.error('Login failed');
  }
};
```

---

## 🛡️ Step 5: Create Auth Middleware

Create `middleware.ts` in root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      jwt.verify(token.value, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Allow login page
  if (pathname === '/login' && token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      jwt.verify(token.value, JWT_SECRET);
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid token, allow login
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

---

## 🔓 Step 6: Update Logout

Update `components/dashboard-header.tsx`:

```typescript
const handleLogout = () => {
  // Call logout API
  fetch('/api/auth/logout', { method: 'POST' })
    .then(() => {
      // Clear client-side storage
      localStorage.removeItem('dashboard_authenticated');
      localStorage.removeItem('dashboard_user_email');
      // Redirect to login
      window.location.href = '/login';
    });
};
```

Create `app/api/auth/logout/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const response = successResponse({ message: 'Logged out successfully' });
  response.cookies.delete('auth_token');
  return response;
}
```

---

## 📋 Step 7: Update Dashboard Layout

Update `app/(dashboard)/layout.tsx` to use middleware instead of localStorage check:

```typescript
// Remove localStorage check - middleware handles it now
// Just check if user is authenticated via API if needed
```

---

## 🚀 Step 8: Production Deployment

### For CloudPanel/VPS:

1. **Add Environment Variables:**
   ```bash
   cd /home/cloudpanel/htdocs/estatebanknew.optimaxmedia.in
   nano .env
   
   # Add:
   JWT_SECRET=your-generated-secret-key
   ADMIN_CREATE_SECRET=your-admin-creation-secret
   MONGODB_URI=your-mongodb-uri
   ```

2. **Create Admin User:**
   ```bash
   # Run create-admin script
   npx tsx scripts/create-admin.ts
   ```

3. **Restart Application:**
   ```bash
   pm2 restart estatebank
   ```

### For Vercel:

1. Add environment variables in Vercel dashboard
2. Create admin user via API
3. Deploy

---

## 🔒 Security Best Practices

1. **Strong JWT Secret**
   - Use at least 32 characters
   - Generate randomly
   - Never commit to Git

2. **Password Requirements**
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers
   - Consider special characters

3. **Token Expiration**
   - Current: 7 days
   - Consider: 24 hours for production
   - Implement refresh tokens

4. **Rate Limiting**
   - Limit login attempts
   - Prevent brute force attacks

5. **HTTPS Only**
   - Always use HTTPS in production
   - Secure cookies require HTTPS

---

## 📝 Default Admin Credentials

After setup, you can login with:

- **Email**: `admin@estatebank.in` (or your chosen email)
- **Password**: The password you set during admin creation

**⚠️ Change default password immediately after first login!**

---

## 🆘 Troubleshooting

### Can't Login?

1. **Check Database Connection**
   ```bash
   # Test MongoDB connection
   mongosh "your-connection-string"
   ```

2. **Check User Exists**
   ```bash
   # In MongoDB shell
   use estatebank
   db.users.find()
   ```

3. **Check JWT Secret**
   - Verify `JWT_SECRET` is set
   - Must match in all environments

4. **Check Cookies**
   - Open browser DevTools → Application → Cookies
   - Verify `auth_token` cookie exists
   - Check if httpOnly is set

### Token Expired?

- Tokens expire after 7 days
- User needs to login again
- Consider implementing refresh tokens

---

## ✅ Production Checklist

- [ ] Installed bcryptjs and jsonwebtoken
- [ ] Set JWT_SECRET environment variable
- [ ] Set ADMIN_CREATE_SECRET
- [ ] Created admin user in database
- [ ] Updated login page to use API
- [ ] Created auth middleware
- [ ] Updated logout functionality
- [ ] Tested login/logout flow
- [ ] Configured production environment variables
- [ ] Set up HTTPS
- [ ] Changed default admin password

---

## 🎯 Next Steps

1. **Multi-User Support**: Create user management page
2. **Password Reset**: Implement forgot password flow
3. **Role-Based Access**: Add manager/agent roles
4. **Activity Logging**: Track user actions
5. **Two-Factor Auth**: Add 2FA for extra security

---

**Your production authentication is now secure! 🔐✨**


