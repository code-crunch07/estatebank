import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import FlatOwner from "@/models/flat-owner";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/people/owners - Get all flat owners
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
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { propertyName: { $regex: search, $options: "i" } },
      ];
    }
    
    const owners = await FlatOwner.find(query).populate("property").sort({ createdAt: -1 });
    
    return successResponse(owners);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/people/owners - Create a new flat owner or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if this is a bulk import (array of owners)
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

          let propertyName = item.propertyName || "";
          if (!propertyName && item.property) {
            const property = await Property.findById(item.property);
            if (property) {
              propertyName = property.name;
            }
          }

          const owner = new FlatOwner({
            name: item.name,
            email: item.email,
            phone: item.phone,
            property: item.property || undefined,
            propertyName: propertyName,
            status: item.status || "Active",
          });

          const savedOwner = await owner.save();
          results.success.push(savedOwner);
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
    
    // Single owner creation
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    // Get property name if property is an ObjectId
    let propertyName = body.propertyName;
    if (!propertyName && body.property) {
      const property = await Property.findById(body.property);
      if (property) {
        propertyName = property.name;
      }
    }
    
    const owner = new FlatOwner({
      name: body.name,
      email: body.email,
      phone: body.phone,
      property: body.property || undefined,
      propertyName: propertyName || "",
      status: body.status || "Active",
    });
    
    const savedOwner = await owner.save();
    const populatedOwner = await FlatOwner.findById(savedOwner._id).populate("property");
    
    return successResponse(populatedOwner, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
