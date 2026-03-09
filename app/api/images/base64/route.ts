import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { generateSlug } from "@/lib/utils";

/**
 * API endpoint to serve base64 images as actual image files
 * This allows base64 images stored in the database to be used for social sharing
 * 
 * Usage: /api/images/base64?segment=residential&slug=property-slug&index=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get("segment");
    const slug = searchParams.get("slug");
    const index = parseInt(searchParams.get("index") || "0", 10);

    if (!segment || !slug) {
      return NextResponse.json(
        { error: "Missing segment or slug parameter" },
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

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Get base64 image from property
    let base64Image: string | null = null;

    // Priority 1: Featured image
    if ((property as any).featuredImage && (property as any).featuredImage.startsWith("data:")) {
      base64Image = (property as any).featuredImage;
    }
    // Priority 2: Images array
    else if (Array.isArray(property.images) && property.images.length > 0) {
      const base64Images = property.images.filter((img: string) => 
        img && img.startsWith("data:")
      );
      if (base64Images.length > index) {
        base64Image = base64Images[index];
      } else if (base64Images.length > 0) {
        base64Image = base64Images[0];
      }
    }
    // Priority 3: Single image
    else if ((property as any).image && (property as any).image.startsWith("data:")) {
      base64Image = (property as any).image;
    }

    if (!base64Image) {
      return NextResponse.json(
        { error: "No base64 image found for this property" },
        { status: 404 }
      );
    }

    // Extract image data from base64 string
    // Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 }
      );
    }

    const imageType = matches[1]; // jpeg, png, etc.
    const base64Data = matches[2];

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Determine content type
    const contentType = `image/${imageType === "jpeg" ? "jpeg" : imageType}`;

    // Return image with proper headers and cache control
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "Content-Length": imageBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error serving base64 image:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
