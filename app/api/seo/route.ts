import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import SEO from "@/models/seo";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/seo - Get SEO settings (always returns single document)
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get the single SEO settings document, or create default if none exists
    let seoSettings = await SEO.findOne();
    
    if (!seoSettings) {
      // Create default SEO settings
      seoSettings = new SEO({
        siteTitle: "EstateBANK.in - Real Estate • Investments • Trust",
        siteDescription: "Find your dream property in Powai, Mumbai. Premium apartments, villas, and flats in prime locations.",
        keywords: ["real estate", "powai", "mumbai", "apartments", "flats", "properties"],
        robotsTxt: "User-agent: *\nAllow: /",
      });
      await seoSettings.save();
    }
    
    return successResponse(seoSettings);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/seo - Update SEO settings (upsert - creates if doesn't exist)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Handle keywords - convert string to array if needed
    if (body.keywords && typeof body.keywords === 'string') {
      body.keywords = body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
    
    // Find existing SEO settings or create new
    let seoSettings = await SEO.findOne();
    
    if (seoSettings) {
      // Update existing
      Object.assign(seoSettings, body);
      seoSettings.updatedAt = new Date();
      await seoSettings.save();
    } else {
      // Create new with provided data and defaults
      seoSettings = new SEO({
        siteTitle: body.siteTitle || "EstateBANK.in - Real Estate • Investments • Trust",
        siteDescription: body.siteDescription || "Find your dream property in Powai, Mumbai. Premium apartments, villas, and flats in prime locations.",
        keywords: body.keywords || ["real estate", "powai", "mumbai"],
        robotsTxt: body.robotsTxt || "User-agent: *\nAllow: /",
        ...body,
      });
      await seoSettings.save();
    }
    
    return successResponse(seoSettings);
  } catch (error) {
    return handleApiError(error);
  }
}

