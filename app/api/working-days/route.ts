import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import WorkingDays from "@/models/working-days";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// GET /api/working-days - Get working days configuration
export async function GET() {
  try {
    await connectToDatabase();
    
    // Working days is a single document
    let workingDays = await WorkingDays.findOne();
    
    if (!workingDays) {
      // Create default working days
      workingDays = new WorkingDays({
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "09:00",
        endTime: "18:00",
      });
      await workingDays.save();
    }
    
    return successResponse(workingDays);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/working-days - Update working days configuration
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Working days is a single document, so we update the first one or create it
    let workingDays = await WorkingDays.findOne();
    
    if (workingDays) {
      workingDays = await WorkingDays.findOneAndUpdate(
        {},
        {
          days: body.days || workingDays.days,
          startTime: body.startTime || workingDays.startTime,
          endTime: body.endTime || workingDays.endTime,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );
    } else {
      workingDays = new WorkingDays({
        days: body.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: body.startTime || "09:00",
        endTime: body.endTime || "18:00",
      });
      await workingDays.save();
    }
    
    return successResponse(workingDays);
  } catch (error) {
    return handleApiError(error);
  }
}
