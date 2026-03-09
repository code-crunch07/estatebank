import { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { generateSlug } from "@/lib/utils";

/**
 * Minimal lean property type
 * (needed to satisfy TypeScript)
 */
type PropertyLean = {
  name: string;
  description?: string;
  location?: string;
  featuredImage?: string;
  images?: string[];
  slug: string;
  segment: string;
};

type Props = {
  params: Promise<{
    segment: string;
    slug: string;
  }> | {
    segment: string;
    slug: string;
  };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://estatebank.in");

  // Use og-default.png if available, otherwise fallback to logo.png
  const fallbackImage = `${baseUrl}/og-default.png`;
  const logoFallback = `${baseUrl}/logo.png`;

  try {
    // Handle params as Promise (Next.js 15+) or object
    const resolvedParams = params instanceof Promise ? await params : params;
    
    await connectToDatabase();

    // Safely get segment with fallback
    const segment = resolvedParams?.segment?.toLowerCase() || 'residential';
    const decodedSlug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
    const normalizedSlug = generateSlug(decodedSlug);

    // Fetch all properties in the segment (slug is computed from name, not stored)
    const propertiesRaw = await Property.find({
      segment,
    })
      .lean()
      .maxTimeMS(5000);

    // Type guard to check if property has required fields
    const isValidProperty = (p: any): p is PropertyLean => {
      return p && typeof p.name === 'string' && typeof p.segment === 'string';
    };

    // Find property by matching generated slug from name
    const normalizeSlug = (s: string) => generateSlug(s).toLowerCase().trim();
    const property = (propertiesRaw as any[]).find((p: any) => {
      if (!p?.name) return false;
      const propertySlug = normalizeSlug(p.name);
      return propertySlug === normalizedSlug.toLowerCase().trim();
    });

    // If not found, try fuzzy matching as fallback
    let foundProperty: PropertyLean | null = null;
    
    if (isValidProperty(property)) {
      foundProperty = {
        name: property.name,
        description: property.description,
        location: property.location,
        featuredImage: property.featuredImage,
        images: property.images,
        slug: normalizeSlug(property.name),
        segment: property.segment,
      };
    } else {
      // Try fuzzy matching as fallback
      const similarProperty = (propertiesRaw as any[]).find((p: any) => {
        if (!p?.name) return false;
        const propertyName = p.name.toLowerCase().trim();
        const searchName = decodedSlug.replace(/-/g, ' ').toLowerCase();
        return propertyName.includes(searchName) || searchName.includes(propertyName);
      });
      
      if (isValidProperty(similarProperty)) {
        foundProperty = {
          name: similarProperty.name,
          description: similarProperty.description,
          location: similarProperty.location,
          featuredImage: similarProperty.featuredImage,
          images: similarProperty.images,
          slug: normalizeSlug(similarProperty.name),
          segment: similarProperty.segment,
        };
      }
    }

    // -------------------------
    // PROPERTY NOT FOUND
    // -------------------------
    if (!foundProperty) {
      const url = `${baseUrl}/properties/${encodeURIComponent(
        segment
      )}/${encodeURIComponent(resolvedParams.slug)}`;

      return {
        title: "Property - EstateBANK.in",
        description: "Property details",
        openGraph: {
          title: "Property - EstateBANK.in",
          description: "Property details",
          url,
          siteName: "EstateBANK.in",
          type: "website",
          images: [
            {
              url: fallbackImage,
              width: 1200,
              height: 630,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          images: [fallbackImage],
        },
      };
    }

    // -------------------------
    // PUBLIC IMAGE ONLY (Cloudinary URLs or public URLs)
    // -------------------------
    const getPublicImage = (p: PropertyLean): string => {
      // Helper to check if URL is valid (not base64)
      const isValidUrl = (url: string | undefined): boolean => {
        if (!url) return false;
        // Reject base64 data URIs
        if (url.startsWith('data:') || url.includes('data:image')) return false;
        // Accept http/https URLs (including Cloudinary)
        return url.startsWith('http://') || url.startsWith('https://');
      };

      // Priority 1: Featured image (Cloudinary or public URL)
      if (isValidUrl(p.featuredImage)) {
        return p.featuredImage!;
      }

      // Priority 2: First valid image from images array
      if (Array.isArray(p.images)) {
        const validImage = p.images.find(
          (i) => typeof i === "string" && isValidUrl(i)
        );
        if (validImage) return validImage;
      }

      // Fallback to default OG image or logo
      // Try og-default.png first, then logo.png
      return fallbackImage;
    };

    const image = getPublicImage(foundProperty);

    const title = `${foundProperty.name} - EstateBANK.in`;
    const description =
      foundProperty.description ||
      `${foundProperty.name} in ${foundProperty.location || "Mumbai"}`;

    const canonicalUrl = `${baseUrl}/properties/${encodeURIComponent(
      segment
    )}/${encodeURIComponent(resolvedParams.slug)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "EstateBANK.in",
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: foundProperty.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Metadata error:", error);

    return {
      title: "Property - EstateBANK.in",
      description: "Property details",
      openGraph: {
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: [fallbackImage],
      },
    };
  }
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
