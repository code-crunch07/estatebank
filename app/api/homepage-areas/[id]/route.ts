import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import HomepageArea from "@/models/homepage-area";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/homepage-areas/[id] - Get a single homepage area
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid homepage area ID", 400);
    }
    
    const homepageArea = await HomepageArea.findById(id);
    
    if (!homepageArea) {
      return errorResponse("Homepage area not found", 404);
    }
    
    return successResponse(homepageArea);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/homepage-areas/[id] - Update a homepage area
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid homepage area ID", 400);
    }
    
    const body = await request.json();
    
    const homepageArea = await HomepageArea.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!homepageArea) {
      return errorResponse("Homepage area not found", 404);
    }
    
    return successResponse(homepageArea);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/homepage-areas/[id] - Delete a homepage area
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid homepage area ID", 400);
    }
    
    const homepageArea = await HomepageArea.findByIdAndDelete(id);
    
    if (!homepageArea) {
      return errorResponse("Homepage area not found", 404);
    }
    
    return successResponse({ message: "Homepage area deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
