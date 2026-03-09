import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Capacity from "@/models/capacity";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/capacities - Get all capacities
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
      ];
    }
    
    const capacities = await Capacity.find(query).sort({ bedrooms: 1, bathrooms: 1 });
    
    return successResponse(capacities);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/capacities - Create a new capacity
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Missing required field: name", 400);
    }
    
    const capacity = new Capacity({
      name: body.name,
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
    });
    
    const savedCapacity = await capacity.save();
    
    return successResponse(savedCapacity, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

