import { NextRequest } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { connectToDatabase } from '@/lib/mongoose';
import mongoose, { Schema } from 'mongoose';

// Enquiry Schema
const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    property: { type: String },
    message: { type: String },
    status: { 
      type: String, 
      enum: ["New", "Contacted", "Resolved"],
      default: "New" 
    },
  },
  { timestamps: true }
);

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, property } = body;

    // Validation
    if (!name || !email || !phone || !message) {
      return errorResponse('Missing required fields', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email address', 400);
    }

    // Save to database
    await connectToDatabase();
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      property: property || "",
      message: message || "",
      status: "New",
    });
    const savedEnquiry = await enquiry.save();

    // Send email (don't fail if email fails)
    try {
      await sendContactFormEmail({
        name,
        email,
        phone,
        message,
        property,
      });
    } catch (emailError) {
      console.error('Failed to send email, but enquiry saved:', emailError);
      // Continue even if email fails
    }

    return successResponse({ 
      message: 'Enquiry submitted successfully',
      enquiry: savedEnquiry 
    });
  } catch (error: any) {
    console.error('Error submitting enquiry:', error);
    return errorResponse(error.message || 'Failed to submit enquiry', 500);
  }
}

