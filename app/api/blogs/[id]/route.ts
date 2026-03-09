import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Blog from "@/models/blog";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";

// GET /api/blogs/[id] - Get a single blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return errorResponse("Blog not found", 404);
    }
    
    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    
    return successResponse(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/blogs/[id] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }
    
    const body = await request.json();
    
    // Validate required fields for update
    if (body.title !== undefined && !body.title.trim()) {
      return errorResponse("Title cannot be empty", 400);
    }
    if (body.author !== undefined && !body.author.trim()) {
      return errorResponse("Author cannot be empty", 400);
    }
    if (body.content !== undefined && !body.content.trim()) {
      return errorResponse("Content cannot be empty", 400);
    }
    
    // Validate status enum
    const validStatuses = ["Published", "Draft"];
    if (body.status && !validStatuses.includes(body.status)) {
      return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }
    
    // Convert tags array to string if needed
    const updateData: any = { ...body, updatedAt: new Date() };
    if (Array.isArray(body.tags)) {
      updateData.tags = body.tags.join(", ");
    }
    // Ensure images is an array
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? body.images : [];
    }
    // Trim string fields
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.author) updateData.author = updateData.author.trim();
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return errorResponse("Blog not found", 404);
    }
    
    return successResponse(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid blog ID", 400);
    }
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return errorResponse("Blog not found", 404);
    }
    
    return successResponse({ message: "Blog deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

