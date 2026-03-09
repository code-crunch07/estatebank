# Complete Environment Variables Guide

**Date:** January 28, 2026

---

## 📋 Complete .env File Template

Add these to your `.env.local` or `.env.production` file:

```env
# ============================================
# MONGODB CONFIGURATION
# ============================================
MONGODB_URI=mongodb://admin:your_password@localhost:27017/estatebank?authSource=admin

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# ============================================
# ADMIN USER CREATION
# ============================================
ADMIN_CREATE_SECRET=your-admin-creation-secret-key
ADMIN_EMAIL=admin@estatebank.in
ADMIN_NAME_CREATE=Admin User
ADMIN_PASSWORD_CREATE=YourSecurePassword123!

# ============================================
# BREVO EMAIL (SMTP)
# ============================================
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_PASSWORD=your_brevo_smtp_password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in

# ============================================
# TWILIO (OTP/SMS - Optional)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================
# LOCAL UPLOADS (Image Storage - Default)
# ============================================
# Optional: Custom path for uploads (default: public/uploads)
# UPLOAD_PATH=/home/estatebanknew/htdocs/estatebank.in/uploads

# ============================================
# CLOUDINARY (Image Storage - Optional, not used with local uploads)
# ============================================
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🆕 Cloudinary Variables (Add These)

After setting up Cloudinary, add these **three lines** to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Where to Get Cloudinary Credentials:**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → **Settings** (gear icon)
3. Scroll to **Product Environment Credentials**
4. Copy:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## 📝 Example .env File

Here's a complete example with placeholder values:

```env
# MongoDB
MONGODB_URI=mongodb://admin:password123@localhost:27017/estatebank?authSource=admin

# JWT
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567

# Admin Creation
ADMIN_CREATE_SECRET=secret123456789
ADMIN_EMAIL=admin@estatebank.in
ADMIN_NAME_CREATE=Admin User
ADMIN_PASSWORD_CREATE=SecurePass123!

# Brevo Email
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_user@example.com
BREVO_SMTP_PASSWORD=your_brevo_password
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in

# Twilio (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary - ADD THESE THREE LINES
CLOUDINARY_CLOUD_NAME=dxample123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## ✅ Quick Checklist

After adding Cloudinary variables:

- [ ] Added `CLOUDINARY_CLOUD_NAME` to `.env`
- [ ] Added `CLOUDINARY_API_KEY` to `.env`
- [ ] Added `CLOUDINARY_API_SECRET` to `.env`
- [ ] Restarted dev server (`npm run dev`)
- [ ] Verified no errors in console
- [ ] Ready to run migration script

---

## 🔍 Verify Environment Variables

Check if variables are loaded:

```bash
# In your terminal
node -e "console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing')"
```

Or check in your code:

```typescript
console.log('Cloudinary Config:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  apiKey: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
});
```

---

## 🚨 Important Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use different values for production** - Don't use dev credentials in production
3. **Restart server after changes** - Environment variables load on startup
4. **Keep secrets secure** - Don't share `.env` file

---

## 📍 File Locations

- **Development:** `.env.local` (preferred) or `.env`
- **Production:** `.env.production` or `.env`
- **Docker:** `.env` (read by docker-compose.yml)

---

## 🆘 Troubleshooting

### **"Cloudinary credentials not found"**
- Check `.env` file exists
- Verify all three variables are added
- Restart dev server: `npm run dev`

### **Variables not loading**
- Check file name: `.env.local` or `.env`
- Check file location: root directory (same as `package.json`)
- Restart server after adding variables

### **Wrong values**
- Double-check Cloudinary dashboard
- Copy-paste credentials (no extra spaces)
- Verify credentials are active in Cloudinary
