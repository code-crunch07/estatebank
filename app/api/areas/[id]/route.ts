import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Area from "@/models/area";
import Location from "@/models/location";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/areas/[id] - Get a single area
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid area ID", 400);
    }
    
    const area = await Area.findById(id).populate("location");
    
    if (!area) {
      return errorResponse("Area not found", 404);
    }
    
    return successResponse(area);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/areas/[id] - Update an area
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid area ID", 400);
    }
    
    const body = await request.json();
    
    // Update locationName if location is being updated
    if (body.location && !body.locationName) {
      const location = await Location.findById(body.location);
      if (location) {
        body.locationName = location.name;
      }
    }
    
    const area = await Area.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("location");
    
    if (!area) {
      return errorResponse("Area not found", 404);
    }
    
    return successResponse(area);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/areas/[id] - Delete an area
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid area ID", 400);
    }
    
    const area = await Area.findByIdAndDelete(id);
    
    if (!area) {
      return errorResponse("Area not found", 404);
    }
    
    return successResponse({ message: "Area deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
