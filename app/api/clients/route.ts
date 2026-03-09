import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Client from "@/models/client";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const clients = await Client.find(query).sort({ order: 1 });
    
    return successResponse(clients);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.logo) {
      return errorResponse("Missing required fields: name, logo", 400);
    }
    
    // Get current max order
    const maxOrderClient = await Client.findOne().sort({ order: -1 });
    const nextOrder = maxOrderClient ? maxOrderClient.order + 1 : 1;
    
    const client = new Client({
      name: body.name,
      logo: body.logo,
      order: body.order || nextOrder,
      status: body.status || "Active",
    });
    
    const savedClient = await client.save();
    
    return successResponse(savedClient, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
