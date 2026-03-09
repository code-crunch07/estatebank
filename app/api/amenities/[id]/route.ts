import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Amenity from "@/models/amenity";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/amenities/[id] - Get a single amenity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid amenity ID", 400);
    }
    
    const amenity = await Amenity.findById(id);
    
    if (!amenity) {
      return errorResponse("Amenity not found", 404);
    }
    
    return successResponse(amenity);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/amenities/[id] - Update an amenity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid amenity ID", 400);
    }
    
    const body = await request.json();
    
    const amenity = await Amenity.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!amenity) {
      return errorResponse("Amenity not found", 404);
    }
    
    return successResponse(amenity);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/amenities/[id] - Delete an amenity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid amenity ID", 400);
    }
    
    const amenity = await Amenity.findByIdAndDelete(id);
    
    if (!amenity) {
      return errorResponse("Amenity not found", 404);
    }
    
    return successResponse({ message: "Amenity deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
