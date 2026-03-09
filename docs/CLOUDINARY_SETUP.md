# Cloudinary Setup Guide

**Date:** January 28, 2026

---

## 🚀 Quick Start

### **Step 1: Get Cloudinary Credentials**

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to Dashboard → Settings
3. Copy your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### **Step 2: Add Environment Variables**

Add these **three lines** to your `.env.local` or `.env.production` file:

```env
# Add these Cloudinary variables to your existing .env file
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Example:** If your `.env` file already has MongoDB, JWT, etc., just add these three lines at the end:

```env
# Your existing variables...
MONGODB_URI=mongodb://...
JWT_SECRET=...
BREVO_SMTP_HOST=...

# Add Cloudinary variables here:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**See `docs/ENV_VARIABLES_COMPLETE.md` for complete .env template**

### **Step 3: Run Migration Script**

Migrate all existing base64 images to Cloudinary:

```bash
npx tsx scripts/migrate-images-to-cloudinary.ts
```

This will:
- ✅ Scan all MongoDB collections
- ✅ Find base64 images
- ✅ Upload to Cloudinary
- ✅ Replace base64 with Cloudinary URLs
- ✅ Preserve existing URLs

### **Step 4: Test**

1. Check Cloudinary dashboard - images should appear in folders
2. Test website - images should load from Cloudinary
3. Upload a new image - should go to Cloudinary

---

## 📁 Cloudinary Folder Structure

```
cloudinary/
├── properties/
│   ├── featured/
│   ├── gallery/
│   └── floor-plans/
├── team-members/
├── testimonials/
├── clients/
│   └── logos/
├── blogs/
│   ├── featured/
│   └── content/
├── hero-images/
├── property-types/
├── homepage-areas/
├── pages/
├── enquiries/
├── branding/
└── seo/
    ├── og-images/
    └── twitter-images/
```

---

## 🔧 Usage

### **Upload Image (Client-Side)**

```typescript
import { uploadFileToCloudinary } from '@/lib/cloudinary-upload';

const handleFileUpload = async (file: File) => {
  try {
    const cloudinaryUrl = await uploadFileToCloudinary(file, 'properties/gallery');
    console.log('Uploaded:', cloudinaryUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **Upload Base64 (Server-Side)**

```typescript
import { uploadBase64ToCloudinary } from '@/lib/cloudinary';

const cloudinaryUrl = await uploadBase64ToCloudinary(
  base64String,
  'properties/featured'
);
```

### **Get Optimized URL**

```typescript
import { getOptimizedUrl } from '@/lib/cloudinary';

const optimizedUrl = getOptimizedUrl(cloudinaryUrl, {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'webp',
});
```

---

## ✅ Migration Checklist

- [ ] Cloudinary account created
- [ ] Credentials added to `.env`
- [ ] Migration script run successfully
- [ ] Images verified in Cloudinary dashboard
- [ ] Website tested - images loading correctly
- [ ] New uploads tested

---

## 🆘 Troubleshooting

### **Error: "Cloudinary credentials not found"**
- Check `.env` file has all three variables
- Restart dev server after adding variables

### **Error: "Failed to upload to Cloudinary"**
- Verify credentials are correct
- Check Cloudinary dashboard for errors
- Ensure API key has upload permissions

### **Images not loading after migration**
- Check Cloudinary URLs in MongoDB
- Verify Cloudinary account is active
- Check browser console for errors

---

## 📊 Benefits

- ✅ **Smaller database** (URLs instead of base64)
- ✅ **Faster queries** (no large strings)
- ✅ **CDN delivery** (global CDN)
- ✅ **Auto optimization** (format, size)
- ✅ **Transformations** (resize, crop on-the-fly)
- ✅ **Better performance**
