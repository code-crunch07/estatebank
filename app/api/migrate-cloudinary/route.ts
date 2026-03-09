import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { uploadBase64ToCloudinary } from '@/lib/cloudinary';
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

/**
 * POST /api/migrate-cloudinary
 * Run Cloudinary migration via API (no need to enter Docker container)
 * 
 * Usage:
 * curl -X POST http://localhost:3000/api/migrate-cloudinary \
 *   -H "Authorization: Bearer your-secret-key"
 */
export async function POST(request: NextRequest) {
  try {
    // Simple authentication (add your secret key to .env)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.MIGRATION_SECRET || 'migration-secret-key-change-in-production';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Add Authorization: Bearer your-secret-key header' },
        { status: 401 }
      );
    }

    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not found in environment variables' },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const results: any = {
      properties: { migrated: 0, skipped: 0 },
      teamMembers: { migrated: 0, skipped: 0 },
      testimonials: { migrated: 0, skipped: 0 },
      clients: { migrated: 0, skipped: 0 },
      blogs: { migrated: 0, skipped: 0 },
      heroImages: { migrated: 0, skipped: 0 },
      propertyTypes: { migrated: 0, skipped: 0 },
      homepageAreas: { migrated: 0, skipped: 0 },
      pages: { migrated: 0, skipped: 0 },
      enquiries: { migrated: 0, skipped: 0 },
      branding: { migrated: false },
      seo: { migrated: 0, skipped: 0 },
    };

    // Helper function
    async function uploadBase64Safe(base64: string, folder: string): Promise<string | null> {
      if (!base64 || !base64.startsWith('data:image')) {
        return null;
      }
      try {
        return await uploadBase64ToCloudinary(base64, folder);
      } catch (error: any) {
        console.error('Upload failed:', error.message);
        return null;
      }
    }

    // Migrate Properties
    const properties = await Property.find({});
    for (const property of properties) {
      let updated = false;
      if (property.featuredImage?.startsWith('data:image')) {
        const url = await uploadBase64Safe(property.featuredImage, 'properties/featured');
        if (url) {
          property.featuredImage = url;
          updated = true;
        }
      }
      if (property.images?.some((img: string) => img?.startsWith('data:image'))) {
        const migrated = await Promise.all(
          property.images.map(async (img: string) => {
            if (img?.startsWith('data:image')) {
              return await uploadBase64Safe(img, 'properties/gallery') || img;
            }
            return img;
          })
        );
        property.images = migrated.filter(Boolean) as string[];
        updated = true;
      }
      if (property.floorPlans?.some((plan: string) => plan?.startsWith('data:image'))) {
        const migrated = await Promise.all(
          property.floorPlans.map(async (plan: string) => {
            if (plan?.startsWith('data:image')) {
              return await uploadBase64Safe(plan, 'properties/floor-plans') || plan;
            }
            return plan;
          })
        );
        property.floorPlans = migrated.filter(Boolean) as string[];
        updated = true;
      }
      if (updated) {
        await property.save();
        results.properties.migrated++;
      } else {
        results.properties.skipped++;
      }
    }

    // Migrate Team Members
    const members = await TeamMember.find({});
    for (const member of members) {
      if (member.image?.startsWith('data:image')) {
        const url = await uploadBase64Safe(member.image, 'team-members');
        if (url) {
          member.image = url;
          await member.save();
          results.teamMembers.migrated++;
        }
      } else {
        results.teamMembers.skipped++;
      }
    }

    // Migrate Testimonials
    const testimonials = await Testimonial.find({});
    for (const testimonial of testimonials) {
      if (testimonial.image?.startsWith('data:image')) {
        const url = await uploadBase64Safe(testimonial.image, 'testimonials');
        if (url) {
          testimonial.image = url;
          await testimonial.save();
          results.testimonials.migrated++;
        }
      } else {
        results.testimonials.skipped++;
      }
    }

    // Migrate Clients
    const clients = await Client.find({});
    for (const client of clients) {
      if (client.logo?.startsWith('data:image')) {
        const url = await uploadBase64Safe(client.logo, 'clients/logos');
        if (url) {
          client.logo = url;
          await client.save();
          results.clients.migrated++;
        }
      } else {
        results.clients.skipped++;
      }
    }

    // Migrate Blogs
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      let updated = false;
      if (blog.featuredImage?.startsWith('data:image')) {
        const url = await uploadBase64Safe(blog.featuredImage, 'blogs/featured');
        if (url) {
          blog.featuredImage = url;
          updated = true;
        }
      }
      if (blog.images?.some((img: string) => img?.startsWith('data:image'))) {
        const migrated = await Promise.all(
          blog.images.map(async (img: string) => {
            if (img?.startsWith('data:image')) {
              return await uploadBase64Safe(img, 'blogs/content') || img;
            }
            return img;
          })
        );
        blog.images = migrated.filter(Boolean) as string[];
        updated = true;
      }
      if (updated) {
        await blog.save();
        results.blogs.migrated++;
      } else {
        results.blogs.skipped++;
      }
    }

    // Migrate Hero Images
    const heroImages = await HeroImage.find({});
    for (const hero of heroImages) {
      if (hero.image?.startsWith('data:image')) {
        const url = await uploadBase64Safe(hero.image, 'hero-images');
        if (url) {
          hero.image = url;
          await hero.save();
          results.heroImages.migrated++;
        }
      } else {
        results.heroImages.skipped++;
      }
    }

    // Migrate Property Types
    const types = await PropertyType.find({});
    for (const type of types) {
      if (type.image?.startsWith('data:image')) {
        const url = await uploadBase64Safe(type.image, 'property-types');
        if (url) {
          type.image = url;
          await type.save();
          results.propertyTypes.migrated++;
        }
      } else {
        results.propertyTypes.skipped++;
      }
    }

    // Migrate Homepage Areas
    const areas = await HomepageArea.find({});
    for (const area of areas) {
      if (area.image?.startsWith('data:image')) {
        const url = await uploadBase64Safe(area.image, 'homepage-areas');
        if (url) {
          area.image = url;
          await area.save();
          results.homepageAreas.migrated++;
        }
      } else {
        results.homepageAreas.skipped++;
      }
    }

    // Migrate Pages
    const pages = await Page.find({});
    for (const page of pages) {
      if (page.featuredImage?.startsWith('data:image')) {
        const url = await uploadBase64Safe(page.featuredImage, 'pages');
        if (url) {
          page.featuredImage = url;
          await page.save();
          results.pages.migrated++;
        }
      } else {
        results.pages.skipped++;
      }
    }

    // Migrate Enquiries
    const enquiries = await Enquiry.find({});
    for (const enquiry of enquiries) {
      if (enquiry.images?.some((img: string) => img?.startsWith('data:image'))) {
        const migrated = await Promise.all(
          enquiry.images.map(async (img: string) => {
            if (img?.startsWith('data:image')) {
              return await uploadBase64Safe(img, 'enquiries') || img;
            }
            return img;
          })
        );
        enquiry.images = migrated.filter(Boolean) as string[];
        await enquiry.save();
        results.enquiries.migrated++;
      } else {
        results.enquiries.skipped++;
      }
    }

    // Migrate Branding
    const branding = await BrandingSettings.findOne({});
    if (branding) {
      let updated = false;
      if (branding.headerLogo?.startsWith('data:image')) {
        const url = await uploadBase64Safe(branding.headerLogo, 'branding');
        if (url) {
          branding.headerLogo = url;
          updated = true;
        }
      }
      if (branding.dashboardLogo?.startsWith('data:image')) {
        const url = await uploadBase64Safe(branding.dashboardLogo, 'branding');
        if (url) {
          branding.dashboardLogo = url;
          updated = true;
        }
      }
      if (branding.favicon?.startsWith('data:image')) {
        const url = await uploadBase64Safe(branding.favicon, 'branding');
        if (url) {
          branding.favicon = url;
          updated = true;
        }
      }
      if (updated) {
        await branding.save();
        results.branding.migrated = true;
      }
    }

    // Migrate SEO
    const seoSettings = await SEO.find({});
    for (const seo of seoSettings) {
      let updated = false;
      if (seo.ogImage?.startsWith('data:image')) {
        const url = await uploadBase64Safe(seo.ogImage, 'seo/og-images');
        if (url) {
          seo.ogImage = url;
          updated = true;
        }
      }
      if (seo.twitterImage?.startsWith('data:image')) {
        const url = await uploadBase64Safe(seo.twitterImage, 'seo/twitter-images');
        if (url) {
          seo.twitterImage = url;
          updated = true;
        }
      }
      if (updated) {
        await seo.save();
        results.seo.migrated++;
      } else {
        results.seo.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
