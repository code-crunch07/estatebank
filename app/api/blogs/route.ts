import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Blog from "@/models/blog";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/blogs - Get all blogs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    return successResponse(blogs);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/blogs - Create a new blog
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.title || !body.author || !body.content) {
      return errorResponse("Missing required fields: title, author, content", 400);
    }
    
    // Validate status enum
    const validStatuses = ["Published", "Draft"];
    const status = body.status && validStatuses.includes(body.status) ? body.status : "Draft";
    
    // Convert tags array to string if needed
    let tagsValue = "";
    if (Array.isArray(body.tags)) {
      tagsValue = body.tags.join(", ");
    } else if (typeof body.tags === "string") {
      tagsValue = body.tags;
    }

    const blog = new Blog({
      title: body.title.trim(),
      author: body.author.trim(),
      status: status,
      content: body.content,
      excerpt: body.excerpt || "",
      category: body.category || "",
      tags: tagsValue,
      featuredImage: body.featuredImage || "",
      images: Array.isArray(body.images) ? body.images : [],
      metaTitle: body.metaTitle || "",
      metaDescription: body.metaDescription || "",
      views: body.views || 0,
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    });
    
    const savedBlog = await blog.save();
    
    return successResponse(savedBlog, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

