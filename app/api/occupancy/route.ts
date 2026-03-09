import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import OccupancyType from "@/models/occupancy-type";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/occupancy - Get all occupancy types
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    const types = await OccupancyType.find(query).sort({ name: 1 });
    
    return successResponse(types);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/occupancy - Create a new occupancy type
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Missing required field: name", 400);
    }
    
    const occupancyType = new OccupancyType({
      name: body.name,
      description: body.description || "",
    });
    
    const savedType = await occupancyType.save();
    
    return successResponse(savedType, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

