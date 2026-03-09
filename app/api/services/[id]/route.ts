import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Service from "@/models/service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/services/[id] - Get a single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid service ID", 400);
    }
    
    const service = await Service.findById(id);
    
    if (!service) {
      return errorResponse("Service not found", 404);
    }
    
    return successResponse(service);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/services/[id] - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid service ID", 400);
    }
    
    const body = await request.json();
    
    const service = await Service.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return errorResponse("Service not found", 404);
    }
    
    return successResponse(service);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/services/[id] - Delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid service ID", 400);
    }
    
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return errorResponse("Service not found", 404);
    }
    
    return successResponse({ message: "Service deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
