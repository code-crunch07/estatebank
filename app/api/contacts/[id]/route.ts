import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Contact from "@/models/contact";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/contacts/[id] - Get a single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid contact ID", 400);
    }
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return errorResponse("Contact not found", 404);
    }
    
    return successResponse(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/contacts/[id] - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid contact ID", 400);
    }
    
    const body = await request.json();
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return errorResponse("Contact not found", 404);
    }
    
    return successResponse(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid contact ID", 400);
    }
    
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return errorResponse("Contact not found", 404);
    }
    
    return successResponse({ message: "Contact deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

