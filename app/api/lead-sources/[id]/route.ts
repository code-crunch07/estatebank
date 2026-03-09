import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import LeadSource from "@/models/lead-source";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/lead-sources/[id] - Get a single lead source
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead source ID", 400);
    }
    
    const source = await LeadSource.findById(id);
    
    if (!source) {
      return errorResponse("Lead source not found", 404);
    }
    
    return successResponse(source);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/lead-sources/[id] - Update a lead source
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead source ID", 400);
    }
    
    const body = await request.json();
    
    const source = await LeadSource.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!source) {
      return errorResponse("Lead source not found", 404);
    }
    
    return successResponse(source);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/lead-sources/[id] - Delete a lead source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead source ID", 400);
    }
    
    const source = await LeadSource.findByIdAndDelete(id);
    
    if (!source) {
      return errorResponse("Lead source not found", 404);
    }
    
    return successResponse({ message: "Lead source deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

