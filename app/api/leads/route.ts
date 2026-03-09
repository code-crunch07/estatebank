import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Lead from "@/models/lead";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/leads - Get all leads
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (source) {
      query.source = source;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { propertyInterest: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [leads, total] = await Promise.all([
      Lead.find(query).populate("assignedTo").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);
    
    return successResponse({
      leads,
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

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    const lead = new Lead({
      name: body.name,
      email: body.email,
      phone: body.phone,
      source: body.source || "Website",
      status: body.status || "New",
      propertyInterest: body.propertyInterest || "",
      assignedTo: body.assignedTo || undefined,
      assignedToName: body.assignedToName || "",
      notes: body.notes || "",
    });
    
    const savedLead = await lead.save();
    const populatedLead = await Lead.findById(savedLead._id).populate("assignedTo");
    
    return successResponse(populatedLead, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
