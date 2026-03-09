import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Contact from "@/models/contact";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/contacts - Get all contacts
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    
    let query: any = {};
    
    if (type) {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    
    return successResponse(contacts);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/contacts - Create a new contact or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if this is a bulk import (array of contacts)
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

          const contact = new Contact({
            name: item.name,
            email: item.email,
            phone: item.phone,
            company: item.company || "",
            type: item.type || "",
          });

          const savedContact = await contact.save();
          results.success.push(savedContact);
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
    
    // Single contact creation
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    const contact = new Contact({
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company || "",
      type: body.type || "",
    });
    
    const savedContact = await contact.save();
    
    return successResponse(savedContact, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

