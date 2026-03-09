import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Location from "@/models/location";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/locations/[id] - Get a single location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid location ID", 400);
    }
    
    const location = await Location.findById(id);
    
    if (!location) {
      return errorResponse("Location not found", 404);
    }
    
    return successResponse(location);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/locations/[id] - Update a location
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid location ID", 400);
    }
    
    const body = await request.json();
    
    const location = await Location.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!location) {
      return errorResponse("Location not found", 404);
    }
    
    return successResponse(location);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/locations/[id] - Delete a location
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid location ID", 400);
    }
    
    const location = await Location.findByIdAndDelete(id);
    
    if (!location) {
      return errorResponse("Location not found", 404);
    }
    
    return successResponse({ message: "Location deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
