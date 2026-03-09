import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PropertyType from "@/models/property-type";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/property-types/[id] - Get a single property type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property type ID", 400);
    }
    
    const type = await PropertyType.findById(id);
    
    if (!type) {
      return errorResponse("Property type not found", 404);
    }
    
    return successResponse(type);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/property-types/[id] - Update a property type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property type ID", 400);
    }
    
    const body = await request.json();
    
    const type = await PropertyType.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!type) {
      return errorResponse("Property type not found", 404);
    }
    
    return successResponse(type);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/property-types/[id] - Delete a property type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property type ID", 400);
    }
    
    const type = await PropertyType.findByIdAndDelete(id);
    
    if (!type) {
      return errorResponse("Property type not found", 404);
    }
    
    return successResponse({ message: "Property type deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

