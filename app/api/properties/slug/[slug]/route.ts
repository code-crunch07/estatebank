import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { generateSlug } from "@/lib/utils";

// GET /api/properties/slug/[slug] - Get a property by slug and segment
// This is much more efficient than fetching all properties on the client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const segment = searchParams.get("segment") || "residential";
    
    if (!slug) {
      return errorResponse("Slug parameter is required", 400);
    }
    
    // Query only properties in the specified segment (uses index for fast lookup)
    // This is much more efficient than fetching ALL properties
    const properties = await Property.find({
      segment: segment.toLowerCase()
    })
      .lean() // Use lean() for better performance (returns plain JS objects)
      .maxTimeMS(5000); // 5 second timeout
    
    // Find property by matching slug (only search within the segment's properties)
    const property = properties.find((p: any) => {
      const propertySlug = generateSlug(p.name);
      return propertySlug === slug;
    });
    
    if (!property) {
      return errorResponse("Property not found", 404);
    }
    
    return successResponse(property);
  } catch (error) {
    return handleApiError(error);
  }
}
