# Brevo (Sendinblue) SMTP Email Setup Guide

Complete guide to set up Brevo SMTP for sending emails from EstateBANK.in application.

## 📧 What is Brevo?

Brevo (formerly Sendinblue) is an email service provider that offers:
- **Free Tier**: 300 emails/day
- **SMTP Access**: Send transactional emails
- **Email Templates**: HTML email support
- **Reliable Delivery**: High deliverability rates

---

## 🚀 Step 1: Create Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click **"Sign Up Free"**
3. Fill in your details:
   - Email address
   - Password
   - Company name (optional)
4. Verify your email address
5. Complete onboarding

---

## 🔑 Step 2: Get SMTP Credentials

### Option A: SMTP & API (Recommended)

1. Log in to Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Click **"SMTP"** tab
4. You'll see:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Login**: Your Brevo account email
   - **Password**: Click **"Generate SMTP Key"** to create a password

### Option B: API Key (Alternative)

1. Go to **Settings** → **SMTP & API**
2. Click **"API Keys"** tab
3. Click **"Generate a new API key"**
4. Name it: `EstateBANK.in Production`
5. Copy the API key (you'll only see it once!)

---

## ⚙️ Step 3: Configure Environment Variables

Add to your `.env` or `.env.local` file:

```env
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_PASSWORD=your-smtp-password

# OR use API Key method:
BREVO_API_KEY=your-api-key-here
BREVO_SMTP_KEY=your-smtp-key-here

# Email Settings
BREVO_FROM_EMAIL=noreply@estatebank.in
BREVO_FROM_NAME=EstateBANK.in
ADMIN_EMAIL=pankaj.realdeals@gmail.com
```

**Important Notes:**
- `BREVO_SMTP_USER` = Your Brevo account email
- `BREVO_SMTP_PASSWORD` = SMTP password (from Step 2)
- `BREVO_FROM_EMAIL` = Verified sender email in Brevo
- `ADMIN_EMAIL` = Email where enquiries will be sent

---

## 📝 Step 4: Verify Sender Email

1. Go to **Settings** → **Senders & IP**
2. Click **"Add a sender"**
3. Enter your email: `noreply@estatebank.in` (or your domain email)
4. Verify the email (check inbox for verification link)
5. Once verified, you can use it as `BREVO_FROM_EMAIL`

---

## 📦 Step 5: Install Nodemailer

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

## ✅ Step 6: Test Email Sending

### Test Contact Form

1. Visit your contact page: `http://localhost:3000/contact`
2. Fill out the form
3. Submit
4. Check:
   - Admin email inbox (should receive enquiry)
   - User email inbox (should receive confirmation)

### Test Property Enquiry

1. Visit a property details page
2. Fill out "Schedule Tour" form
3. Submit
4. Check emails

---

## 🔍 Troubleshooting

### Email Not Sending?

1. **Check Environment Variables**
   ```bash
   # Verify variables are set
   echo $BREVO_SMTP_USER
   echo $BREVO_SMTP_PASSWORD
   ```

2. **Check Brevo Dashboard**
   - Go to **Statistics** → **Email Logs**
   - See if emails are being sent
   - Check for errors

3. **Check Server Logs**
   ```bash
   # In your terminal
   npm run dev
   # Look for email errors in console
   ```

4. **Common Issues:**
   - ❌ Wrong SMTP password → Regenerate in Brevo
   - ❌ Unverified sender → Verify email in Brevo
   - ❌ Rate limit exceeded → Free tier: 300/day
   - ❌ Port blocked → Try port 465 (SSL) instead

### Email Going to Spam?

1. **Verify Sender Domain** (Recommended for production)
   - Add SPF record to your domain DNS
   - Add DKIM record (Brevo provides this)
   - Add DMARC record

2. **Use Verified Email**
   - Always use verified sender email
   - Use your domain email (not Gmail/Hotmail)

---

## 🚀 Production Deployment

### For CloudPanel/VPS:

1. **Add Environment Variables:**
   ```bash
   # SSH into your server
   cd /home/cloudpanel/htdocs/estatebanknew.optimaxmedia.in
   
   # Edit .env file
   nano .env
   
   # Add Brevo credentials
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_USER=your-email@example.com
   BREVO_SMTP_PASSWORD=your-smtp-password
   BREVO_FROM_EMAIL=noreply@estatebank.in
   BREVO_FROM_NAME=EstateBANK.in
   ADMIN_EMAIL=pankaj.realdeals@gmail.com
   ```

2. **Restart Application:**
   ```bash
   pm2 restart estatebank
   ```

### For Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add all Brevo variables
3. Redeploy

---

## 📊 Email Templates

The application includes these email templates:

1. **Contact Form Email** - Sent to admin when contact form is submitted
2. **Property Enquiry Email** - Sent to admin when property enquiry is submitted
3. **Confirmation Email** - Sent to user after submission

All templates are HTML-formatted and mobile-responsive.

---

## 💰 Pricing

- **Free Plan**: 300 emails/day
- **Lite Plan**: $25/month - 10,000 emails/month
- **Premium Plan**: $65/month - 20,000 emails/month

**For EstateBANK.in**: Free plan should be sufficient initially (300 enquiries/day).

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use strong SMTP password** (generate in Brevo)
3. **Rotate passwords** periodically
4. **Monitor email logs** in Brevo dashboard
5. **Set up rate limiting** to prevent abuse

---

## 📚 Resources

- [Brevo Documentation](https://developers.brevo.com/)
- [Brevo SMTP Guide](https://help.brevo.com/hc/en-us/articles/209467485)
- [Nodemailer Documentation](https://nodemailer.com/)

---

## ✅ Quick Checklist

- [ ] Created Brevo account
- [ ] Generated SMTP password
- [ ] Verified sender email
- [ ] Added environment variables
- [ ] Installed nodemailer
- [ ] Tested contact form
- [ ] Tested property enquiry form
- [ ] Configured production environment
- [ ] Set up email monitoring

---

## 🆘 Need Help?

If emails aren't working:

1. Check Brevo dashboard → Email Logs
2. Check server console for errors
3. Verify environment variables are set
4. Test SMTP connection manually
5. Contact Brevo support if needed

**You're all set! Emails will now be sent via Brevo SMTP.** 📧✨


