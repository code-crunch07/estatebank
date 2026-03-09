import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Area from "@/models/area";
import Location from "@/models/location";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/areas - Get all areas
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get("locationId");
    const locationName = searchParams.get("locationName");
    
    let query: any = {};
    if (locationId) {
      query.location = locationId;
    }
    if (locationName) {
      query.locationName = { $regex: locationName, $options: "i" };
    }
    
    const areas = await Area.find(query).populate("location").sort({ name: 1 });
    
    return successResponse(areas);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/areas - Create a new area
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.location) {
      return errorResponse("Missing required fields: name, location", 400);
    }
    
    // Get location name if location is an ObjectId
    let locationName = body.locationName;
    if (!locationName && body.location) {
      const location = await Location.findById(body.location);
      if (location) {
        locationName = location.name;
      }
    }
    
    const area = new Area({
      name: body.name,
      location: body.location,
      locationName: locationName || "",
      properties: body.properties || 0,
    });
    
    const savedArea = await area.save();
    const populatedArea = await Area.findById(savedArea._id).populate("location");
    
    return successResponse(populatedArea, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
