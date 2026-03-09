import { NextRequest } from 'next/server';
import { sendPropertyEnquiryEmail } from '@/lib/email';
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
    const { name, email, phone, message, propertyName, propertyLocation, propertyPrice } = body;

    // Validation
    if (!name || !email || !phone || !message || !propertyName) {
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
      property: propertyName || "",
      message: message || "",
      status: "New",
    });
    const savedEnquiry = await enquiry.save();

    // Send email (don't fail if email fails)
    try {
      await sendPropertyEnquiryEmail({
        name,
        email,
        phone,
        message,
        propertyName,
        propertyLocation,
        propertyPrice,
      });
    } catch (emailError) {
      console.error('Failed to send email, but enquiry saved:', emailError);
      // Continue even if email fails
    }

    // Send WhatsApp notification (don't fail if WhatsApp fails)
    try {
      const { sendEnquiryToWhatsApp } = await import('@/lib/whatsapp');
      const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || "919820590353";
      
      await sendEnquiryToWhatsApp(adminWhatsApp, {
        name,
        email,
        phone,
        property: propertyName,
        message: message || `Interested in ${propertyName}${propertyLocation ? ` in ${propertyLocation}` : ''}${propertyPrice ? ` - ${propertyPrice}` : ''}`,
        propertyLocation,
        expectedPrice: propertyPrice,
      });
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification, but enquiry saved:', whatsappError);
      // Continue even if WhatsApp fails
    }

    return successResponse({ 
      message: 'Enquiry submitted successfully',
      enquiry: savedEnquiry 
    });
  } catch (error: any) {
    console.error('Error submitting property enquiry:', error);
    return errorResponse(error.message || 'Failed to submit enquiry', 500);
  }
}

