import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Broker from "@/models/broker";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/people/brokers - Get all brokers
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
      ];
    }
    
    const brokers = await Broker.find(query).sort({ createdAt: -1 });
    
    return successResponse(brokers);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/people/brokers - Create a new broker or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Check if this is a bulk import (array of brokers)
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

          const broker = new Broker({
            name: item.name,
            email: item.email,
            phone: item.phone,
            commission: item.commission || "2%",
            properties: item.properties ? parseInt(item.properties) : 0,
            status: item.status || "Active",
          });

          const savedBroker = await broker.save();
          results.success.push(savedBroker);
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
    
    // Single broker creation
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }
    
    const broker = new Broker({
      name: body.name,
      email: body.email,
      phone: body.phone,
      commission: body.commission || "2%",
      properties: body.properties || 0,
      status: body.status || "Active",
    });
    
    const savedBroker = await broker.save();
    
    return successResponse(savedBroker, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
