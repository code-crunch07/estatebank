import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PersonClient from "@/models/person-client";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/people/clients/[id] - Get a single person client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid client ID", 400);
    }
    
    const client = await PersonClient.findById(id);
    
    if (!client) {
      return errorResponse("Client not found", 404);
    }
    
    return successResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/people/clients/[id] - Update a person client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid client ID", 400);
    }
    
    const body = await request.json();
    
    const client = await PersonClient.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return errorResponse("Client not found", 404);
    }
    
    return successResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/people/clients/[id] - Delete a person client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid client ID", 400);
    }
    
    const client = await PersonClient.findByIdAndDelete(id);
    
    if (!client) {
      return errorResponse("Client not found", 404);
    }
    
    return successResponse({ message: "Client deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
