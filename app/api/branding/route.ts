import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import BrandingSettings from "@/models/branding-settings";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/branding - Get branding settings (single document)
export async function GET() {
  try {
    await connectToDatabase();
    
    // Branding settings is a single document, so we get the first one or create default
    let branding = await BrandingSettings.findOne();
    
    if (!branding) {
      // Create default branding settings
      branding = new BrandingSettings({
        headerLogo: "/logo.png",
        dashboardLogo: "/logo.png",
        favicon: "/images/fav-icon/icon.png",
        navLinks: [
          { label: "Home", href: "/", order: 1, visible: true, children: [] },
          {
            label: "Properties",
            href: "/properties",
            order: 2,
            visible: true,
            children: [
              { label: "Residential", href: "/properties?segment=residential", order: 1, visible: true },
              { label: "Commercial", href: "/properties?segment=commercial", order: 2, visible: true },
            ],
          },
        ],
      });
      await branding.save();
    }
    
    return successResponse(branding);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/branding - Update branding settings
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Branding settings is a single document, so we update the first one or create it
    let branding = await BrandingSettings.findOne();
    
    if (branding) {
      branding = await BrandingSettings.findOneAndUpdate(
        {},
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      branding = new BrandingSettings({
        headerLogo: body.headerLogo || "/logo.png",
        dashboardLogo: body.dashboardLogo || "/logo.png",
        favicon: body.favicon || "/images/fav-icon/icon.png",
        navLinks: body.navLinks || [],
      });
      await branding.save();
    }
    
    return successResponse(branding);
  } catch (error) {
    return handleApiError(error);
  }
}
