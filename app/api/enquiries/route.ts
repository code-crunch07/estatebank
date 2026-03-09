import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { sendEnquiryToWhatsApp } from "@/lib/whatsapp";
import mongoose, { Schema } from "mongoose";

// Define Enquiry schema inline (or create a separate model file)
const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    property: { type: String },
    message: { type: String },
    status: { 
      type: String, 
      enum: ["New", "Contacted", "Resolved"],
      default: "New" 
    },
  },
  { timestamps: true }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);

// GET /api/enquiries - Get all enquiries
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Enquiry.countDocuments(query),
    ]);
    
    return successResponse({
      enquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/enquiries - Create a new enquiry or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if this is a bulk import (array of enquiries)
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return errorResponse("Empty array provided", 400);
      }

      const results = {
        success: [] as any[],
        failed: [] as any[],
      };

      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        try {
          if (!item.name || !item.email || !item.phone) {
            results.failed.push({
              index: i,
              data: item,
              error: "Missing required fields: name, email, phone",
            });
            continue;
          }

          const enquiry = new Enquiry({
            name: item.name,
            email: item.email,
            phone: item.phone,
            property: item.property || "",
            message: item.message || "",
            status: item.status || "New",
            // Optional property submission fields
            iAm: item.iAm,
            iWantTo: item.iWantTo,
            propertyType: item.propertyType,
            propertySubType: item.propertySubType,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            expectedPrice: item.expectedPrice,
            saleableArea: item.saleableArea,
            rent: item.rent,
            deposit: item.deposit,
            buildingName: item.buildingName,
            images: item.images || [],
          });

          const savedEnquiry = await enquiry.save();
          results.success.push(savedEnquiry);
        } catch (error: any) {
          results.failed.push({
            index: i,
            data: item,
            error: error.message || "Unknown error",
          });
        }
      }

      return successResponse({
        message: `Bulk import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
        successCount: results.success.length,
        failedCount: results.failed.length,
        total: body.length,
        failed: results.failed,
      }, 201);
    }
    
    // Single enquiry creation
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    const enquiry = new Enquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      property: body.property || "",
      message: body.message || "",
      status: body.status || "New",
      // Optional property submission fields
      iAm: body.iAm,
      iWantTo: body.iWantTo,
      propertyType: body.propertyType,
      propertySubType: body.propertySubType,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      expectedPrice: body.expectedPrice,
      saleableArea: body.saleableArea,
      rent: body.rent,
      deposit: body.deposit,
      buildingName: body.buildingName,
      images: body.images || [],
    });
    
    const savedEnquiry = await enquiry.save();
    

    // Send email notification (only for single enquiries, not bulk)
    try {
      const { sendContactFormEmail } = await import('@/lib/email');
      await sendContactFormEmail({
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message || '',
        property: body.property,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send WhatsApp notification (only for single enquiries, not bulk)
    try {
      const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminWhatsApp) {
        await sendEnquiryToWhatsApp(adminWhatsApp, body);
      } else {
        console.warn('ADMIN_WHATSAPP_NUMBER not set. Skipping WhatsApp notification.');
      }
    } catch (waError) {
      console.error('Failed to send WhatsApp notification:', waError);
      // Don't fail the request if WhatsApp fails
    }
    
    return successResponse(savedEnquiry, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
