import mongoose, { Schema } from "mongoose";

const AmenitySchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    iconLibrary: { type: String, required: true },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.Amenity ||
  mongoose.model("Amenity", AmenitySchema);
