import mongoose, { Schema } from "mongoose";

const WorkingDaysSchema = new Schema(
  {
    days: [{ type: String }], // Array of day names: Monday, Tuesday, etc.
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "18:00" },
  },
  { timestamps: true }
);

// Only one document should exist
WorkingDaysSchema.index({}, { unique: true });

export default mongoose.models.WorkingDays ||
  mongoose.model("WorkingDays", WorkingDaysSchema);
