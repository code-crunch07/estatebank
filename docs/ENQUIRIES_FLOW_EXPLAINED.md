# How Enquiries Flow Works

Complete explanation of how enquiries submitted from frontend forms appear in the dashboard.

---

## 🔄 Complete Flow

### Step 1: User Submits Form

**Contact Form** (`/contact`):
- User fills: Name, Email, Phone, Message, Property (optional)
- Clicks "Send Message"
- Form submits to: `/api/email/contact`

**Property Enquiry Form** (`/properties/[segment]/[slug]`):
- User fills: Name, Email, Phone, Message
- Property name auto-filled
- Clicks "Submit Inquiry"
- Form submits to: `/api/email/property-enquiry`

---

### Step 2: API Processes Request

**What Happens:**

1. **Validates Data**
   - Checks required fields (name, email, phone, message)
   - Validates email format

2. **Saves to Database**
   - Connects to MongoDB
   - Creates new Enquiry document
   - Status: "New"
   - Saves: name, email, phone, property, message, timestamps

3. **Sends Email**
   - Sends email to admin (`ADMIN_EMAIL`)
   - Sends confirmation email to user
   - If email fails, enquiry is still saved (doesn't fail)

4. **Returns Success**
   - Returns success response
   - Frontend shows success message

---

### Step 3: Dashboard Displays Enquiries

**Enquiries Page** (`/dashboard/communication/enquiries`):

1. **Fetches Data**
   - Calls `/api/enquiries` API
   - Gets all enquiries from database
   - Sorted by date (newest first)

2. **Displays in Table**
   - Shows: Name, Contact (email/phone), Property, Status, Date, Actions
   - Search functionality
   - Click eye icon to view details

3. **Auto-Refresh**
   - Can manually refresh with "Refresh" button
   - Shows loading state while fetching

---

## 📊 Data Flow Diagram

```
User Submits Form
    ↓
/api/email/contact OR /api/email/property-enquiry
    ↓
┌─────────────────────────────────────┐
│ 1. Validate Data                    │
│ 2. Save to MongoDB (Enquiry model) │
│ 3. Send Email (Brevo SMTP)         │
│ 4. Return Success                   │
└─────────────────────────────────────┘
    ↓
MongoDB Database
    ↓
/api/enquiries (GET)
    ↓
Dashboard Enquiries Page
    ↓
Displays in Table
```

---

## 🗄️ Database Structure

**Enquiry Model:**
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  phone: String (required),
  property: String (optional),
  message: String (optional),
  status: "New" | "Contacted" | "Resolved" (default: "New"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ What's Working Now

1. ✅ **Contact Form** → Saves to DB + Sends Email
2. ✅ **Property Enquiry** → Saves to DB + Sends Email
3. ✅ **Dashboard** → Fetches from DB + Displays in Table
4. ✅ **Search** → Filters enquiries by name/email/property
5. ✅ **View Details** → Shows full enquiry information

---

## 🔍 Testing the Flow

### Test 1: Contact Form

1. Visit: `http://localhost:3000/contact`
2. Fill form and submit
3. Check:
   - ✅ Success message appears
   - ✅ Email received (admin + user)
   - ✅ Dashboard shows new enquiry

### Test 2: Property Enquiry

1. Visit any property page: `http://localhost:3000/properties/residential/[slug]`
2. Fill "Schedule Tour" form
3. Submit
4. Check:
   - ✅ Success message appears
   - ✅ Email received (admin + user)
   - ✅ Dashboard shows new enquiry with property name

### Test 3: Dashboard

1. Visit: `http://localhost:3000/dashboard/communication/enquiries`
2. Should see:
   - ✅ All submitted enquiries
   - ✅ Search works
   - ✅ Click eye icon to view details
   - ✅ Refresh button works

---

## 🎯 Key Points

1. **Enquiries are saved to MongoDB** - Even if email fails
2. **Dashboard fetches from database** - Real-time data
3. **Email is separate** - Enquiry saved first, then email sent
4. **Status tracking** - Can mark as "New", "Contacted", "Resolved"
5. **Search functionality** - Filter by name, email, or property

---

## 🔧 API Endpoints

### Create Enquiry (via Email APIs)
- `POST /api/email/contact` - Contact form
- `POST /api/email/property-enquiry` - Property enquiry

### Manage Enquiries
- `GET /api/enquiries` - Get all enquiries
- `GET /api/enquiries?status=New` - Filter by status
- `GET /api/enquiries/[id]` - Get single enquiry
- `PUT /api/enquiries/[id]` - Update enquiry (change status)
- `DELETE /api/enquiries/[id]` - Delete enquiry

---

## 📝 Status Management

Enquiries have 3 statuses:
- **New** - Just submitted (blue badge)
- **Contacted** - You've reached out (gray badge)
- **Resolved** - Completed/closed (outline badge)

**To update status:**
- Use the enquiries API: `PUT /api/enquiries/[id]`
- Or add status dropdown in dashboard UI (future enhancement)

---

## 🚀 Production

When deployed:
1. All enquiries save to MongoDB
2. Emails sent via Brevo SMTP
3. Dashboard shows all enquiries
4. Search and filter work
5. Real-time data from database

---

**Everything is connected and working!** 🎉

When a user submits a form:
1. ✅ Enquiry saved to database
2. ✅ Email sent to admin
3. ✅ Confirmation sent to user
4. ✅ Appears in dashboard immediately
5. ✅ Can search and view details


