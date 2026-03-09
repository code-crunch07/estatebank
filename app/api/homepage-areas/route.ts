import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import HomepageArea from "@/models/homepage-area";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/homepage-areas - Get all homepage areas
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const homepageAreas = await HomepageArea.find(query).sort({ order: 1 });
    
    return successResponse(homepageAreas);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/homepage-areas - Create a new homepage area
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.image) {
      return errorResponse("Missing required fields: name, image", 400);
    }
    
    // Get current max order
    const maxOrderArea = await HomepageArea.findOne().sort({ order: -1 });
    const nextOrder = maxOrderArea ? maxOrderArea.order + 1 : 1;
    
    const homepageArea = new HomepageArea({
      name: body.name,
      description: body.description || "",
      image: body.image,
      link: body.link || "",
      order: body.order || nextOrder,
      status: body.status || "Active",
    });
    
    const savedHomepageArea = await homepageArea.save();
    
    return successResponse(savedHomepageArea, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
