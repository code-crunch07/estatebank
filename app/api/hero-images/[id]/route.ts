import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import HeroImage from "@/models/hero-image";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/hero-images/[id] - Get a single hero image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid hero image ID", 400);
    }
    
    const heroImage = await HeroImage.findById(id).populate("propertyId");
    
    if (!heroImage) {
      return errorResponse("Hero image not found", 404);
    }
    
    return successResponse(heroImage);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/hero-images/[id] - Update a hero image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid hero image ID", 400);
    }
    
    const body = await request.json();
    
    const heroImage = await HeroImage.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("propertyId");
    
    if (!heroImage) {
      return errorResponse("Hero image not found", 404);
    }
    
    return successResponse(heroImage);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/hero-images/[id] - Delete a hero image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid hero image ID", 400);
    }
    
    const heroImage = await HeroImage.findByIdAndDelete(id);
    
    if (!heroImage) {
      return errorResponse("Hero image not found", 404);
    }
    
    return successResponse({ message: "Hero image deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
