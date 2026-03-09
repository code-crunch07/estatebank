import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Location from "@/models/location";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/locations - Get all locations
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    
    let query: any = {};
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }
    if (state) {
      query.state = { $regex: state, $options: "i" };
    }
    
    const locations = await Location.find(query).sort({ name: 1 });
    
    return successResponse(locations);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.city || !body.state) {
      return errorResponse("Missing required fields: name, city, state", 400);
    }
    
    const location = new Location({
      name: body.name,
      city: body.city,
      state: body.state,
      properties: body.properties || 0,
    });
    
    const savedLocation = await location.save();
    
    return successResponse(savedLocation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
