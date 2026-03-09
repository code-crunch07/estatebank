import mongoose, { Schema, Types } from "mongoose";

const AreaSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: Types.ObjectId, ref: "Location", required: true },
    locationName: { type: String }, // Denormalized for easier querying
    properties: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Area ||
  mongoose.model("Area", AreaSchema);
