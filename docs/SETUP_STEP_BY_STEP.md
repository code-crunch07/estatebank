# Step-by-Step Setup Guide

Follow these steps one by one to set up emails and authentication.

---

## ✅ Step 1: Set Up Brevo SMTP Email

### 1.1 Create Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click **"Sign Up Free"**
3. Fill in:
   - Email address
   - Password
   - Company name (optional)
4. Verify your email (check inbox)
5. Complete onboarding

**⏱️ Time: 2 minutes**

---

### 1.2 Get SMTP Credentials

1. Log in to Brevo dashboard
2. Click **Settings** (gear icon) in left sidebar
3. Click **SMTP & API**
4. Click **SMTP** tab
5. You'll see:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS)
   - **Login**: Your Brevo account email
6. Click **"Generate SMTP Key"** button
7. **Copy the password** (you'll only see it once!)

**⏱️ Time: 2 minutes**

---

### 1.3 Add Environment Variables

Open your `.env` or `.env.local` file and add:

```env
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@brevo.com
BREVO_SMTP_PASSWORD=paste-your-smtp-password-here
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in
ADMIN_EMAIL=pankaj.realdeals@gmail.com
```

**Replace:**
- `your-email@brevo.com` → Your Brevo account email
- `paste-your-smtp-password-here` → The SMTP password you copied
- `noreply@estatebank.in` → Your verified sender email (or use your Brevo email)

**⏱️ Time: 1 minute**

---

### 1.4 Verify Sender Email (Important!)

1. In Brevo dashboard, go to **Settings** → **Senders & IP**
2. Click **"Add a sender"**
3. Enter your email: `noreply@estatebank.in` (or your domain email)
4. Click **"Save"**
5. Check your email inbox for verification link
6. Click the verification link
7. Once verified, you can use it as `BREVO_FROM_EMAIL`

**⏱️ Time: 2 minutes**

---

### 1.5 Test Email Sending

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/contact`

3. Fill out the contact form:
   - Name: Test User
   - Email: your-email@example.com
   - Phone: 1234567890
   - Message: This is a test message

4. Click **"Send Message"**

5. Check:
   - ✅ Your email inbox (should receive enquiry)
   - ✅ Brevo dashboard → Statistics → Email Logs (should show sent email)

**⏱️ Time: 2 minutes**

---

## ✅ Step 1 Complete!

If you received the email, **Step 1 is done!** 

**Next:** Move to Step 2 (Authentication Setup)

---

## 🔐 Step 2: Set Up Production Authentication

### 2.1 Generate Secret Keys

Open terminal and run:

```bash
# Generate JWT Secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Admin Creation Secret (16 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Copy both secrets** - you'll need them in the next step.

**⏱️ Time: 1 minute**

---

### 2.2 Add Authentication Environment Variables

Add to your `.env` file:

```env
# Authentication Secrets
JWT_SECRET=paste-your-jwt-secret-here
ADMIN_CREATE_SECRET=paste-your-admin-secret-here

# Database (MongoDB)
MONGODB_URI=your-mongodb-connection-string

# Admin User Creation (for creating admin user)
ADMIN_EMAIL_CREATE=admin@estatebank.in
ADMIN_PASSWORD_CREATE=YourSecurePassword123
ADMIN_NAME_CREATE=Admin User
```

**Replace:**
- `paste-your-jwt-secret-here` → First secret from Step 2.1
- `paste-your-admin-secret-here` → Second secret from Step 2.1
- `your-mongodb-connection-string` → Your MongoDB connection string
- `YourSecurePassword123` → Choose a strong password

**⏱️ Time: 2 minutes**

---

### 2.3 Create Admin User

Run this command:

```bash
npx tsx scripts/create-admin.ts
```

**Expected output:**
```
✅ Connected to database
✅ Admin user created successfully!

📧 Email: admin@estatebank.in
🔑 Password: YourSecurePassword123

⚠️  IMPORTANT: Change the password after first login!
⚠️  Store these credentials securely!
```

**⏱️ Time: 1 minute**

---

### 2.4 Test Login

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/login`

3. Enter credentials:
   - **Email**: `admin@estatebank.in` (or what you set in ADMIN_EMAIL_CREATE)
   - **Password**: `YourSecurePassword123` (or what you set in ADMIN_PASSWORD_CREATE)

4. Click **"Sign In"**

5. Should redirect to `/dashboard`

**⏱️ Time: 1 minute**

---

## ✅ Step 2 Complete!

If you can login and see the dashboard, **Step 2 is done!**

---

## 🎉 All Setup Complete!

Your application now has:
- ✅ Working email system (Brevo SMTP)
- ✅ Secure authentication (JWT + bcrypt)
- ✅ Admin user created
- ✅ Production-ready setup

---

## 📋 Summary

**Email Setup:**
- Brevo account created
- SMTP credentials configured
- Sender email verified
- Test email sent successfully

**Authentication Setup:**
- Secret keys generated
- Admin user created
- Login tested successfully

---

## 🚀 Next: Production Deployment

When ready to deploy:

1. Add all environment variables to your production server
2. Run `npx tsx scripts/create-admin.ts` on production
3. Restart your application
4. Test login on production URL

---

**Need help?** Check the detailed guides:
- `BREVO_EMAIL_SETUP.md` - Email troubleshooting
- `PRODUCTION_AUTH_SETUP.md` - Auth troubleshooting


