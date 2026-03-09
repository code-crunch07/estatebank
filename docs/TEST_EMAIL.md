# Test Email Sending

## Quick Test Steps

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Visit Contact Page:**
   - Open: http://localhost:3000/contact
   - Or visit any property page and use "Schedule Tour" form

3. **Fill Out Form:**
   - Name: Test User
   - Email: your-real-email@example.com (use your real email to receive confirmation)
   - Phone: 1234567890
   - Message: This is a test email from EstateBANK.in

4. **Submit Form:**
   - Click "Send Message"
   - Should see success message

5. **Check Emails:**
   - ✅ Check your inbox (the email you set as ADMIN_EMAIL)
   - ✅ Check the user's email (confirmation email)
   - ✅ Check Brevo dashboard → Statistics → Email Logs

## Expected Results

✅ **Admin Email** (pankaj.realdeals@gmail.com):
   - Subject: "New Contact Form Submission - Test User"
   - Contains: Name, Email, Phone, Message

✅ **User Email** (the email you entered in form):
   - Subject: "Thank you for your enquiry - EstateBANK.in"
   - Confirmation message

✅ **Brevo Dashboard:**
   - Shows 2 emails sent (1 to admin, 1 to user)
   - Status: "Delivered"

## Troubleshooting

**If emails don't send:**
1. Check `.env.local` has correct credentials
2. Check Brevo dashboard → Email Logs for errors
3. Check server console for error messages
4. Verify sender email is verified in Brevo

**Common Errors:**
- "Invalid login" → Check BREVO_SMTP_USER and BREVO_SMTP_PASSWORD
- "Unverified sender" → Verify email in Brevo dashboard
- "Rate limit" → Free tier: 300 emails/day


