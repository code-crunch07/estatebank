import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Page from "@/models/page";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/pages - Get all pages
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    
    const pages = await Page.find(query).sort({ order: 1, createdAt: -1 });
    return successResponse(pages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.title || !body.slug || !body.content) {
      return errorResponse("Missing required fields: title, slug, content", 400);
    }

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug: body.slug.toLowerCase().trim() });
    if (existingPage) {
      return errorResponse("A page with this slug already exists", 400);
    }

    const page = new Page({
      title: body.title,
      slug: body.slug.toLowerCase().trim(),
      content: body.content,
      excerpt: body.excerpt,
      status: body.status || "Draft",
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords ? (Array.isArray(body.metaKeywords) ? body.metaKeywords : body.metaKeywords.split(',').map((k: string) => k.trim())) : [],
      featuredImage: body.featuredImage,
      order: body.order || 0,
    });

    const savedPage = await page.save();
    return successResponse(savedPage, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

