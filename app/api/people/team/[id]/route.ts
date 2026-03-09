import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import TeamMember from "@/models/team-member";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/people/team/[id] - Get a single team member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid team member ID", 400);
    }
    
    const teamMember = await TeamMember.findById(id);
    
    if (!teamMember) {
      return errorResponse("Team member not found", 404);
    }
    
    return successResponse(teamMember);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/people/team/[id] - Update a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid team member ID", 400);
    }
    
    const body = await request.json();
    
    // Handle phone as either string or array
    let phoneValue = "";
    if (body.phone !== undefined) {
      if (Array.isArray(body.phone)) {
        phoneValue = body.phone.filter((p: any) => p && typeof p === 'string' && p.trim()).join(", ");
      } else if (typeof body.phone === "string") {
        phoneValue = body.phone.trim();
      }
    }
    
    // Build update data with all fields
    const updateData: any = {
      name: body.name,
      email: body.email,
      phone: phoneValue || body.phone || "",
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
      updatedAt: new Date(),
    };
    
    const teamMember = await TeamMember.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!teamMember) {
      return errorResponse("Team member not found", 404);
    }
    
    return successResponse(teamMember);
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate")) {
      return errorResponse("Email already exists", 409);
    }
    return handleApiError(error);
  }
}

// DELETE /api/people/team/[id] - Delete a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid team member ID", 400);
    }
    
    const teamMember = await TeamMember.findByIdAndDelete(id);
    
    if (!teamMember) {
      return errorResponse("Team member not found", 404);
    }
    
    return successResponse({ message: "Team member deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
