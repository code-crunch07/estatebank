import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Property from "@/models/property";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

// POST /api/properties/submit - Submit a property from client form
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return errorResponse("Missing required fields: name, email, phone", 400);
    }

    // Build property data from client submission
    const propertyData: any = {
      name: body.buildingName || `${body.propertyType} - ${body.propertySubType || 'Property'}`,
      location: body.location || "Mumbai",
      address: body.address || body.buildingName || "",
      price: body.iWantTo === "sale" ? (body.expectedPrice || "Contact for price") : (body.rent || "Contact for rent"),
      bedrooms: parseInt(body.bedrooms) || 0,
      bathrooms: parseInt(body.bathrooms) || 0,
      area: body.saleableArea || "",
      type: body.iWantTo === "sale" ? "Buy" : "Rent",
      status: ["Pending Review"], // Mark as pending for admin review
      segment: body.propertyType === "Commercial" ? "commercial" : "residential",
      description: body.message || `Property submission: ${body.iWantTo} ${body.propertyType}`,
      images: body.images || [],
      // Store client contact info
      clientName: body.name,
      ownerName: body.name, // Client is the owner
      // Additional metadata
      keyDetails: [
        body.propertyType ? `Type: ${body.propertyType}` : null,
        body.propertySubType ? `Sub Type: ${body.propertySubType}` : null,
        body.bedrooms ? `${body.bedrooms} Bedrooms` : null,
        body.bathrooms ? `${body.bathrooms} Bathrooms` : null,
        body.iWantTo === "sale" && body.expectedPrice ? `Expected Price: ${body.expectedPrice}` : null,
        body.iWantTo === "rent" && body.rent ? `Rent: ${body.rent}` : null,
        body.iWantTo === "rent" && body.deposit ? `Deposit: ${body.deposit}` : null,
      ].filter(Boolean),
    };

    // Create the property
    const property = new Property(propertyData);
    const savedProperty = await property.save();

    // Also save as enquiry for contact tracking with full submission details
    try {
      const Enquiry = (await import('@/models/enquiry')).default;
      const enquiry = new Enquiry({
        name: body.name,
        email: body.email,
        phone: body.phone,
        property: propertyData.name,
        message: body.message || `Property submission: ${body.iWantTo} ${body.propertyType}`,
        status: "Pending",
        // Store all submission details
        iAm: body.iAm,
        iWantTo: body.iWantTo,
        propertyType: body.propertyType,
        propertySubType: body.propertySubType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        expectedPrice: body.expectedPrice,
        saleableArea: body.saleableArea,
        rent: body.rent,
        deposit: body.deposit,
        buildingName: body.buildingName,
        images: body.images || [],
      });
      await enquiry.save();
    } catch (enquiryError) {
      console.error('Failed to save enquiry:', enquiryError);
      // Don't fail the request if enquiry save fails
    }

    // Send email notification
    try {
      const { sendContactFormEmail } = await import('@/lib/email');
      await sendContactFormEmail({
        name: body.name,
        email: body.email,
        phone: body.phone,
        message: body.message || `New property submission: ${propertyData.name}`,
        property: propertyData.name,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    // Send WhatsApp notification to admin
    try {
      const { sendEnquiryToWhatsApp } = await import('@/lib/whatsapp');
      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "919820590353";
      
      await sendEnquiryToWhatsApp(adminPhone, {
        name: body.name,
        email: body.email,
        phone: body.phone,
        property: propertyData.name,
        message: body.message,
        iWantTo: body.iWantTo,
        propertyType: body.propertyType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        expectedPrice: body.expectedPrice,
        rent: body.rent,
      });
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }
    
    return successResponse({
      property: savedProperty,
      message: "Property submitted successfully. It will be reviewed by our team before being published.",
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

