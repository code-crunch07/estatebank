import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import FollowUp from "@/models/follow-up";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/follow-ups - Get all follow-ups
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const date = searchParams.get("date");
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (leadId) {
      query.lead = leadId;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const followUps = await FollowUp.find(query)
      .populate("lead")
      .sort({ scheduledDate: 1, scheduledTime: 1 });
    
    return successResponse(followUps);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/follow-ups - Create a new follow-up
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.lead || !body.type || !body.scheduledDate || !body.scheduledTime) {
      return errorResponse("Missing required fields: lead, type, scheduledDate, scheduledTime", 400);
    }
    
    // Get lead name if lead is an ObjectId
    let leadName = body.leadName;
    if (!leadName && body.lead) {
      const lead = await Lead.findById(body.lead);
      if (lead) {
        leadName = lead.name;
      }
    }
    
    const followUp = new FollowUp({
      lead: body.lead,
      leadName: leadName || "",
      type: body.type,
      scheduledDate: new Date(body.scheduledDate),
      scheduledTime: body.scheduledTime,
      status: body.status || "Pending",
      notes: body.notes || "",
      completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
    });
    
    const savedFollowUp = await followUp.save();
    const populatedFollowUp = await FollowUp.findById(savedFollowUp._id).populate("lead");
    
    return successResponse(populatedFollowUp, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
