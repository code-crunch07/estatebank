import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await connectToDatabase();
    const connectionTime = Date.now() - startTime;
    
    // Test a simple query
    const queryStartTime = Date.now();
    const count = await Property.countDocuments();
    const queryTime = Date.now() - queryStartTime;
    
    return NextResponse.json({
      status: "healthy",
      database: {
        connected: true,
        connectionTime: `${connectionTime}ms`,
        queryTime: `${queryTime}ms`,
        propertyCount: count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          connected: false,
          error: error.message || "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

