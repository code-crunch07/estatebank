import mongoose, { Schema } from "mongoose";

const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    properties: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Location ||
  mongoose.model("Location", LocationSchema);
