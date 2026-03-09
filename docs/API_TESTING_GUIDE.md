# API Testing Guide

## Overview
This guide helps you test all API endpoints in the EstateBANK.in application to ensure they're working correctly and identify any bugs.

## Prerequisites
1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Ensure MongoDB is running** (if using database):
   ```bash
   # Check MongoDB connection in .env.local
   MONGODB_URI=mongodb://localhost:27017/estatebank
   ```

3. **Install API testing tools** (optional but recommended):
   - **Postman** (https://www.postman.com/downloads/)
   - **Thunder Client** (VS Code extension)
   - **curl** (command line)

---

## API Endpoints Summary

### ✅ Properties APIs
- `GET /api/properties` - Get all properties
- `GET /api/properties/[id]` - Get single property
- `POST /api/properties` - Create property
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

### ✅ Amenities APIs
- `GET /api/amenities` - Get all amenities
- `GET /api/amenities/[id]` - Get single amenity
- `POST /api/amenities` - Create amenity
- `PUT /api/amenities/[id]` - Update amenity
- `DELETE /api/amenities/[id]` - Delete amenity

### ✅ Testimonials APIs
- `GET /api/testimonials` - Get all testimonials
- `GET /api/testimonials/[id]` - Get single testimonial
- `POST /api/testimonials` - Create testimonial
- `PUT /api/testimonials/[id]` - Update testimonial
- `DELETE /api/testimonials/[id]` - Delete testimonial

### ✅ Services APIs
- `GET /api/services` - Get all services
- `GET /api/services/[id]` - Get single service
- `POST /api/services` - Create service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### ✅ People Management APIs
- **Clients**: `/api/people/clients`, `/api/people/clients/[id]`
- **Owners**: `/api/people/owners`, `/api/people/owners/[id]`
- **Brokers**: `/api/people/brokers`, `/api/people/brokers/[id]`
- **Team**: `/api/people/team`, `/api/people/team/[id]`

### ✅ CRM APIs
- **Leads**: `/api/leads`, `/api/leads/[id]`
- **Follow-ups**: `/api/follow-ups`, `/api/follow-ups/[id]`
- **Activities**: `/api/activities`, `/api/activities/[id]`
- **Enquiries**: `/api/enquiries`, `/api/enquiries/[id]`

### ✅ Location APIs
- **Locations**: `/api/locations`, `/api/locations/[id]`
- **Areas**: `/api/areas`, `/api/areas/[id]`
- **Working Days**: `/api/working-days`

### ✅ Website Content APIs
- **Hero Images**: `/api/hero-images`, `/api/hero-images/[id]`
- **Homepage Areas**: `/api/homepage-areas`, `/api/homepage-areas/[id]`
- **Branding**: `/api/branding`
- **Clients**: `/api/clients`, `/api/clients/[id]`
- **Notifications**: `/api/notifications`

---

## Testing Methods

### Method 1: Using Browser Console (Quick Test)

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. **Go to Console tab**
4. **Test GET request:**
   ```javascript
   fetch('/api/properties')
     .then(res => res.json())
     .then(data => console.log('Properties:', data))
     .catch(err => console.error('Error:', err));
   ```

5. **Test POST request:**
   ```javascript
   fetch('/api/properties', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Test Property',
       location: 'Mumbai',
       price: '₹50 Lakh',
       bedrooms: 2,
       bathrooms: 1,
       area: '800 sq. ft.',
       type: 'Buy',
       status: 'Available',
       description: 'Test description',
       keyDetails: ['Test detail'],
       amenities: [],
       images: []
     })
   })
     .then(res => res.json())
     .then(data => console.log('Created:', data))
     .catch(err => console.error('Error:', err));
   ```

### Method 2: Using curl (Command Line)

**GET Request:**
```bash
curl http://localhost:3000/api/properties
```

**POST Request:**
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property",
    "location": "Mumbai",
    "price": "₹50 Lakh",
    "bedrooms": 2,
    "bathrooms": 1,
    "area": "800 sq. ft.",
    "type": "Buy",
    "status": "Available"
  }'
```

**PUT Request:**
```bash
curl -X PUT http://localhost:3000/api/properties/[ID] \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Property Name"}'
```

**DELETE Request:**
```bash
curl -X DELETE http://localhost:3000/api/properties/[ID]
```

### Method 3: Using Postman

1. **Create a new request**
2. **Set method** (GET, POST, PUT, DELETE)
3. **Enter URL**: `http://localhost:3000/api/properties`
4. **For POST/PUT**: 
   - Go to "Body" tab
   - Select "raw" and "JSON"
   - Enter JSON data
5. **Click "Send"**
6. **Check response** status and data

---

## Testing Checklist

### ✅ Basic Functionality Tests

#### Properties API
- [ ] **GET /api/properties** - Returns list of properties
- [ ] **GET /api/properties?location=Mumbai** - Filters by location
- [ ] **GET /api/properties?type=Buy** - Filters by type
- [ ] **GET /api/properties/[id]** - Returns single property
- [ ] **POST /api/properties** - Creates new property
- [ ] **PUT /api/properties/[id]** - Updates property
- [ ] **DELETE /api/properties/[id]** - Deletes property

#### Amenities API
- [ ] **GET /api/amenities** - Returns all amenities
- [ ] **GET /api/amenities?status=Active** - Filters by status
- [ ] **POST /api/amenities** - Creates amenity
- [ ] **PUT /api/amenities/[id]** - Updates amenity
- [ ] **DELETE /api/amenities/[id]** - Deletes amenity

### ✅ Error Handling Tests

#### Test Invalid Data
- [ ] **POST with missing required fields** - Should return 400 error
- [ ] **GET with invalid ID** - Should return 404 error
- [ ] **PUT with non-existent ID** - Should return 404 error
- [ ] **DELETE with invalid ID** - Should return 404 error

#### Test Edge Cases
- [ ] **Empty arrays** - Should handle gracefully
- [ ] **Very long strings** - Should validate length
- [ ] **Special characters** - Should handle properly
- [ ] **Null/undefined values** - Should handle gracefully

### ✅ Data Validation Tests

#### Property Validation
- [ ] **Missing name** - Should fail
- [ ] **Missing location** - Should fail
- [ ] **Missing price** - Should fail
- [ ] **Invalid bedrooms** - Should fail (must be number)
- [ ] **Invalid bathrooms** - Should fail (must be number)
- [ ] **Invalid status** - Should validate allowed values

### ✅ Integration Tests

#### Frontend to Backend
- [ ] **Dashboard → Add Property** - Creates property via API
- [ ] **Dashboard → Edit Property** - Updates via API
- [ ] **Dashboard → Delete Property** - Deletes via API
- [ ] **Client → View Properties** - Fetches from API
- [ ] **Client → Property Details** - Fetches single property

---

## Common Bugs to Look For

### 1. **CORS Issues**
- **Symptom**: "CORS policy" errors in console
- **Check**: API routes should allow requests from frontend
- **Fix**: Ensure proper CORS headers

### 2. **Database Connection Issues**
- **Symptom**: "Cannot connect to database" errors
- **Check**: MongoDB connection string in `.env.local`
- **Fix**: Verify MongoDB is running and connection string is correct

### 3. **Missing Required Fields**
- **Symptom**: 400 errors when creating resources
- **Check**: API validation logic
- **Fix**: Ensure all required fields are validated

### 4. **ID Format Issues**
- **Symptom**: 404 errors with valid-looking IDs
- **Check**: MongoDB ObjectId format
- **Fix**: Ensure IDs are properly converted

### 5. **Data Type Mismatches**
- **Symptom**: Unexpected behavior or errors
- **Check**: Data types match schema
- **Fix**: Ensure proper type conversion

### 6. **Missing Error Handling**
- **Symptom**: Unhandled errors crash the app
- **Check**: Try-catch blocks in API routes
- **Fix**: Add proper error handling

### 7. **Race Conditions**
- **Symptom**: Data inconsistency
- **Check**: Concurrent requests handling
- **Fix**: Add proper locking/validation

---

## Automated Testing Script

Create a test script (`test-apis.sh`):

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "Testing Properties API..."
curl -s "$BASE_URL/properties" | jq '.' || echo "Failed"

echo -e "\nTesting Amenities API..."
curl -s "$BASE_URL/amenities" | jq '.' || echo "Failed"

echo -e "\nTesting Testimonials API..."
curl -s "$BASE_URL/testimonials" | jq '.' || echo "Failed"

echo -e "\nTesting Services API..."
curl -s "$BASE_URL/services" | jq '.' || echo "Failed"
```

Run with:
```bash
chmod +x test-apis.sh
./test-apis.sh
```

---

## Debugging Tips

1. **Check Server Logs**: Look at terminal where `npm run dev` is running
2. **Check Browser Console**: Look for JavaScript errors
3. **Check Network Tab**: Inspect API requests/responses
4. **Check Database**: Verify data is actually saved
5. **Check Environment Variables**: Ensure `.env.local` is correct

---

## Current Status

### ✅ Fully Implemented APIs
- Properties (CRUD)
- Amenities (CRUD)
- Testimonials (CRUD)
- Services (CRUD)
- People Management (Clients, Owners, Brokers, Team)
- CRM (Leads, Follow-ups, Activities, Enquiries)
- Locations & Areas
- Website Content (Hero Images, Homepage Areas, Branding)

### ⚠️ Note on Data Storage
Currently, the application uses **localStorage** for data persistence in the frontend. To use the APIs:
1. Set up MongoDB connection
2. Update frontend code to use API endpoints instead of `DataStore`
3. Migrate existing localStorage data to database

---

## Next Steps

1. **Test each API endpoint** using the methods above
2. **Document any bugs** found
3. **Fix bugs** and retest
4. **Update frontend** to use APIs instead of localStorage
5. **Set up production database** (MongoDB Atlas recommended)

---

## Support

If you encounter issues:
1. Check server logs for error messages
2. Verify MongoDB connection
3. Check API route files for syntax errors
4. Ensure all dependencies are installed (`npm install`)

