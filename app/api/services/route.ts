import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Service from "@/models/service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/services - Get all services
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    const services = await Service.find(query).sort({ order: 1 });
    
    return successResponse(services);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/services - Create a new service
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name || !body.icon) {
      return errorResponse("Missing required fields: name, icon", 400);
    }
    
    // Get current max order
    const maxOrderService = await Service.findOne().sort({ order: -1 });
    const nextOrder = maxOrderService ? maxOrderService.order + 1 : 1;
    
    const service = new Service({
      name: body.name,
      description: body.description || "",
      icon: body.icon,
      iconLibrary: body.iconLibrary || "lucide",
      order: body.order || nextOrder,
      status: body.status || "Active",
    });
    
    const savedService = await service.save();
    
    return successResponse(savedService, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
