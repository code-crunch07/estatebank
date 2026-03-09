import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// Import global cache invalidation helper
function markPropertiesCacheStale() {
  const globalCacheKey = '__PROPERTIES_API_CACHE__';
  if ((globalThis as any)[globalCacheKey]) {
    for (const entry of ((globalThis as any)[globalCacheKey] as Map<string, { data: any; timestamp: number; stale?: boolean }>).values()) {
      entry.stale = true;
    }
    console.log('[Properties API] Cache marked as stale (from [id] route)');
  }
}

// GET /api/properties/[id] - Get a single property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property ID", 400);
    }
    
    const property = await Property.findById(id);
    
    if (!property) {
      return errorResponse("Property not found", 404);
    }
    
    return successResponse(property);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/properties/[id] - Update a property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property ID", 400);
    }
    
    const body = await request.json();
    
    // Normalize status to array format for backward compatibility
    const updateData = {
      ...body,
      status: Array.isArray(body.status) && body.status.length > 0 
        ? body.status 
        : (body.status ? (Array.isArray(body.status) ? body.status : [body.status]) : ["Available"]),
      updatedAt: new Date(),
    };
    
    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return errorResponse("Property not found", 404);
    }
    
    // Mark cache as stale after update
    markPropertiesCacheStale();
    
    return successResponse(property);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid property ID", 400);
    }
    
    const property = await Property.findByIdAndDelete(id);
    
    if (!property) {
      return errorResponse("Property not found", 404);
    }
    
    // Mark cache as stale after deletion
    markPropertiesCacheStale();
    
    return successResponse({ message: "Property deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
