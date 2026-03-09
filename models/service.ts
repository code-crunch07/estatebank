import mongoose, { Schema } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, required: true },
    iconLibrary: { type: String, default: "lucide" },
    order: { type: Number, default: 1 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);
