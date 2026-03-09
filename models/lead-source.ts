import mongoose, { Schema } from "mongoose";

const LeadSourceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    leads: { type: Number, default: 0 }, // Count of leads from this source
  },
  { timestamps: true }
);

export default mongoose.models.LeadSource ||
  mongoose.model("LeadSource", LeadSourceSchema);

