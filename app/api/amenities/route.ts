import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Amenity from "@/models/amenity";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/amenities - Get all amenities
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const amenities = await Amenity.find(query).sort({ name: 1 });
    
    return successResponse(amenities);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/amenities - Create a new amenity
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.icon) {
      return errorResponse("Missing required fields: name, icon", 400);
    }
    
    const amenity = new Amenity({
      name: body.name,
      icon: body.icon,
      iconLibrary: body.iconLibrary || "lucide",
      status: body.status || "Active",
    });
    
    const savedAmenity = await amenity.save();
    
    return successResponse(savedAmenity, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
