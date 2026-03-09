import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ActivityLog from "@/models/activity-log";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/activities - Get all activity logs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");
    const agentId = searchParams.get("agentId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    
    let query: any = {};
    
    if (leadId) {
      query.lead = leadId;
    }
    if (agentId) {
      query.agent = agentId;
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("lead")
        .populate("agent")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ]);
    
    return successResponse({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/activities - Create a new activity log
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.type || !body.lead || !body.description) {
      return errorResponse("Missing required fields: type, lead, description", 400);
    }
    
    // Get lead name if lead is an ObjectId
    let leadName = body.leadName;
    if (!leadName && body.lead) {
      const lead = await Lead.findById(body.lead);
      if (lead) {
        leadName = lead.name;
      }
    }
    
    const activityLog = new ActivityLog({
      type: body.type,
      lead: body.lead,
      leadName: leadName || "",
      agent: body.agent || undefined,
      agentName: body.agentName || "",
      description: body.description,
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "Completed",
    });
    
    const savedActivity = await activityLog.save();
    const populatedActivity = await ActivityLog.findById(savedActivity._id)
      .populate("lead")
      .populate("agent");
    
    return successResponse(populatedActivity, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
