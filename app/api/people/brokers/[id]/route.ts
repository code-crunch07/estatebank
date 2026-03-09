import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Broker from "@/models/broker";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/people/brokers/[id] - Get a single broker
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid broker ID", 400);
    }
    
    const broker = await Broker.findById(id);
    
    if (!broker) {
      return errorResponse("Broker not found", 404);
    }
    
    return successResponse(broker);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/people/brokers/[id] - Update a broker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid broker ID", 400);
    }
    
    const body = await request.json();
    
    const broker = await Broker.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!broker) {
      return errorResponse("Broker not found", 404);
    }
    
    return successResponse(broker);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/people/brokers/[id] - Delete a broker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid broker ID", 400);
    }
    
    const broker = await Broker.findByIdAndDelete(id);
    
    if (!broker) {
      return errorResponse("Broker not found", 404);
    }
    
    return successResponse({ message: "Broker deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
