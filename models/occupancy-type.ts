import mongoose, { Schema } from "mongoose";

const OccupancyTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.OccupancyType ||
  mongoose.model("OccupancyType", OccupancyTypeSchema);

