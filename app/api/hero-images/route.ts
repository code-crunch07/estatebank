import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import HeroImage from "@/models/hero-image";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/hero-images - Get all hero images
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    
    const heroImages = await HeroImage.find(query)
      .populate("propertyId")
      .sort({ order: 1 });
    
    return successResponse(heroImages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/hero-images - Create a new hero image
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.type) {
      return errorResponse("Missing required field: type", 400);
    }
    
    if (body.type === "property" && !body.propertyId) {
      return errorResponse("propertyId is required when type is 'property'", 400);
    }
    
    if (body.type === "banner" && !body.image) {
      return errorResponse("image is required when type is 'banner'", 400);
    }
    
    // Get current max order
    const maxOrderHeroImage = await HeroImage.findOne().sort({ order: -1 });
    const nextOrder = maxOrderHeroImage ? maxOrderHeroImage.order + 1 : 1;
    
    const heroImage = new HeroImage({
      type: body.type,
      propertyId: body.propertyId || undefined,
      image: body.image || undefined,
      linkUrl: body.linkUrl || undefined,
      title: body.title || undefined,
      description: body.description || undefined,
      buttonText: body.buttonText || undefined,
      order: body.order || nextOrder,
      status: body.status || "Active",
    });
    
    const savedHeroImage = await heroImage.save();
    
    return successResponse(savedHeroImage, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
