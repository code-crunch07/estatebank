import mongoose, { Schema } from "mongoose";

const BrokerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    commission: { type: String, default: "2%" },
    properties: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"],
      default: "Active" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Broker ||
  mongoose.model("Broker", BrokerSchema);
