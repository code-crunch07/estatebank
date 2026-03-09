import mongoose, { Schema, Types } from "mongoose";

const FollowUpSchema = new Schema(
  {
    lead: { type: Types.ObjectId, ref: "Lead", required: true },
    leadName: { type: String }, // Denormalized for easier querying
    type: { 
      type: String, 
      enum: ["Call", "Meeting", "Email", "WhatsApp", "Visit"],
      required: true 
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending" 
    },
    notes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp ||
  mongoose.model("FollowUp", FollowUpSchema);
