import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import TeamMember from "@/models/team-member";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/people/team - Get all team members
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    
    const teamMembers = await TeamMember.find(query).sort({ createdAt: -1 });
    
    return successResponse(teamMembers);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/people/team - Create a new team member
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return errorResponse("Missing required fields: name, email", 400);
    }
    
    // Handle phone as either string or array
    let phoneValue = "";
    if (Array.isArray(body.phone)) {
      phoneValue = body.phone.filter((p: any) => p && typeof p === 'string' && p.trim()).join(", ");
    } else if (typeof body.phone === "string") {
      phoneValue = body.phone.trim();
    }
    
    // If phone is still empty, use empty string (phone is required in model, but we'll allow empty for now)
    if (!phoneValue) {
      phoneValue = "";
    }
    
    const teamMember = new TeamMember({
      name: body.name,
      email: body.email,
      phone: phoneValue,
      role: body.role || "Agent",
      department: body.department || "",
      location: body.location || "",
      image: body.image || "",
      bio: body.bio || "",
      socials: {
        linkedin: body.socials?.linkedin || "",
        twitter: body.socials?.twitter || "",
        facebook: body.socials?.facebook || "",
        instagram: body.socials?.instagram || "",
      },
      leads: body.leads || 0,
      status: body.status || "Active",
      order: body.order || 0,
    });
    
    const savedTeamMember = await teamMember.save();
    
    return successResponse(savedTeamMember, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate")) {
      return errorResponse("Email already exists", 409);
    }
    return handleApiError(error);
  }
}
