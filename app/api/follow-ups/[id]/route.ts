import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import FollowUp from "@/models/follow-up";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/follow-ups/[id] - Get a single follow-up
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid follow-up ID", 400);
    }
    
    const followUp = await FollowUp.findById(id).populate("lead");
    
    if (!followUp) {
      return errorResponse("Follow-up not found", 404);
    }
    
    return successResponse(followUp);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/follow-ups/[id] - Update a follow-up
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid follow-up ID", 400);
    }
    
    const body = await request.json();
    
    // Update leadName if lead is being updated
    if (body.lead && !body.leadName) {
      const lead = await Lead.findById(body.lead);
      if (lead) {
        body.leadName = lead.name;
      }
    }
    
    // Convert date strings to Date objects
    if (body.scheduledDate) {
      body.scheduledDate = new Date(body.scheduledDate);
    }
    if (body.completedAt) {
      body.completedAt = new Date(body.completedAt);
    }
    
    const followUp = await FollowUp.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("lead");
    
    if (!followUp) {
      return errorResponse("Follow-up not found", 404);
    }
    
    return successResponse(followUp);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/follow-ups/[id] - Delete a follow-up
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid follow-up ID", 400);
    }
    
    const followUp = await FollowUp.findByIdAndDelete(id);
    
    if (!followUp) {
      return errorResponse("Follow-up not found", 404);
    }
    
    return successResponse({ message: "Follow-up deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
