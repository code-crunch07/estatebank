import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PersonClient from "@/models/person-client";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/people/clients - Get all person clients
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [clients, total] = await Promise.all([
      PersonClient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PersonClient.countDocuments(query),
    ]);
    
    return successResponse({
      clients,
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

// POST /api/people/clients - Create a new person client or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if this is a bulk import (array of clients)
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

          const client = new PersonClient({
            name: item.name,
            email: item.email,
            phone: item.phone,
            address: item.address || "",
            notes: item.notes || item.comments || "",
            properties: item.properties ? parseInt(item.properties) : 0,
            status: item.status || "Active",
          });

          const savedClient = await client.save();
          results.success.push(savedClient);
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
    
    // Single client creation
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    const client = new PersonClient({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address || "",
      notes: body.notes || "",
      properties: body.properties || 0,
      status: body.status || "Active",
    });
    
    const savedClient = await client.save();
    
    return successResponse(savedClient, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
