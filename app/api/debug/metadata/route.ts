import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { generateSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get("segment");
    const slug = searchParams.get("slug");

    if (!segment || !slug) {
      return NextResponse.json(
        { 
          error: "Missing segment or slug parameter",
          note: "This is a debug endpoint returning JSON. Do not use this URL for social sharing. Use the actual property page URL instead."
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const properties = await Property.find({
      segment: segment.toLowerCase(),
    })
      .lean()
      .maxTimeMS(5000);

    // Normalize slugs for comparison
    const normalizeSlug = (s: string) => generateSlug(s).toLowerCase().trim();
    const normalizedSearchSlug = normalizeSlug(slug);
    
    const property = properties.find((p: any) => {
      if (!p.name) return false;
      const propertySlug = normalizeSlug(p.name);
      return propertySlug === normalizedSearchSlug;
    });
    
    // If not found, try fuzzy matching
    if (!property) {
      const similarProperty = properties.find((p: any) => {
        if (!p.name) return false;
        const propertyName = p.name.toLowerCase().trim();
        const searchName = slug.replace(/-/g, ' ').toLowerCase();
        return propertyName.includes(searchName) || searchName.includes(propertyName);
      });
      if (similarProperty) {
        // Use the similar property for metadata generation
        const propertyToUse = similarProperty;
        // Continue with metadata generation below, but add a note
        // We'll add the note in the response
      }
    }

    if (!property) {
      return NextResponse.json(
        { 
          error: "Property not found",
          note: "This is a debug endpoint returning JSON. Do not use this URL for social sharing. Use the actual property page URL instead.",
          suggestion: `Try: https://estatebank.in/properties/${segment}/${slug}`
        },
        { status: 404 }
      );
    }

    // Get base URL first (needed for base64 conversion)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null) ||
      (process.env.NODE_ENV === "production"
        ? "https://estatebank.in"
        : "http://localhost:3000");

    const validBaseUrl = baseUrl || "https://estatebank.in";

    // Get the best available image (prioritize featuredImage, then images array, then single image)
    // Convert base64 images to API URLs so they can be used for social sharing
    let mainImage = "/og-default.png";

    const isValidImageUrl = (url: string): boolean => {
      if (!url || !url.trim()) return false;
      // Reject base64 data URIs (we'll handle them separately)
      if (url.startsWith("data:")) return false;
      // Reject URLs containing base64 patterns
      if (url.includes("data:image")) return false;
      return true;
    };

    // Helper to convert base64 to API URL
    const getBase64ImageUrl = (base64: string, index: number = 0): string => {
      const propertySlug = normalizeSlug(property.name || '');
      return `${validBaseUrl}/api/images/base64?segment=${segment.toLowerCase()}&slug=${propertySlug}&index=${index}`;
    };

    if ((property as any).featuredImage) {
      const img = (property as any).featuredImage.trim();
      if (img.startsWith("data:")) {
        mainImage = getBase64ImageUrl(img, 0);
      } else if (isValidImageUrl(img)) {
        mainImage = img;
      }
    } else if (
      Array.isArray(property.images) &&
      property.images.length > 0
    ) {
      // First try to find a non-base64 image
      const validImage = property.images.find(
        (img: string) => img && isValidImageUrl(img)
      );
      if (validImage) {
        mainImage = validImage.trim();
      } else {
        // If no valid URL found, use first base64 image
        const base64Image = property.images.find(
          (img: string) => img && img.startsWith("data:")
        );
        if (base64Image) {
          const base64Index = property.images.indexOf(base64Image);
          mainImage = getBase64ImageUrl(base64Image, base64Index);
        }
      }
    } else if ((property as any).image) {
      const img = (property as any).image.trim();
      if (img.startsWith("data:")) {
        mainImage = getBase64ImageUrl(img, 0);
      } else if (isValidImageUrl(img)) {
        mainImage = img;
      }
    }

    let absoluteImageUrl = mainImage;

    if (mainImage.startsWith("http://") || mainImage.startsWith("https://")) {
      absoluteImageUrl = mainImage;
    } else {
      const cleanPath = mainImage.startsWith("/") ? mainImage : `/${mainImage}`;
      absoluteImageUrl = `${validBaseUrl}${cleanPath}`;
    }

    // Final validation - ensure URL is valid and doesn't contain undefined/null/base64
    if (
      !absoluteImageUrl ||
      absoluteImageUrl.includes("undefined") ||
      absoluteImageUrl.includes("null") ||
      absoluteImageUrl.includes("data:") ||
      absoluteImageUrl.includes("base64") ||
      !absoluteImageUrl.startsWith("http")
    ) {
      absoluteImageUrl = `${validBaseUrl}/og-default.png`;
    }

    // Clean up URL - remove any double slashes (except after http:// or https://)
    absoluteImageUrl = absoluteImageUrl.replace(/([^:]\/)\/+/g, "$1");

    // Ensure URL uses HTTPS in production
    if (
      process.env.NODE_ENV === "production" &&
      absoluteImageUrl.startsWith("http://")
    ) {
      absoluteImageUrl = absoluteImageUrl.replace("http://", "https://");
    }

    const title = `${property.name} - EstateBANK.in`;
    const description =
      property.description || `${property.name} in ${property.location}`;
    const url = `${validBaseUrl}/properties/${segment}/${slug}`;

    const canonicalUrl =
      process.env.NODE_ENV === "production" && url.startsWith("http://")
        ? url.replace("http://", "https://")
        : url;

    const metadata = {
      property: {
        name: property.name,
        description: property.description,
        location: property.location,
      },
      image: {
        original: mainImage,
        absolute: absoluteImageUrl,
        isValid: absoluteImageUrl.startsWith("http"),
        isHttps: absoluteImageUrl.startsWith("https"),
        containsBase64:
          absoluteImageUrl.includes("data:") ||
          absoluteImageUrl.includes("base64"),
      },
      metaTags: {
        title,
        description,
        url: canonicalUrl,
        openGraph: {
          "og:title": title,
          "og:description": description,
          "og:image": absoluteImageUrl,
          "og:image:secure_url": absoluteImageUrl,
          "og:image:width": "1200",
          "og:image:height": "630",
          "og:image:type": "image/jpeg",
          "og:image:alt": property.name,
          "og:url": canonicalUrl,
          "og:type": "website",
          "og:site_name": "EstateBANK.in",
          "og:locale": "en_US",
        },
        twitter: {
          "twitter:card": "summary_large_image",
          "twitter:title": title,
          "twitter:description": description,
          "twitter:image": absoluteImageUrl,
        },
      },
      environment: {
        baseUrl: validBaseUrl,
        nodeEnv: process.env.NODE_ENV,
        nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      },
    };

    return NextResponse.json({
      ...metadata,
      note: "This is a debug endpoint returning JSON. Do not use this URL for social sharing. Use the actual property page URL instead.",
      actualPropertyUrl: canonicalUrl,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error generating debug metadata:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
