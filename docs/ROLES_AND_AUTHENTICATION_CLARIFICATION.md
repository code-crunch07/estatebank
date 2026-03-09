# Roles & Authentication Clarification

**Date:** January 28, 2026  
**Status:** 📋 **CLARIFICATION DOCUMENT**

---

## ⚠️ Important: Two Separate Systems

Your application has **TWO DIFFERENT** role/user systems that serve different purposes:

---

## 1️⃣ **User Model** (Dashboard Authentication) 🔐

### Purpose
- **Dashboard login authentication**
- **Who can access the dashboard**

### Location
- **Model:** `app/api/auth/login/route.ts` (UserSchema)
- **Database Collection:** `users`

### Roles Available
```typescript
role: ['admin', 'manager', 'agent']
```

### Fields
- `email` - Login email
- `password` - Hashed password (for login)
- `name` - User's name
- `role` - `'admin'` | `'manager'` | `'agent'`
- `status` - `'active'` | `'inactive'`

### How It Works
1. **Login:** User enters email/password → `/api/auth/login`
2. **Verification:** Checks email + password + `status: 'active'`
3. **Access:** If valid → Sets cookie → Grants dashboard access
4. **Role:** Stored in JWT token and returned in response

### Can Team Members Login?
✅ **YES** - If you create a **User** account for them with:
- Their email
- A password
- Role: `'admin'`, `'manager'`, or `'agent'`
- Status: `'active'`

### Example: Creating a Team Member User Account
```typescript
// Via API: PUT /api/auth/create-admin
// Or via script: scripts/create-admin.ts

{
  email: "manager@example.com",
  password: "securepassword123",
  name: "John Manager",
  role: "manager",  // or "admin" or "agent"
  status: "active"
}
```

**Then they can login at `/login` with:**
- Email: `manager@example.com`
- Password: `securepassword123`

---

## 2️⃣ **TeamMember Model** (Website Display) 👥

### Purpose
- **Display team members on public website**
- **Show team info, photos, bios**
- **NOT for authentication**

### Location
- **Model:** `models/team-member.ts`
- **Database Collection:** `teammembers`

### Roles Available
```typescript
role: [
  "CEO & Founder",
  "Sales Head",
  "Sales In Charge",
  "Sourcing Manager",
  "Manager",
  "Agent",
  "Admin",
  "Support"
]
```

### Fields
- `name` - Display name
- `email` - Contact email (public)
- `phone` - Contact phone
- `role` - Display role (e.g., "Sales Head")
- `image` - Profile photo
- `bio` - Biography
- `status` - `"Active"` | `"Inactive"` (for display)

### How It Works
1. **Display Only:** Shows team members on website
2. **No Authentication:** Cannot login with TeamMember
3. **Public Info:** Visible to website visitors

### Can Team Members Login?
❌ **NO** - TeamMember is **display-only**
- No password field
- No authentication
- Just for showing team on website

---

## 🔄 The Relationship

### Scenario 1: Team Member Can Login ✅
**If you want a team member to login to dashboard:**

1. **Create User Account:**
   ```typescript
   // Create User (for login)
   {
     email: "john@example.com",
     password: "password123",
     name: "John Doe",
     role: "manager",  // Dashboard role
     status: "active"
   }
   ```

2. **Optionally Create TeamMember (for website display):**
   ```typescript
   // Create TeamMember (for website)
   {
     name: "John Doe",
     email: "john@example.com",
     role: "Sales Head",  // Display role
     image: "/team/john.jpg",
     bio: "Experienced sales professional..."
   }
   ```

**Result:**
- ✅ Can login to dashboard (via User)
- ✅ Shows on website (via TeamMember)
- ⚠️ **Two separate records** (can have same email)

---

### Scenario 2: Team Member Cannot Login ❌
**If TeamMember exists but no User account:**

1. **Only TeamMember exists:**
   ```typescript
   {
     name: "Jane Smith",
     email: "jane@example.com",
     role: "Agent"
   }
   ```

**Result:**
- ❌ **Cannot login** (no User account)
- ✅ Shows on website (via TeamMember)

---

## 🎯 User Role Management (UI Feature)

### Location
- `app/(dashboard)/dashboard/settings/user-role-management.tsx`

### What It Does
- **UI-only permission management**
- Stores roles/permissions in **localStorage** (not database)
- Used for **displaying** what permissions each role has
- **NOT connected to actual User authentication**

### Roles Defined (UI Only)
- Super Admin
- Admin
- Manager
- Agent
- Support

### Important
- ⚠️ This is **NOT** the same as User model roles
- ⚠️ This is **NOT** enforced in code
- ⚠️ This is **just a UI feature** for reference

---

## 📋 Summary Table

| Feature | User Model | TeamMember Model | User Role Management UI |
|---------|-----------|------------------|------------------------|
| **Purpose** | Dashboard login | Website display | Permission reference |
| **Can Login?** | ✅ Yes | ❌ No | ❌ No |
| **Has Password?** | ✅ Yes | ❌ No | ❌ No |
| **Roles** | `admin`, `manager`, `agent` | `CEO & Founder`, `Sales Head`, etc. | `Super Admin`, `Admin`, etc. |
| **Stored In** | Database (`users`) | Database (`teammembers`) | localStorage (UI only) |
| **Used For** | Authentication | Public display | UI reference |

---

## ❓ Answering Your Question

### "Can team members login dashboard without admin ID if we assign any role?"

**Answer:**

1. **If you create a User account for them:**
   - ✅ **YES** - They can login with their own email/password
   - ✅ **NO admin ID needed** - They have their own account
   - ✅ **Role assigned** - Set `role: 'manager'` or `'agent'` when creating User

2. **If you only create TeamMember:**
   - ❌ **NO** - TeamMember cannot login (no password)
   - ❌ **Cannot assign role** - TeamMember roles are just for display

3. **To give team member dashboard access:**
   ```typescript
   // Step 1: Create User account (for login)
   PUT /api/auth/create-admin
   {
     email: "teammember@example.com",
     password: "theirpassword",
     name: "Team Member Name",
     role: "agent",  // or "manager" or "admin"
     secretKey: "YOUR_SECRET_KEY"
   }
   
   // Step 2: (Optional) Create TeamMember (for website display)
   POST /api/people/team
   {
     name: "Team Member Name",
     email: "teammember@example.com",
     role: "Agent",  // Display role
     ...
   }
   ```

---

## 🔐 Current Authentication Flow

### Login Process
1. User goes to `/login`
2. Enters email + password
3. API checks `User` model:
   ```typescript
   User.findOne({ email, status: 'active' })
   ```
4. If found → Verify password → Generate JWT → Set cookie
5. User gets dashboard access

### Role Check
- Role is stored in JWT token
- Role is returned in login response
- **Currently NOT enforced** in dashboard (all authenticated users see everything)
- **Can be enforced** by checking role in middleware/API routes

---

## 🚨 Current Limitations

### 1. No Role-Based Access Control (RBAC)
- All authenticated users see **all dashboard pages**
- Roles exist but **not enforced**
- Need middleware/API checks to restrict access

### 2. User Role Management UI Not Connected
- UI shows permissions but **doesn't enforce them**
- Permissions stored in localStorage (not database)
- Not checked during authentication

### 3. TeamMember ≠ User
- Two separate systems
- Must create both if you want login + display
- No automatic sync

---

## ✅ Recommendations

### To Enable Team Member Login:

1. **Create User Account:**
   ```bash
   # Use script
   npm run create-admin
   # Or use API endpoint
   PUT /api/auth/create-admin
   ```

2. **Set Appropriate Role:**
   - `admin` - Full access
   - `manager` - Management access
   - `agent` - Basic access

3. **They Login Independently:**
   - Email: Their email
   - Password: Their password
   - **No admin ID needed**

### To Enforce Role-Based Access:

1. **Add Middleware:**
   ```typescript
   // middleware.ts
   // Check role from JWT token
   // Restrict routes based on role
   ```

2. **Add API Route Protection:**
   ```typescript
   // In API routes
   if (user.role !== 'admin') {
     return errorResponse('Unauthorized', 403);
   }
   ```

---

## 📝 Example: Creating a Manager Account

```typescript
// 1. Create User (for login)
PUT /api/auth/create-admin
{
  email: "manager@estatebank.in",
  password: "securepassword",
  name: "John Manager",
  role: "manager",
  secretKey: process.env.ADMIN_CREATE_SECRET
}

// 2. Manager can now login at /login
// Email: manager@estatebank.in
// Password: securepassword

// 3. (Optional) Add to team display
POST /api/people/team
{
  name: "John Manager",
  email: "manager@estatebank.in",
  role: "Manager",
  image: "/team/john.jpg"
}
```

---

## 🎯 Bottom Line

**Question:** "Can team members login dashboard without admin ID if we assign any role?"

**Answer:** 
- ✅ **YES** - If you create a **User** account for them
- ✅ **NO admin ID needed** - They login with their own email/password
- ✅ **Role assigned** - Set `role: 'manager'` or `'agent'` when creating User
- ❌ **TeamMember alone** - Cannot login (display only)

**To do this:**
1. Create User account via `/api/auth/create-admin` or script
2. Set role: `'admin'`, `'manager'`, or `'agent'`
3. They login independently with their email/password
