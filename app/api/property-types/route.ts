import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import PropertyType from "@/models/property-type";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/property-types - Get all property types
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    let limit = parseInt(searchParams.get("limit") || "20");
    let skip = parseInt(searchParams.get("skip") || "0");

    // Validate pagination
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return errorResponse("Invalid 'limit' parameter. Must be an integer between 1 and 100.", 400);
    }
    if (isNaN(skip) || skip < 0 || skip > 10000) {
      return errorResponse("Invalid 'skip' parameter. Must be a non-negative integer less than 10000.", 400);
    }

    let query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [types, total] = await Promise.all([
      PropertyType.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      PropertyType.countDocuments(query),
    ]);

    return successResponse({
      types,
      count: types.length,
      total,
      hasMore: skip + types.length < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/property-types - Create a new property type
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    if (!body.name) {
      return errorResponse("Missing required field: name", 400);
    }
    
    const propertyType = new PropertyType({
      name: body.name,
      description: body.description || "",
      image: body.image || "",
    });
    
    const savedType = await propertyType.save();
    
    return successResponse(savedType, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

