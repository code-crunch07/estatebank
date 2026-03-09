import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongoose';
import Property from '@/models/property';
import { generateSlug } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://estatebank.in';
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties/under-construction`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic property routes
  let propertyRoutes: MetadataRoute.Sitemap = [];
  
  try {
    await connectToDatabase();
    
    const properties = await Property.find({
      status: { $ne: 'Draft' } // Exclude draft properties
    })
      .select('name segment updatedAt')
      .lean()
      .maxTimeMS(10000);
    
    propertyRoutes = properties.map((property: any) => {
      const segment = property.segment || 'residential';
      const slug = generateSlug(property.name);
      
      return {
        url: `${baseUrl}/properties/${segment}/${slug}`,
        lastModified: property.updatedAt ? new Date(property.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes even if property fetch fails
  }

  return [...staticRoutes, ...propertyRoutes];
}
