import { NextResponse } from "next/server";

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function errorResponse(message: string, status: number = 400, error?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(error && { details: error }),
    },
    {
      status,
      headers: corsHeaders,
    }
  );
}

export function handleApiError(error: any) {
  console.error("API Error:", error);
  
  if (error.name === "ValidationError") {
    const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
    return errorResponse("Validation Error", 400, errorMessage);
  }
  
  if (error.name === "CastError") {
    return errorResponse("Invalid ID format", 400);
  }
  
  const errorMessage = error?.message || (typeof error === 'string' ? error : "Internal Server Error");
  return errorResponse("Internal Server Error", 500, typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
}
