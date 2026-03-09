import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Testimonial from "@/models/testimonial";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/testimonials/[id] - Get a single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid testimonial ID", 400);
    }
    
    const testimonial = await Testimonial.findById(id);
    
    if (!testimonial) {
      return errorResponse("Testimonial not found", 404);
    }
    
    return successResponse(testimonial);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/testimonials/[id] - Update a testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid testimonial ID", 400);
    }
    
    const body = await request.json();
    
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!testimonial) {
      return errorResponse("Testimonial not found", 404);
    }
    
    return successResponse(testimonial);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/testimonials/[id] - Delete a testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid testimonial ID", 400);
    }
    
    const testimonial = await Testimonial.findByIdAndDelete(id);
    
    if (!testimonial) {
      return errorResponse("Testimonial not found", 404);
    }
    
    return successResponse({ message: "Testimonial deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
