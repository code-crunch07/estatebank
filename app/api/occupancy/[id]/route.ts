import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import OccupancyType from "@/models/occupancy-type";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/occupancy/[id] - Get a single occupancy type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid occupancy type ID", 400);
    }
    
    const type = await OccupancyType.findById(id);
    
    if (!type) {
      return errorResponse("Occupancy type not found", 404);
    }
    
    return successResponse(type);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/occupancy/[id] - Update an occupancy type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid occupancy type ID", 400);
    }
    
    const body = await request.json();
    
    const type = await OccupancyType.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!type) {
      return errorResponse("Occupancy type not found", 404);
    }
    
    return successResponse(type);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/occupancy/[id] - Delete an occupancy type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid occupancy type ID", 400);
    }
    
    const type = await OccupancyType.findByIdAndDelete(id);
    
    if (!type) {
      return errorResponse("Occupancy type not found", 404);
    }
    
    return successResponse({ message: "Occupancy type deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

