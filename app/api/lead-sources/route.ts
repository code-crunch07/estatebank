import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import LeadSource from "@/models/lead-source";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/lead-sources - Get all lead sources
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    const sources = await LeadSource.find(query).sort({ name: 1 });
    
    return successResponse(sources);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/lead-sources - Create a new lead source
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Missing required field: name", 400);
    }
    
    const leadSource = new LeadSource({
      name: body.name,
      description: body.description || "",
      leads: body.leads || 0,
    });
    
    const savedSource = await leadSource.save();
    
    return successResponse(savedSource, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

