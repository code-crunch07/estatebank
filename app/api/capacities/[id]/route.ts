import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Capacity from "@/models/capacity";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/capacities/[id] - Get a single capacity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid capacity ID", 400);
    }
    
    const capacity = await Capacity.findById(id);
    
    if (!capacity) {
      return errorResponse("Capacity not found", 404);
    }
    
    return successResponse(capacity);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/capacities/[id] - Update a capacity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid capacity ID", 400);
    }
    
    const body = await request.json();
    
    const capacity = await Capacity.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!capacity) {
      return errorResponse("Capacity not found", 404);
    }
    
    return successResponse(capacity);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/capacities/[id] - Delete a capacity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid capacity ID", 400);
    }
    
    const capacity = await Capacity.findByIdAndDelete(id);
    
    if (!capacity) {
      return errorResponse("Capacity not found", 404);
    }
    
    return successResponse({ message: "Capacity deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

