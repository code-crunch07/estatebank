# Property Image Storage Location

**Date:** January 28, 2026

---

## 📍 Where Property Images Are Stored

### **Answer: MongoDB Database (as Base64 Strings)**

Property images are **NOT saved as files** on the server filesystem. Instead, they are:

1. **Converted to Base64** on the client-side (browser)
2. **Stored as strings** in MongoDB database
3. **Saved in Property document** fields:
   - `featuredImage` - Single featured image
   - `images[]` - Array of gallery images
   - `floorPlans[]` - Array of floor plan images

---

## 🔄 How It Works

### **1. Upload Process (Client-Side)**

When you upload an image in the dashboard:

```typescript
// From: app/(dashboard)/dashboard/properties/add/page.tsx
const reader = new FileReader();
reader.readAsDataURL(file);  // Converts file to base64 string
reader.onloadend = () => {
  const base64String = reader.result;  // "data:image/jpeg;base64,/9j/4AAQ..."
  // This base64 string is sent to API
}
```

### **2. Storage Process (Server-Side)**

The base64 string is saved directly to MongoDB:

```typescript
// From: app/api/properties/route.ts
const property = new Property({
  featuredImage: body.featuredImage || "",  // Base64 string
  images: body.images || [],                 // Array of base64 strings
  floorPlans: body.floorPlans || [],         // Array of base64 strings
});
await property.save();  // Saved to MongoDB
```

### **3. Database Storage**

**MongoDB Collection:** `properties`

**Document Structure:**
```json
{
  "_id": "...",
  "name": "Property Name",
  "featuredImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/png;base64,iVBORw0KGgo..."
  ],
  "floorPlans": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ]
}
```

---

## 📂 File System Structure

### **What's NOT Used:**
- ❌ No `/uploads` folder
- ❌ No `/public/uploads` folder
- ❌ No file system storage
- ❌ No file upload API endpoint

### **What IS Used:**
- ✅ MongoDB database (base64 strings)
- ✅ `/public/images/` folder (static assets only - logos, icons, etc.)
- ✅ `/public/team/` folder (static team photos)

---

## 🔍 Where to Find Images

### **In MongoDB:**
```bash
# Connect to MongoDB
mongosh

# View property images
db.properties.findOne({ name: "Property Name" }, { featuredImage: 1, images: 1 })

# Base64 strings will look like:
# "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
```

### **In Code:**
- **Model:** `models/property.ts`
- **API Route:** `app/api/properties/route.ts`
- **Upload Handler:** `app/(dashboard)/dashboard/properties/add/page.tsx`

---

## ⚠️ Important Notes

### **1. Base64 Storage Limitations**

**Pros:**
- ✅ Simple - no file system management
- ✅ Works with MongoDB
- ✅ No separate file storage needed

**Cons:**
- ❌ **Larger database size** (base64 is ~33% larger than binary)
- ❌ **Slower queries** (large strings in database)
- ❌ **Not ideal for large images** (>1MB)
- ❌ **No CDN support** (can't use CloudFront, Cloudflare, etc.)

### **2. Current Image Size Limit**

From the code:
- **Max file size:** 5MB (client-side validation)
- **Format:** JPG, PNG, GIF, WebP

### **3. Performance Impact**

- Each property with images = larger MongoDB documents
- Loading properties = downloading base64 strings
- No image optimization/compression
- No lazy loading support

---

## 🚀 Better Alternatives (Future Improvements)

### **Option 1: File System Storage**
```typescript
// Save to: /public/uploads/properties/[propertyId]/image.jpg
// Store URL in MongoDB: "/uploads/properties/123/image.jpg"
```

### **Option 2: Cloud Storage (Recommended)**
- **AWS S3** + CloudFront
- **Cloudinary**
- **ImageKit**
- Store URLs in MongoDB, images in cloud

### **Option 3: Next.js Image Optimization**
- Use Next.js `/public` folder
- Leverage `next/image` optimization
- Store relative paths in MongoDB

---

## 📊 Current Storage Example

**Property with 5 images:**
- Featured image: ~500KB base64 = ~667KB in DB
- 4 gallery images: ~2MB base64 = ~2.67MB in DB
- **Total:** ~3.3MB stored as strings in MongoDB

**With 100 properties:**
- ~330MB of image data in MongoDB
- All loaded when fetching properties list

---

## ✅ Summary

**Question:** "Where are property images saved?"

**Answer:** 
- **Location:** MongoDB database
- **Format:** Base64-encoded strings
- **Fields:** `featuredImage`, `images[]`, `floorPlans[]`
- **NOT saved as:** Physical files on server

**To view images:**
- Check MongoDB `properties` collection
- Look for fields containing `data:image/...` strings
- Images are embedded directly in property documents
