import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Testimonial from "@/models/testimonial";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/testimonials - Get all testimonials
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    
    return successResponse(testimonials);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/testimonials - Create a new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.text) {
      return errorResponse("Missing required fields: name, text", 400);
    }
    
    const testimonial = new Testimonial({
      name: body.name,
      role: body.role || "",
      company: body.company || "",
      image: body.image || "/logo.png",
      rating: body.rating || 5,
      text: body.text,
      status: body.status || "Published",
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
    });
    
    const savedTestimonial = await testimonial.save();
    
    return successResponse(savedTestimonial, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
