import mongoose, { Schema, Types } from "mongoose";

const LeadSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    source: { type: String, default: "Website" }, // Website, Referral, Social Media, etc.
    status: { 
      type: String, 
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New" 
    },
    propertyInterest: { type: String },
    assignedTo: { type: Types.ObjectId, ref: "TeamMember" },
    assignedToName: { type: String }, // Denormalized for easier querying
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Lead ||
  mongoose.model("Lead", LeadSchema);
