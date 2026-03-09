import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ActivityLog from "@/models/activity-log";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/activities/[id] - Get a single activity log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid activity log ID", 400);
    }
    
    const activity = await ActivityLog.findById(id)
      .populate("lead")
      .populate("agent");
    
    if (!activity) {
      return errorResponse("Activity log not found", 404);
    }
    
    return successResponse(activity);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/activities/[id] - Update an activity log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid activity log ID", 400);
    }
    
    const body = await request.json();
    
    // Update leadName if lead is being updated
    if (body.lead && !body.leadName) {
      const lead = await Lead.findById(body.lead);
      if (lead) {
        body.leadName = lead.name;
      }
    }
    
    // Convert date string to Date object if provided
    if (body.date) {
      body.date = new Date(body.date);
    }
    
    const activity = await ActivityLog.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("lead")
      .populate("agent");
    
    if (!activity) {
      return errorResponse("Activity log not found", 404);
    }
    
    return successResponse(activity);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/activities/[id] - Delete an activity log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid activity log ID", 400);
    }
    
    const activity = await ActivityLog.findByIdAndDelete(id);
    
    if (!activity) {
      return errorResponse("Activity log not found", 404);
    }
    
    return successResponse({ message: "Activity log deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
