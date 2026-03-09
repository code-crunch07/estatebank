import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Page from "@/models/page";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/pages/[id] - Get a single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    // Check if it's a slug instead of ID
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    let page;
    
    if (isObjectId) {
      page = await Page.findById(id);
    } else {
      // Try to find by slug
      page = await Page.findOne({ slug: id.toLowerCase().trim() });
    }
    
    if (!page) {
      return errorResponse("Page not found", 404);
    }
    
    return successResponse(page);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid page ID", 400);
    }
    
    const body = await request.json();
    
    // If slug is being updated, check for duplicates
    if (body.slug) {
      const existingPage = await Page.findOne({ 
        slug: body.slug.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existingPage) {
        return errorResponse("A page with this slug already exists", 400);
      }
      body.slug = body.slug.toLowerCase().trim();
    }
    
    // Handle metaKeywords
    if (body.metaKeywords && typeof body.metaKeywords === 'string') {
      body.metaKeywords = body.metaKeywords.split(',').map((k: string) => k.trim());
    }
    
    const page = await Page.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!page) {
      return errorResponse("Page not found", 404);
    }
    
    return successResponse(page);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid page ID", 400);
    }
    
    const page = await Page.findByIdAndDelete(id);
    
    if (!page) {
      return errorResponse("Page not found", 404);
    }
    
    return successResponse({ message: "Page deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

