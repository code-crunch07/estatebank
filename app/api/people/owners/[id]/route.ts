import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import FlatOwner from "@/models/flat-owner";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/people/owners/[id] - Get a single flat owner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid owner ID", 400);
    }
    
    const owner = await FlatOwner.findById(id).populate("property");
    
    if (!owner) {
      return errorResponse("Owner not found", 404);
    }
    
    return successResponse(owner);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/people/owners/[id] - Update a flat owner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid owner ID", 400);
    }
    
    const body = await request.json();
    
    // Update propertyName if property is being updated
    if (body.property && !body.propertyName) {
      const property = await Property.findById(body.property);
      if (property) {
        body.propertyName = property.name;
      }
    }
    
    const owner = await FlatOwner.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("property");
    
    if (!owner) {
      return errorResponse("Owner not found", 404);
    }
    
    return successResponse(owner);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/people/owners/[id] - Delete a flat owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid owner ID", 400);
    }
    
    const owner = await FlatOwner.findByIdAndDelete(id);
    
    if (!owner) {
      return errorResponse("Owner not found", 404);
    }
    
    return successResponse({ message: "Owner deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
