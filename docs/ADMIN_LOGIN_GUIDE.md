# Admin Login Guide

## Overview
This guide explains how the admin login system works in the EstateBANK.in dashboard and how to use it.

---

## Current Login System

### 🔐 **Authentication Method**
The current system uses **localStorage-based authentication** for simplicity during development. This means:
- Login credentials are hardcoded (for testing)
- Authentication state is stored in browser's localStorage
- No database authentication yet (can be upgraded later)

---

## How to Login

### **Step 1: Access Login Page**
1. Navigate to: `http://localhost:3000/login`
2. Or try to access any dashboard page - you'll be redirected to login automatically

### **Step 2: Enter Credentials**

**Test Credentials (Currently Hardcoded):**
- **Email**: `admin@test.com`
- **Password**: `admin123`

### **Step 3: Submit**
- Click "Sign In" button
- You'll be redirected to `/dashboard` upon successful login

---

## How It Works (Technical Details)

### **1. Login Process** (`/app/login/page.tsx`)

```typescript
// Credentials are validated against hardcoded values
const TEST_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123',
};

// On successful login:
localStorage.setItem('dashboard_authenticated', 'true');
localStorage.setItem('dashboard_user_email', email);
router.push('/dashboard');
```

### **2. Authentication Check** (`/app/(dashboard)/layout.tsx`)

The dashboard layout checks authentication on every page load:

```typescript
useEffect(() => {
  const authStatus = localStorage.getItem('dashboard_authenticated');
  const isAuth = authStatus === 'true';
  
  // Redirect to login if not authenticated
  if (!isAuth && pathname !== '/login') {
    router.push('/login');
  }
}, [router, pathname]);
```

### **3. Protected Routes**
- All routes under `/dashboard/*` are protected
- Unauthenticated users are automatically redirected to `/login`
- Login page itself is not protected (to allow access)

---

## Logout Functionality

### **How to Logout**
1. Click on your **profile/avatar** in the top-right corner of the dashboard
2. Select **"Logout"** from the dropdown menu
3. You'll be logged out and redirected to the login page

### **What Happens on Logout**
```typescript
const handleLogout = () => {
  localStorage.removeItem('dashboard_authenticated');
  localStorage.removeItem('dashboard_user_email');
  router.push('/login');
  toast.success('Logged out successfully');
};
```

---

## Security Considerations

### ⚠️ **Current Limitations**
1. **Hardcoded Credentials**: Login uses hardcoded test credentials
2. **No Password Hashing**: Passwords are stored/compared in plain text
3. **localStorage Security**: Authentication token stored in localStorage (vulnerable to XSS)
4. **No Session Management**: No token expiration or refresh mechanism
5. **No Multi-User Support**: Only one admin account exists

### ✅ **Recommended Upgrades for Production**

#### **1. Database-Based Authentication**
```typescript
// Create User model
const User = mongoose.model('User', {
  email: String,
  passwordHash: String, // Use bcrypt
  role: String,
  createdAt: Date
});

// API endpoint: POST /api/auth/login
// Validate against database
// Return JWT token
```

#### **2. JWT Token Authentication**
- Generate JWT token on login
- Store token in httpOnly cookie (more secure than localStorage)
- Validate token on each API request
- Implement token refresh mechanism

#### **3. Password Security**
- Hash passwords using bcrypt
- Require strong passwords (min length, complexity)
- Implement password reset functionality
- Add rate limiting for login attempts

#### **4. Multi-User Support**
- Create user management system
- Role-based access control (Admin, Manager, Agent)
- User permissions per feature
- Activity logging

---

## Testing Login

### **Manual Testing**
1. **Test Valid Login:**
   - Go to `/login`
   - Enter: `admin@test.com` / `admin123`
   - Should redirect to dashboard

2. **Test Invalid Login:**
   - Enter wrong credentials
   - Should show error message
   - Should NOT redirect

3. **Test Protected Routes:**
   - Logout
   - Try accessing `/dashboard` directly
   - Should redirect to `/login`

4. **Test Logout:**
   - Click logout
   - Should clear localStorage
   - Should redirect to login

### **Browser Console Testing**
```javascript
// Check authentication status
console.log(localStorage.getItem('dashboard_authenticated'));

// Manually set authentication (for testing)
localStorage.setItem('dashboard_authenticated', 'true');
localStorage.setItem('dashboard_user_email', 'admin@test.com');

// Manually logout
localStorage.removeItem('dashboard_authenticated');
localStorage.removeItem('dashboard_user_email');
window.location.href = '/login';
```

---

## Upgrading to Database Authentication

### **Step 1: Create User Model**
```typescript
// models/user.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'agent'], default: 'agent' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
```

### **Step 2: Create Auth API**
```typescript
// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import User from "@/models/user";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse("Invalid credentials", 401);
  }
  
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return errorResponse("Invalid credentials", 401);
  }
  
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  return successResponse({ token, user: { email: user.email, name: user.name } });
}
```

### **Step 3: Update Login Page**
```typescript
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in httpOnly cookie (set by API)
    router.push('/dashboard');
  } else {
    setError(data.error);
  }
};
```

### **Step 4: Create Auth Middleware**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      jwt.verify(token.value, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## Troubleshooting

### **Issue: Can't Login**
- **Check**: Are you using correct credentials? (`admin@test.com` / `admin123`)
- **Check**: Is localStorage enabled in your browser?
- **Check**: Open browser console for errors

### **Issue: Redirected to Login After Login**
- **Check**: localStorage might be blocked (private/incognito mode)
- **Check**: Clear browser cache and try again
- **Check**: Check browser console for errors

### **Issue: Logout Not Working**
- **Check**: Click logout from dropdown menu (top-right)
- **Check**: Manually clear localStorage:
  ```javascript
  localStorage.clear();
  window.location.href = '/login';
  ```

---

## Current Status

✅ **Working:**
- Login page with form validation
- Hardcoded credential authentication
- Protected dashboard routes
- Logout functionality
- Automatic redirect to login when not authenticated

⚠️ **Needs Upgrade:**
- Database-based authentication
- Password hashing
- JWT token system
- Multi-user support
- Role-based access control
- Password reset functionality

---

## Quick Reference

**Login URL:** `http://localhost:3000/login`

**Test Credentials:**
- Email: `admin@test.com`
- Password: `admin123`

**Logout:** Click profile → Logout

**Check Auth Status:**
```javascript
localStorage.getItem('dashboard_authenticated') === 'true'
```

