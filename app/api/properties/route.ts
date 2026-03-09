import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import mongoose from "mongoose";
import { logger } from "@/lib/logger";

// Simple in-memory cache (for development - use Redis in production)
const globalCacheKey = '__PROPERTIES_API_CACHE__';
const globalCacheTTLKey = '__PROPERTIES_API_CACHE_TTL__';
if (!globalThis[globalCacheKey]) {
  globalThis[globalCacheKey] = new Map();
}
if (!globalThis[globalCacheTTLKey]) {
  globalThis[globalCacheTTLKey] = 5000; // 5 seconds cache (reduced for faster updates in local dev)
}
const cache: Map<string, { data: any; timestamp: number; stale?: boolean }> = globalThis[globalCacheKey];
const CACHE_TTL: number = globalThis[globalCacheTTLKey];

// Function to mark cache as stale (call after mutations)
export function markPropertiesCacheStale() {
  for (const entry of cache.values()) {
    entry.stale = true;
  }
  logger.debug("[Properties API] Cache marked as stale");
}

// GET /api/properties - Get all properties
export async function GET(request: NextRequest) {
  try {
    // Generate a stable cache key from sorted searchParams
    const searchParams = request.nextUrl.searchParams;
    const paramsObj: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value;
    }
    const cacheKey = Object.keys(paramsObj)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(paramsObj[k])}`)
      .join('&');
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && !cached.stale) {
      logger.debug("[Properties API] Cache hit");
      return NextResponse.json({ success: true, data: cached.data, cached: true });
    }
    
    // Quick connection check - if already connected, use it
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    let isConnected = false;
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
      isConnected = true;
    } else {
      // Connect to database (with built-in timeout from mongoose config)
      // Single attempt with shorter timeout for faster failure
      try {
        await connectToDatabase();
        
        // Check if connection is actually ready (1 = connected)
        if (mongoose.connection.readyState === 1) {
          isConnected = true;
        } else {
          throw new Error(`Database connection state: ${mongoose.connection.readyState} (expected 1 = connected)`);
        }
      } catch (dbError: any) {
        console.error(`[Properties API] Database connection failed:`, dbError.message);
        
        // Return cached data if available (even if stale)
        if (cached) {
          logger.debug("[Properties API] Returning stale cached data due to connection failure");
          return NextResponse.json({ success: true, data: cached.data, cached: true, stale: true });
        }
        
        const errorMessage = dbError.message || "Database connection failed";
        
        // Provide helpful error message
        if (errorMessage.includes("timed out") || errorMessage.includes("timeout")) {
          return errorResponse(
            "MongoDB connection timeout. Your MongoDB Atlas cluster may be paused. Please:\n" +
            "1. Log in to MongoDB Atlas and resume your cluster if it's paused\n" +
            "2. Check your IP address is whitelisted in Network Access\n" +
            "3. Verify your connection string in .env.local\n" +
            "4. Check your internet connection\n" +
            `Error: ${errorMessage}`,
            503
          );
        }
        
        return errorResponse(
          `Database connection failed: ${errorMessage}. Please check your MongoDB connection string in .env.local`,
          503
        );
      }
    }
    
    // ...existing code...
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    const segment = searchParams.get("segment"); // Filter by segment (residential/commercial)
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const lightweight = searchParams.get("lightweight") === "true"; // For list views, exclude large fields
    // Default to 50 for better performance, allow up to 1000
    let limit = parseInt(searchParams.get("limit") || "50");
    let skip = parseInt(searchParams.get("skip") || "0");

    // Validate pagination values
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return errorResponse("Invalid 'limit' parameter. Must be an integer between 1 and 1000.", 400);
    }
    if (isNaN(skip) || skip < 0 || skip > 100000) {
      return errorResponse("Invalid 'skip' parameter. Must be a non-negative integer less than 100000.", 400);
    }
    
    let query: any = {};
    
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (type) {
      query.type = type;
    }
    if (segment) {
      query.segment = segment.toLowerCase();
    }
    if (status) {
      // Decode URL-encoded status (e.g., "Under%20Construction" -> "Under Construction")
      const decodedStatus = decodeURIComponent(status);
      // Support filtering by status - properties can have multiple statuses (array)
      // So we need to check if the requested status exists in the property's status array
      query.status = { $in: Array.isArray(decodedStatus) ? decodedStatus : [decodedStatus] };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      // Note: Price is stored as string, so this is a basic filter
      // You may need to parse and convert to number for proper filtering
    }
    
    // Build field selection - exclude large fields for lightweight requests
    let selectFields = '-__v'; // Always exclude version key
    
    if (lightweight) {
      // For list views, exclude large fields that aren't needed
      // featuredImage is NOT excluded, so it will be included automatically
      selectFields += ' -images -floorPlans -description -keyDetails -amenities -transport -videoTour -videoLink';
      // Note: Cannot mix inclusion (+) and exclusion (-) in MongoDB projection
      // Since featuredImage is not in the exclusion list, it will be included by default
    }
    
    if (!isConnected) {
      // If we somehow got here without connection, return cached or error
      if (cached) {
        return NextResponse.json({ success: true, data: cached.data, cached: true, stale: true });
      }
      return errorResponse("Database not connected", 503);
    }
    
    // Optimize query: Use lean() for faster queries, limit results, and select only needed fields
    const queryBuilder = Property.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 1000)) // Cap at 1000 to prevent abuse
      .lean() // Use lean() for better performance (returns plain JS objects)
      .maxTimeMS(5000); // 5 second query timeout (reduced for faster failure)

    let properties: any[];
    try {
      properties = await queryBuilder.exec();
      logger.debug(`[Properties API] Found ${properties.length} properties`);
    } catch (queryError: any) {
      console.error("[Properties API] Query failed:", queryError);

      // Return cached data if available
      if (cached) {
        logger.debug("[Properties API] Returning stale cached data due to query failure");
        return NextResponse.json({ success: true, data: cached.data, cached: true, stale: true });
      }

      // Return empty array for better UX
      properties = [];
    }
    
    // Get total count for pagination (only if needed)
    const totalCount = lightweight ? undefined : await Property.countDocuments(query);
    
    const response: any = {
      properties,
      count: properties.length,
    };
    
    if (totalCount !== undefined) {
      response.total = totalCount;
      response.hasMore = skip + properties.length < totalCount;
    }
    
    // Response prepared successfully
    
    // Cache the response
    const responseData = lightweight ? properties : response;
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    // Clean old or stale cache entries (keep cache size manageable)
    if (cache.size > 10) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL || value.stale) {
          cache.delete(key);
        }
      }
    }
    
    return successResponse(responseData);
  } catch (error) {
    console.error("[Properties API] Error:", error);
    
    // Try to return cached data if available (even if expired)
    // Use the same stable cache key logic for error fallback
    const searchParams = request.nextUrl.searchParams;
    const paramsObj: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      paramsObj[key] = value;
    }
    const cacheKey = Object.keys(paramsObj)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(paramsObj[k])}`)
      .join('&');
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug("[Properties API] Returning stale cached data due to error");
      return NextResponse.json({ success: true, data: cached.data, cached: true, stale: true });
    }
    
    return handleApiError(error);
  }
}

// POST /api/properties - Create a new property or bulk import
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    // Full request body logging removed for security - log only summary
    const isBulkImport = Array.isArray(body);
    const requestSummary = isBulkImport 
      ? `Bulk import: ${body.length} properties`
      : `Single property: ${body.name || 'unnamed'}`;
    logger.debug("[Properties API POST]", requestSummary);
    
    // Check if this is a bulk import (array of properties)
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return errorResponse("Empty array provided", 400);
      }

      const results = {
        success: [] as any[],
        failed: [] as any[],
      };

      // Process each property
      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        try {
          // Validate required fields
          if (!item.name || !item.location || !item.price || !item.bedrooms || !item.bathrooms) {
            results.failed.push({
              index: i,
              data: item,
              error: "Missing required fields: name, location, price, bedrooms, bathrooms",
            });
            continue;
          }

          const property = new Property({
            name: item.name,
            location: item.location,
            address: item.address || "",
            price: item.price,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            area: item.area || "",
            projectArea: item.projectArea || "",
            rating: item.rating || 4.5,
            type: item.type || "",
            status: Array.isArray(item.status) && item.status.length > 0 
              ? item.status 
              : (item.status ? (Array.isArray(item.status) ? item.status : [item.status]) : ["Available"]),
            capacity: item.capacity || "",
            capacities: Array.isArray(item.capacities) && item.capacities.length > 0 ? item.capacities : [],
            occupancyType: item.occupancyType || "",
            commencementDate: item.commencementDate || "",
            dateAvailableFrom: item.dateAvailableFrom || "",
            description: item.description || "",
            keyDetails: item.keyDetails || [],
            amenities: item.amenities || [],
            featuredImage: item.featuredImage || "",
            images: item.images || [],
            floorPlans: item.floorPlans || [],
            videoTour: item.videoTour || "",
            transport: item.transport || [],
            nearby: item.nearby || [],
            sequence: item.sequence || "",
            landmark: item.landmark || "",
            priceNote: item.priceNote || "",
            videoLink: item.videoLink || "",
            clientName: item.clientName || "",
            broker: item.broker || "",
            ownerName: item.ownerName || "",
            metaTitle: item.metaTitle || "",
            metaKeywords: item.metaKeywords || "",
            metaDescription: item.metaDescription || "",
            segment: item.segment || "",
            rent: item.rent || "",
            deposit: item.deposit || "",
            carpetArea: item.carpetArea || "",
            overview: item.overview || "",
            keyHighlights: item.keyHighlights || "",
          });

          const savedProperty = await property.save();
          results.success.push(savedProperty);
        } catch (error: any) {
          results.failed.push({
            index: i,
            data: item,
            error: error.message || "Unknown error",
          });
        }
      }

      // Clear cache after bulk import
      markPropertiesCacheStale();
      
      return successResponse({
        message: `Bulk import completed: ${results.success.length} succeeded, ${results.failed.length} failed`,
        successCount: results.success.length,
        failedCount: results.failed.length,
        total: body.length,
        failed: results.failed,
      }, 201);
    }
    
    // Single property creation
    // Validate required fields
    if (!body.name || !body.location || !body.price || !body.bedrooms || !body.bathrooms) {
      return errorResponse("Missing required fields: name, location, price, bedrooms, bathrooms", 400);
    }
    
    const property = new Property({
      name: body.name || body.title || "",
      location: body.location,
      address: body.address || "",
      price: body.price,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      area: body.area || "",
      projectArea: body.projectArea || "",
      rating: body.rating || 4.5,
      type: body.type || "",
      status: Array.isArray(body.status) && body.status.length > 0 
        ? body.status 
        : (body.status ? (Array.isArray(body.status) ? body.status : [body.status]) : ["Available"]),
      capacity: body.capacity || "",
      capacities: Array.isArray(body.capacities) && body.capacities.length > 0 ? body.capacities : [],
      occupancyType: body.occupancyType || "",
      commencementDate: body.commencementDate || "",
      dateAvailableFrom: body.dateAvailableFrom || "",
      description: body.description || body.overview || "",
      keyDetails: body.keyDetails || [],
      amenities: body.amenities || [],
      featuredImage: body.featuredImage || "",
      images: body.images || [],
      floorPlans: body.floorPlans || [],
      videoTour: body.videoTour || "",
      transport: body.transport || [],
      nearby: body.nearby || [],
      // Additional fields
      sequence: body.sequence || "",
      landmark: body.landmark || "",
      priceNote: body.priceNote || "",
      videoLink: body.videoLink || "",
      clientName: body.clientName || "",
      broker: body.broker || "",
      ownerName: body.ownerName || "",
      metaTitle: body.metaTitle || "",
      metaKeywords: body.metaKeywords || "",
      metaDescription: body.metaDescription || "",
      segment: body.segment || "",
      rent: body.rent || "",
      deposit: body.deposit || "",
      carpetArea: body.carpetArea || "",
      overview: body.overview || "",
      keyHighlights: body.keyHighlights || "",
    });
    
    const savedProperty = await property.save();
    logger.debug("[Properties API POST] Property saved successfully, ID:", savedProperty._id);
    
    // Clear cache after creating property
    markPropertiesCacheStale();
    
    return successResponse(savedProperty, 201);
  } catch (error: any) {
    console.error("[Properties API POST] Error saving property:", error);
    console.error("[Properties API POST] Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      errors: error.errors,
      stack: error.stack,
    });
    
    // If it's a Mongoose validation error, return more details
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors || {}).map(key => ({
        field: key,
        message: error.errors[key].message,
      }));
      return errorResponse(
        `Validation error: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
        400
      );
    }
    
    return handleApiError(error);
  }
}

// DELETE /api/properties - Bulk delete properties
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");
    
    // If ids parameter is provided, perform bulk delete
    if (idsParam) {
      try {
        const ids = JSON.parse(idsParam);
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return errorResponse("Invalid IDs array provided", 400);
        }
        
        // Validate all IDs are valid MongoDB ObjectIds
        const validIds = ids.filter((id: string) => {
          try {
            return mongoose.Types.ObjectId.isValid(id);
          } catch {
            return false;
          }
        });
        
        if (validIds.length === 0) {
          return errorResponse("No valid property IDs provided", 400);
        }
        
        // Delete all properties with matching IDs
        const result = await Property.deleteMany({ _id: { $in: validIds } });
        
        // Clear cache after deletion
        markPropertiesCacheStale();
        
        return successResponse({
          message: `Successfully deleted ${result.deletedCount} propert${result.deletedCount === 1 ? 'y' : 'ies'}`,
          deletedCount: result.deletedCount,
          requestedCount: ids.length,
        });
      } catch (parseError) {
        return errorResponse("Invalid IDs format. Expected JSON array.", 400);
      }
    }
    
    // If no ids parameter, return error
    return errorResponse("IDs parameter is required for bulk delete", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
