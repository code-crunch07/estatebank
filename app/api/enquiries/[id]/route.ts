import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";
import Enquiry from "@/models/enquiry";

// GET /api/enquiries/[id] - Get a single enquiry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid enquiry ID", 400);
    }
    
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return errorResponse("Enquiry not found", 404);
    }
    
    return successResponse(enquiry);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/enquiries/[id] - Update an enquiry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid enquiry ID", 400);
    }
    
    const body = await request.json();
    
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!enquiry) {
      return errorResponse("Enquiry not found", 404);
    }
    
    return successResponse(enquiry);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/enquiries/[id] - Delete an enquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid enquiry ID", 400);
    }
    
    const enquiry = await Enquiry.findByIdAndDelete(id);
    
    if (!enquiry) {
      return errorResponse("Enquiry not found", 404);
    }
    
    return successResponse({ message: "Enquiry deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
