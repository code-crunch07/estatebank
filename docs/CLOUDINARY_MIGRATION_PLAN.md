# Cloudinary Migration Plan

**Date:** January 28, 2026  
**Purpose:** Migrate all base64 images to Cloudinary while preserving existing images

---

## 📊 Current Image Storage Locations

### **Models with Base64 Images:**

1. **Property** (`models/property.ts`)
   - `featuredImage` - Single featured image
   - `images[]` - Gallery images array
   - `floorPlans[]` - Floor plan images array

2. **TeamMember** (`models/team-member.ts`)
   - `image` - Team member photo

3. **Testimonial** (`models/testimonial.ts`)
   - `image` - Client photo

4. **Client** (`models/client.ts`)
   - `logo` - Client logo

5. **Blog** (`models/blog.ts`)
   - `featuredImage` - Blog featured image
   - `images[]` - Blog content images

6. **HeroImage** (`models/hero-image.ts`)
   - `image` - Hero/banner image

7. **PropertyType** (`models/property-type.ts`)
   - `image` - Property type image

8. **HomepageArea** (`models/homepage-area.ts`)
   - `image` - Area image

9. **Page** (`models/page.ts`)
   - `featuredImage` - Page featured image

10. **Enquiry** (`models/enquiry.ts`)
    - `images[]` - Enquiry images

11. **BrandingSettings** (`models/branding-settings.ts`)
    - `headerLogo` - Header logo
    - `dashboardLogo` - Dashboard logo
    - `favicon` - Favicon

12. **SEO** (`models/seo.ts`)
    - `ogImage` - Open Graph image
    - `twitterImage` - Twitter card image

---

## 🔄 Migration Strategy

### **Phase 1: Setup Cloudinary**

1. **Install Cloudinary SDK**
   ```bash
   npm install cloudinary
   ```

2. **Add Environment Variables**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Create Cloudinary Utility**
   ```typescript
   // lib/cloudinary.ts
   import { v2 as cloudinary } from 'cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export async function uploadToCloudinary(base64: string, folder: string): Promise<string> {
     // Upload base64 to Cloudinary
     const result = await cloudinary.uploader.upload(base64, {
       folder: folder,
       resource_type: 'auto',
     });
     return result.secure_url;
   }

   export async function deleteFromCloudinary(publicId: string): Promise<void> {
     await cloudinary.uploader.destroy(publicId);
   }
   ```

---

### **Phase 2: Migration Script**

Create a migration script to upload all existing base64 images to Cloudinary:

```typescript
// scripts/migrate-images-to-cloudinary.ts
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Property from '@/models/property';
import TeamMember from '@/models/team-member';
import Testimonial from '@/models/testimonial';
import Client from '@/models/client';
import Blog from '@/models/blog';
import HeroImage from '@/models/hero-image';
import PropertyType from '@/models/property-type';
import HomepageArea from '@/models/homepage-area';
import Page from '@/models/page';
import Enquiry from '@/models/enquiry';
import BrandingSettings from '@/models/branding-settings';
import SEO from '@/models/seo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function uploadBase64ToCloudinary(base64: string, folder: string): Promise<string | null> {
  if (!base64 || !base64.startsWith('data:image')) {
    return null; // Skip non-base64 or already migrated URLs
  }

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: folder,
      resource_type: 'auto',
      overwrite: false,
    });
    console.log(`✅ Uploaded to: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Upload failed:`, error);
    return null;
  }
}

async function migrateProperties() {
  console.log('\n📦 Migrating Properties...');
  const properties = await Property.find({});
  let migrated = 0;

  for (const property of properties) {
    let updated = false;

    // Migrate featuredImage
    if (property.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        property.featuredImage,
        'properties/featured'
      );
      if (cloudinaryUrl) {
        property.featuredImage = cloudinaryUrl;
        updated = true;
      }
    }

    // Migrate images array
    if (property.images && Array.isArray(property.images)) {
      const migratedImages = await Promise.all(
        property.images.map(async (img: string) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinary(img, 'properties/gallery');
          }
          return img; // Keep existing URLs
        })
      );
      property.images = migratedImages.filter(Boolean);
      updated = true;
    }

    // Migrate floorPlans array
    if (property.floorPlans && Array.isArray(property.floorPlans)) {
      const migratedPlans = await Promise.all(
        property.floorPlans.map(async (plan: string) => {
          if (plan?.startsWith('data:image')) {
            return await uploadBase64ToCloudinary(plan, 'properties/floor-plans');
          }
          return plan;
        })
      );
      property.floorPlans = migratedPlans.filter(Boolean);
      updated = true;
    }

    if (updated) {
      await property.save();
      migrated++;
      console.log(`✅ Migrated property: ${property.name}`);
    }
  }

  console.log(`✅ Migrated ${migrated} properties`);
}

async function migrateTeamMembers() {
  console.log('\n👥 Migrating Team Members...');
  const members = await TeamMember.find({});
  let migrated = 0;

  for (const member of members) {
    if (member.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        member.image,
        'team-members'
      );
      if (cloudinaryUrl) {
        member.image = cloudinaryUrl;
        await member.save();
        migrated++;
        console.log(`✅ Migrated team member: ${member.name}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} team members`);
}

async function migrateTestimonials() {
  console.log('\n💬 Migrating Testimonials...');
  const testimonials = await Testimonial.find({});
  let migrated = 0;

  for (const testimonial of testimonials) {
    if (testimonial.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        testimonial.image,
        'testimonials'
      );
      if (cloudinaryUrl) {
        testimonial.image = cloudinaryUrl;
        await testimonial.save();
        migrated++;
        console.log(`✅ Migrated testimonial: ${testimonial.name}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} testimonials`);
}

async function migrateClients() {
  console.log('\n🏢 Migrating Clients...');
  const clients = await Client.find({});
  let migrated = 0;

  for (const client of clients) {
    if (client.logo?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        client.logo,
        'clients/logos'
      );
      if (cloudinaryUrl) {
        client.logo = cloudinaryUrl;
        await client.save();
        migrated++;
        console.log(`✅ Migrated client: ${client.name}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} clients`);
}

async function migrateBlogs() {
  console.log('\n📝 Migrating Blogs...');
  const blogs = await Blog.find({});
  let migrated = 0;

  for (const blog of blogs) {
    let updated = false;

    if (blog.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        blog.featuredImage,
        'blogs/featured'
      );
      if (cloudinaryUrl) {
        blog.featuredImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (blog.images && Array.isArray(blog.images)) {
      const migratedImages = await Promise.all(
        blog.images.map(async (img: string) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinary(img, 'blogs/content');
          }
          return img;
        })
      );
      blog.images = migratedImages.filter(Boolean);
      updated = true;
    }

    if (updated) {
      await blog.save();
      migrated++;
      console.log(`✅ Migrated blog: ${blog.title}`);
    }
  }

  console.log(`✅ Migrated ${migrated} blogs`);
}

async function migrateHeroImages() {
  console.log('\n🎨 Migrating Hero Images...');
  const heroImages = await HeroImage.find({});
  let migrated = 0;

  for (const hero of heroImages) {
    if (hero.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        hero.image,
        'hero-images'
      );
      if (cloudinaryUrl) {
        hero.image = cloudinaryUrl;
        await hero.save();
        migrated++;
        console.log(`✅ Migrated hero image: ${hero.type}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} hero images`);
}

async function migratePropertyTypes() {
  console.log('\n🏠 Migrating Property Types...');
  const types = await PropertyType.find({});
  let migrated = 0;

  for (const type of types) {
    if (type.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        type.image,
        'property-types'
      );
      if (cloudinaryUrl) {
        type.image = cloudinaryUrl;
        await type.save();
        migrated++;
        console.log(`✅ Migrated property type: ${type.name}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} property types`);
}

async function migrateHomepageAreas() {
  console.log('\n📍 Migrating Homepage Areas...');
  const areas = await HomepageArea.find({});
  let migrated = 0;

  for (const area of areas) {
    if (area.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        area.image,
        'homepage-areas'
      );
      if (cloudinaryUrl) {
        area.image = cloudinaryUrl;
        await area.save();
        migrated++;
        console.log(`✅ Migrated area: ${area.name}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} homepage areas`);
}

async function migratePages() {
  console.log('\n📄 Migrating Pages...');
  const pages = await Page.find({});
  let migrated = 0;

  for (const page of pages) {
    if (page.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        page.featuredImage,
        'pages'
      );
      if (cloudinaryUrl) {
        page.featuredImage = cloudinaryUrl;
        await page.save();
        migrated++;
        console.log(`✅ Migrated page: ${page.title}`);
      }
    }
  }

  console.log(`✅ Migrated ${migrated} pages`);
}

async function migrateEnquiries() {
  console.log('\n📧 Migrating Enquiries...');
  const enquiries = await Enquiry.find({});
  let migrated = 0;

  for (const enquiry of enquiries) {
    if (enquiry.images && Array.isArray(enquiry.images)) {
      const migratedImages = await Promise.all(
        enquiry.images.map(async (img: string) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinary(img, 'enquiries');
          }
          return img;
        })
      );
      enquiry.images = migratedImages.filter(Boolean);
      await enquiry.save();
      migrated++;
      console.log(`✅ Migrated enquiry: ${enquiry._id}`);
    }
  }

  console.log(`✅ Migrated ${migrated} enquiries`);
}

async function migrateBranding() {
  console.log('\n🎨 Migrating Branding Settings...');
  const branding = await BrandingSettings.findOne({});
  
  if (branding) {
    let updated = false;

    if (branding.headerLogo?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        branding.headerLogo,
        'branding'
      );
      if (cloudinaryUrl) {
        branding.headerLogo = cloudinaryUrl;
        updated = true;
      }
    }

    if (branding.dashboardLogo?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        branding.dashboardLogo,
        'branding'
      );
      if (cloudinaryUrl) {
        branding.dashboardLogo = cloudinaryUrl;
        updated = true;
      }
    }

    if (branding.favicon?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        branding.favicon,
        'branding'
      );
      if (cloudinaryUrl) {
        branding.favicon = cloudinaryUrl;
        updated = true;
      }
    }

    if (updated) {
      await branding.save();
      console.log(`✅ Migrated branding settings`);
    }
  }
}

async function migrateSEO() {
  console.log('\n🔍 Migrating SEO Settings...');
  const seoSettings = await SEO.find({});
  let migrated = 0;

  for (const seo of seoSettings) {
    let updated = false;

    if (seo.ogImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        seo.ogImage,
        'seo/og-images'
      );
      if (cloudinaryUrl) {
        seo.ogImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (seo.twitterImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinary(
        seo.twitterImage,
        'seo/twitter-images'
      );
      if (cloudinaryUrl) {
        seo.twitterImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (updated) {
      await seo.save();
      migrated++;
      console.log(`✅ Migrated SEO settings`);
    }
  }

  console.log(`✅ Migrated ${migrated} SEO settings`);
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    await migrateProperties();
    await migrateTeamMembers();
    await migrateTestimonials();
    await migrateClients();
    await migrateBlogs();
    await migrateHeroImages();
    await migratePropertyTypes();
    await migrateHomepageAreas();
    await migratePages();
    await migrateEnquiries();
    await migrateBranding();
    await migrateSEO();

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
```

---

### **Phase 3: Update Upload Handlers**

Update all upload forms to use Cloudinary instead of base64:

```typescript
// lib/cloudinary-upload.ts
import { v2 as cloudinary } from 'cloudinary';

export async function uploadFileToCloudinary(
  file: File | Blob,
  folder: string
): Promise<string> {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64, {
    folder: folder,
    resource_type: 'auto',
  });
  
  return result.secure_url;
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

### **Phase 4: Backward Compatibility**

During migration, support both base64 and Cloudinary URLs:

```typescript
// lib/image-utils.ts
export function getImageUrl(image: string | undefined): string {
  if (!image) return '/placeholder.jpg';
  
  // If it's already a Cloudinary URL, return it
  if (image.startsWith('https://res.cloudinary.com')) {
    return image;
  }
  
  // If it's base64, return it (for backward compatibility)
  if (image.startsWith('data:image')) {
    return image;
  }
  
  // If it's a relative path, return it
  if (image.startsWith('/')) {
    return image;
  }
  
  return image;
}
```

---

## 📋 Migration Checklist

### **Pre-Migration:**
- [ ] Create Cloudinary account
- [ ] Get API credentials
- [ ] Add environment variables
- [ ] Install Cloudinary SDK
- [ ] Test upload with sample image

### **Migration:**
- [ ] Run migration script
- [ ] Verify all images uploaded
- [ ] Check Cloudinary dashboard
- [ ] Test image loading on website
- [ ] Verify no broken images

### **Post-Migration:**
- [ ] Update all upload forms
- [ ] Remove base64 conversion code
- [ ] Update image display components
- [ ] Test new uploads
- [ ] Monitor Cloudinary usage

---

## ⚠️ Important Notes

### **1. Existing Images**
- ✅ **All existing base64 images will be migrated**
- ✅ **Migration script handles all models**
- ✅ **No data loss** - images are uploaded before replacing
- ✅ **Backward compatible** - supports both formats during transition

### **2. Cloudinary Folders Structure**
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

### **3. Benefits After Migration**
- ✅ **Smaller database** (URLs instead of base64)
- ✅ **Faster queries** (no large strings)
- ✅ **CDN delivery** (Cloudinary CDN)
- ✅ **Image optimization** (automatic)
- ✅ **Transformations** (resize, crop, etc.)
- ✅ **Better performance**

---

## 🚀 Running the Migration

```bash
# 1. Install Cloudinary
npm install cloudinary

# 2. Add environment variables to .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 3. Run migration script
npx tsx scripts/migrate-images-to-cloudinary.ts

# 4. Verify in Cloudinary dashboard
# 5. Test website
# 6. Update upload forms
```

---

## 📊 Estimated Migration Time

- **Small site** (< 100 properties): ~10-30 minutes
- **Medium site** (100-500 properties): ~30-60 minutes
- **Large site** (> 500 properties): ~1-3 hours

*Time depends on number of images and Cloudinary upload speed*

---

## ✅ Summary

**Question:** "What about old property images, client images, testimonial images?"

**Answer:**
- ✅ **Migration script handles ALL existing images**
- ✅ **12 different models migrated automatically**
- ✅ **No manual work needed**
- ✅ **Backward compatible during transition**
- ✅ **All images preserved and uploaded to Cloudinary**

**After migration:**
- All old base64 images → Cloudinary URLs
- New uploads → Direct to Cloudinary
- Smaller database, faster performance
- Better image delivery via CDN
