import mongoose, { Schema, Types } from "mongoose";

const FlatOwnerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    property: { type: Types.ObjectId, ref: "Property" },
    propertyName: { type: String }, // Denormalized for easier querying
    status: { 
      type: String, 
      enum: ["Active", "Inactive"],
      default: "Active" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.FlatOwner ||
  mongoose.model("FlatOwner", FlatOwnerSchema);
