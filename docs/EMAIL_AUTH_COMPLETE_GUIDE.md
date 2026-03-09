# Complete Email & Authentication Setup Guide

This guide covers everything you need to set up Brevo SMTP emails and production authentication.

---

## 📧 Part 1: Brevo SMTP Email Setup

### Quick Setup (5 minutes)

1. **Create Brevo Account**
   - Go to [brevo.com](https://www.brevo.com)
   - Sign up (free - 300 emails/day)

2. **Get SMTP Credentials**
   - Dashboard → Settings → SMTP & API
   - Click "SMTP" tab
   - Generate SMTP password
   - Copy: Server, Port, Login, Password

3. **Add to `.env`:**
   ```env
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_USER=your-email@example.com
   BREVO_SMTP_PASSWORD=your-smtp-password
   BREVO_FROM_EMAIL=noreply@estatebank.in
   BREVO_FROM_NAME=EstateBANK.in
   ADMIN_EMAIL=pankaj.realdeals@gmail.com
   ```

4. **Install Dependencies:**
   ```bash
   npm install nodemailer
   ```

5. **Test:**
   - Visit contact page
   - Submit form
   - Check email inbox

**See `BREVO_EMAIL_SETUP.md` for detailed guide.**

---

## 🔐 Part 2: Production Authentication Setup

### Quick Setup (10 minutes)

1. **Install Dependencies:**
   ```bash
   npm install bcryptjs jsonwebtoken
   npm install -D @types/bcryptjs @types/jsonwebtoken tsx
   ```

2. **Set Environment Variables:**
   ```env
   JWT_SECRET=generate-random-32-char-string
   ADMIN_CREATE_SECRET=generate-random-16-char-string
   MONGODB_URI=your-mongodb-connection-string
   ```

   Generate secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Create Admin User:**
   ```bash
   # Set admin credentials in .env first:
   ADMIN_EMAIL=admin@estatebank.in
   ADMIN_PASSWORD=YourSecurePassword123
   ADMIN_NAME=Admin User
   
   # Then run:
   npx tsx scripts/create-admin.ts
   ```

4. **Login:**
   - Go to `/login`
   - Use credentials from step 3
   - You're in!

**See `PRODUCTION_AUTH_SETUP.md` for detailed guide.**

---

## 📋 Complete Checklist

### Email Setup:
- [ ] Created Brevo account
- [ ] Generated SMTP password
- [ ] Verified sender email
- [ ] Added environment variables
- [ ] Installed nodemailer
- [ ] Tested contact form
- [ ] Tested property enquiry form

### Authentication Setup:
- [ ] Installed bcryptjs & jsonwebtoken
- [ ] Set JWT_SECRET
- [ ] Set ADMIN_CREATE_SECRET
- [ ] Created admin user
- [ ] Tested login
- [ ] Tested logout
- [ ] Updated production environment

---

## 🚀 Production Deployment

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables
```bash
# In CloudPanel or Vercel, add:
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@brevo.com
BREVO_SMTP_PASSWORD=your-smtp-password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in
ADMIN_EMAIL=pankaj.realdeals@gmail.com

JWT_SECRET=your-jwt-secret
ADMIN_CREATE_SECRET=your-admin-secret
MONGODB_URI=your-mongodb-uri
```

### Step 3: Create Admin User
```bash
# On server:
cd /path/to/your/app
npx tsx scripts/create-admin.ts
```

### Step 4: Restart Application
```bash
pm2 restart estatebank
```

---

## 📧 Email Features Implemented

✅ **Contact Form** (`/contact`)
- Sends email to admin
- Sends confirmation to user
- Stores enquiry in database

✅ **Property Enquiry** (`/properties/[segment]/[slug]`)
- "Schedule Tour" form
- Sends email with property details
- Sends confirmation to user

✅ **Dashboard Enquiries**
- All enquiries stored in database
- Viewable in dashboard
- Email notifications sent

---

## 🔐 Authentication Features

✅ **Secure Login**
- Database-stored users
- Password hashing (bcrypt)
- JWT tokens
- HttpOnly cookies

✅ **Protected Routes**
- Dashboard routes protected
- Automatic redirect to login
- Token validation

✅ **Logout**
- Clears cookies
- Clears localStorage
- Redirects to login

---

## 🆘 Troubleshooting

### Emails Not Sending?
1. Check Brevo dashboard → Email Logs
2. Verify SMTP credentials
3. Check sender email is verified
4. Check rate limits (300/day free)

### Can't Login?
1. Verify admin user exists in database
2. Check JWT_SECRET is set
3. Check database connection
4. Try creating admin again

### Need Help?
- See `BREVO_EMAIL_SETUP.md` for email issues
- See `PRODUCTION_AUTH_SETUP.md` for auth issues

---

## 📚 Files Created

1. `lib/email.ts` - Email service with Brevo SMTP
2. `app/api/email/contact/route.ts` - Contact form API
3. `app/api/email/property-enquiry/route.ts` - Property enquiry API
4. `app/api/auth/login/route.ts` - Login API
5. `app/api/auth/logout/route.ts` - Logout API
6. `scripts/create-admin.ts` - Admin user creation script
7. `BREVO_EMAIL_SETUP.md` - Email setup guide
8. `PRODUCTION_AUTH_SETUP.md` - Auth setup guide

---

## ✅ You're All Set!

Your application now has:
- ✅ Working email system (Brevo SMTP)
- ✅ Secure authentication (JWT + bcrypt)
- ✅ Production-ready setup
- ✅ Admin user creation

**Next Steps:**
1. Set up Brevo account
2. Create admin user
3. Test email sending
4. Deploy to production

**Happy coding! 🚀**


