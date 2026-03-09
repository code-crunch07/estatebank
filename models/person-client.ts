import mongoose, { Schema, Types } from "mongoose";

const PersonClientSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    notes: { type: String },
    properties: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"],
      default: "Active" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.PersonClient ||
  mongoose.model("PersonClient", PersonClientSchema);
