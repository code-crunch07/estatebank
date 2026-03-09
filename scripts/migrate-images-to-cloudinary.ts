import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { uploadBase64ToCloudinary } from '../lib/cloudinary';

// Load environment variables
const envProduction = resolve(process.cwd(), '.env.production');
const envLocal = resolve(process.cwd(), '.env.local');

if (existsSync(envProduction)) {
  console.log('📄 Loading environment from .env.production');
  config({ path: envProduction });
} else if (existsSync(envLocal)) {
  console.log('📄 Loading environment from .env.local');
  config({ path: envLocal });
} else {
  console.log('⚠️  No .env.production or .env.local found, using system environment variables');
  config();
}

// Import models
import Property from '../models/property';
import TeamMember from '../models/team-member';
import Testimonial from '../models/testimonial';
import Client from '../models/client';
import Blog from '../models/blog';
import HeroImage from '../models/hero-image';
import PropertyType from '../models/property-type';
import HomepageArea from '../models/homepage-area';
import Page from '../models/page';
import Enquiry from '../models/enquiry';
import BrandingSettings from '../models/branding-settings';
import SEO from '../models/seo';

async function uploadBase64ToCloudinarySafe(
  base64: string,
  folder: string,
  itemName: string
): Promise<string | null> {
  if (!base64 || !base64.startsWith('data:image')) {
    return null; // Skip non-base64 or already migrated URLs
  }

  try {
    const cloudinaryUrl = await uploadBase64ToCloudinary(base64, folder);
    console.log(`  ✅ Uploaded: ${itemName}`);
    return cloudinaryUrl;
  } catch (error: any) {
    console.error(`  ❌ Upload failed for ${itemName}:`, error.message);
    return null;
  }
}

async function migrateProperties() {
  console.log('\n📦 Migrating Properties...');
  const properties = await Property.find({});
  let migrated = 0;
  let skipped = 0;

  for (const property of properties) {
    let updated = false;

    // Migrate featuredImage
    if (property.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        property.featuredImage,
        'properties/featured',
        `Property "${property.name}" - Featured Image`
      );
      if (cloudinaryUrl) {
        property.featuredImage = cloudinaryUrl;
        updated = true;
      }
    }

    // Migrate images array
    if (property.images && Array.isArray(property.images)) {
      const migratedImages = await Promise.all(
        property.images.map(async (img: string, index: number) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinarySafe(
              img,
              'properties/gallery',
              `Property "${property.name}" - Image ${index + 1}`
            );
          }
          return img; // Keep existing URLs
        })
      );
      property.images = migratedImages.filter(Boolean) as string[];
      if (migratedImages.some((img, idx) => property.images[idx] !== property.images[idx])) {
        updated = true;
      }
    }

    // Migrate floorPlans array
    if (property.floorPlans && Array.isArray(property.floorPlans)) {
      const migratedPlans = await Promise.all(
        property.floorPlans.map(async (plan: string, index: number) => {
          if (plan?.startsWith('data:image')) {
            return await uploadBase64ToCloudinarySafe(
              plan,
              'properties/floor-plans',
              `Property "${property.name}" - Floor Plan ${index + 1}`
            );
          }
          return plan;
        })
      );
      property.floorPlans = migratedPlans.filter(Boolean) as string[];
      if (migratedPlans.some((plan, idx) => property.floorPlans[idx] !== property.floorPlans[idx])) {
        updated = true;
      }
    }

    if (updated) {
      await property.save();
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} properties, skipped ${skipped} (no base64 images)`);
}

async function migrateTeamMembers() {
  console.log('\n👥 Migrating Team Members...');
  const members = await TeamMember.find({});
  let migrated = 0;
  let skipped = 0;

  for (const member of members) {
    if (member.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        member.image,
        'team-members',
        `Team Member "${member.name}"`
      );
      if (cloudinaryUrl) {
        member.image = cloudinaryUrl;
        await member.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} team members, skipped ${skipped}`);
}

async function migrateTestimonials() {
  console.log('\n💬 Migrating Testimonials...');
  const testimonials = await Testimonial.find({});
  let migrated = 0;
  let skipped = 0;

  for (const testimonial of testimonials) {
    if (testimonial.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        testimonial.image,
        'testimonials',
        `Testimonial "${testimonial.name}"`
      );
      if (cloudinaryUrl) {
        testimonial.image = cloudinaryUrl;
        await testimonial.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} testimonials, skipped ${skipped}`);
}

async function migrateClients() {
  console.log('\n🏢 Migrating Clients...');
  const clients = await Client.find({});
  let migrated = 0;
  let skipped = 0;

  for (const client of clients) {
    if (client.logo?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        client.logo,
        'clients/logos',
        `Client "${client.name}"`
      );
      if (cloudinaryUrl) {
        client.logo = cloudinaryUrl;
        await client.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} clients, skipped ${skipped}`);
}

async function migrateBlogs() {
  console.log('\n📝 Migrating Blogs...');
  const blogs = await Blog.find({});
  let migrated = 0;
  let skipped = 0;

  for (const blog of blogs) {
    let updated = false;

    if (blog.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        blog.featuredImage,
        'blogs/featured',
        `Blog "${blog.title}" - Featured`
      );
      if (cloudinaryUrl) {
        blog.featuredImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (blog.images && Array.isArray(blog.images)) {
      const migratedImages = await Promise.all(
        blog.images.map(async (img: string, index: number) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinarySafe(
              img,
              'blogs/content',
              `Blog "${blog.title}" - Image ${index + 1}`
            );
          }
          return img;
        })
      );
      blog.images = migratedImages.filter(Boolean) as string[];
      if (migratedImages.some((img, idx) => blog.images[idx] !== blog.images[idx])) {
        updated = true;
      }
    }

    if (updated) {
      await blog.save();
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} blogs, skipped ${skipped}`);
}

async function migrateHeroImages() {
  console.log('\n🎨 Migrating Hero Images...');
  const heroImages = await HeroImage.find({});
  let migrated = 0;
  let skipped = 0;

  for (const hero of heroImages) {
    if (hero.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        hero.image,
        'hero-images',
        `Hero Image - ${hero.type}`
      );
      if (cloudinaryUrl) {
        hero.image = cloudinaryUrl;
        await hero.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} hero images, skipped ${skipped}`);
}

async function migratePropertyTypes() {
  console.log('\n🏠 Migrating Property Types...');
  const types = await PropertyType.find({});
  let migrated = 0;
  let skipped = 0;

  for (const type of types) {
    if (type.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        type.image,
        'property-types',
        `Property Type "${type.name}"`
      );
      if (cloudinaryUrl) {
        type.image = cloudinaryUrl;
        await type.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} property types, skipped ${skipped}`);
}

async function migrateHomepageAreas() {
  console.log('\n📍 Migrating Homepage Areas...');
  const areas = await HomepageArea.find({});
  let migrated = 0;
  let skipped = 0;

  for (const area of areas) {
    if (area.image?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        area.image,
        'homepage-areas',
        `Area "${area.name}"`
      );
      if (cloudinaryUrl) {
        area.image = cloudinaryUrl;
        await area.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} homepage areas, skipped ${skipped}`);
}

async function migratePages() {
  console.log('\n📄 Migrating Pages...');
  const pages = await Page.find({});
  let migrated = 0;
  let skipped = 0;

  for (const page of pages) {
    if (page.featuredImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        page.featuredImage,
        'pages',
        `Page "${page.title}"`
      );
      if (cloudinaryUrl) {
        page.featuredImage = cloudinaryUrl;
        await page.save();
        migrated++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} pages, skipped ${skipped}`);
}

async function migrateEnquiries() {
  console.log('\n📧 Migrating Enquiries...');
  const enquiries = await Enquiry.find({});
  let migrated = 0;
  let skipped = 0;

  for (const enquiry of enquiries) {
    if (enquiry.images && Array.isArray(enquiry.images)) {
      const migratedImages = await Promise.all(
        enquiry.images.map(async (img: string, index: number) => {
          if (img?.startsWith('data:image')) {
            return await uploadBase64ToCloudinarySafe(
              img,
              'enquiries',
              `Enquiry ${enquiry._id} - Image ${index + 1}`
            );
          }
          return img;
        })
      );
      enquiry.images = migratedImages.filter(Boolean) as string[];
      if (migratedImages.some((img, idx) => enquiry.images[idx] !== enquiry.images[idx])) {
        await enquiry.save();
        migrated++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} enquiries, skipped ${skipped}`);
}

async function migrateBranding() {
  console.log('\n🎨 Migrating Branding Settings...');
  const branding = await BrandingSettings.findOne({});
  
  if (!branding) {
    console.log('⚠️  No branding settings found');
    return;
  }

  let updated = false;

  if (branding.headerLogo?.startsWith('data:image')) {
    const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
      branding.headerLogo,
      'branding',
      'Header Logo'
    );
    if (cloudinaryUrl) {
      branding.headerLogo = cloudinaryUrl;
      updated = true;
    }
  }

  if (branding.dashboardLogo?.startsWith('data:image')) {
    const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
      branding.dashboardLogo,
      'branding',
      'Dashboard Logo'
    );
    if (cloudinaryUrl) {
      branding.dashboardLogo = cloudinaryUrl;
      updated = true;
    }
  }

  if (branding.favicon?.startsWith('data:image')) {
    const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
      branding.favicon,
      'branding',
      'Favicon'
    );
    if (cloudinaryUrl) {
      branding.favicon = cloudinaryUrl;
      updated = true;
    }
  }

  if (updated) {
    await branding.save();
    console.log('✅ Migrated branding settings');
  } else {
    console.log('⚠️  No base64 images found in branding settings');
  }
}

async function migrateSEO() {
  console.log('\n🔍 Migrating SEO Settings...');
  const seoSettings = await SEO.find({});
  let migrated = 0;
  let skipped = 0;

  for (const seo of seoSettings) {
    let updated = false;

    if (seo.ogImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        seo.ogImage,
        'seo/og-images',
        `SEO - OG Image`
      );
      if (cloudinaryUrl) {
        seo.ogImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (seo.twitterImage?.startsWith('data:image')) {
      const cloudinaryUrl = await uploadBase64ToCloudinarySafe(
        seo.twitterImage,
        'seo/twitter-images',
        `SEO - Twitter Image`
      );
      if (cloudinaryUrl) {
        seo.twitterImage = cloudinaryUrl;
        updated = true;
      }
    }

    if (updated) {
      await seo.save();
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Migrated ${migrated} SEO settings, skipped ${skipped}`);
}

async function main() {
  try {
    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials not found in environment variables!');
      console.error('Please add the following to your .env file:');
      console.error('CLOUDINARY_CLOUD_NAME=your-cloud-name');
      console.error('CLOUDINARY_API_KEY=your-api-key');
      console.error('CLOUDINARY_API_SECRET=your-api-secret');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    console.log('\n🚀 Starting Cloudinary migration...\n');

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

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Check your Cloudinary dashboard to verify all images were uploaded.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
