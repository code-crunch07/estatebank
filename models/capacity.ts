import mongoose, { Schema } from "mongoose";

const CapacitySchema = new Schema(
  {
    name: { type: String, required: true },
    bedrooms: { type: Number, required: true, default: 0 },
    bathrooms: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Capacity ||
  mongoose.model("Capacity", CapacitySchema);

