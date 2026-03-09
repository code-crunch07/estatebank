import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/leads/[id] - Get a single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead ID", 400);
    }
    
    const lead = await Lead.findById(id).populate("assignedTo");
    
    if (!lead) {
      return errorResponse("Lead not found", 404);
    }
    
    return successResponse(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead ID", 400);
    }
    
    const body = await request.json();
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("assignedTo");
    
    if (!lead) {
      return errorResponse("Lead not found", 404);
    }
    
    return successResponse(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid lead ID", 400);
    }
    
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return errorResponse("Lead not found", 404);
    }
    
    return successResponse({ message: "Lead deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
