import mongoose, { Schema } from "mongoose";

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    property: { type: String },
    message: { type: String },
    status: { 
      type: String, 
      enum: ["New", "Contacted", "Resolved", "Pending", "Reviewed", "Approved", "Rejected"],
      default: "New" 
    },
    // Property submission details (for client property submissions)
    iAm: { type: String },
    iWantTo: { type: String },
    propertyType: { type: String },
    propertySubType: { type: String },
    bedrooms: { type: String },
    bathrooms: { type: String },
    expectedPrice: { type: String },
    saleableArea: { type: String },
    rent: { type: String },
    deposit: { type: String },
    buildingName: { type: String },
    images: [{ type: String }],
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

if (mongoose.models.Enquiry) {
  delete mongoose.models.Enquiry;
}

export default mongoose.model("Enquiry", EnquirySchema);

