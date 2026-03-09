import mongoose, { Schema, Types } from "mongoose";

const HeroImageSchema = new Schema(
  {
    type: { type: String, enum: ["property", "banner"], default: "property" },
    propertyId: { type: Types.ObjectId, ref: "Property" },
    image: { type: String },
    linkUrl: { type: String },
    title: { type: String },
    description: { type: String },
    buttonText: { type: String },
    order: { type: Number, default: 1 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.HeroImage ||
  mongoose.model("HeroImage", HeroImageSchema);
