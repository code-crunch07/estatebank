import mongoose, { Schema } from "mongoose";

const PropertyTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyType ||
  mongoose.model("PropertyType", PropertyTypeSchema);

