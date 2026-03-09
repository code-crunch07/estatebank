import mongoose, { Schema, Types } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    type: { 
      type: String, 
      enum: ["Call", "Email", "WhatsApp", "Meeting", "Note", "Other"],
      required: true 
    },
    lead: { type: Types.ObjectId, ref: "Lead", required: true },
    leadName: { type: String }, // Denormalized for easier querying
    agent: { type: Types.ObjectId, ref: "TeamMember" },
    agentName: { type: String }, // Denormalized for easier querying
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["Completed", "Pending", "Cancelled"],
      default: "Completed" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
