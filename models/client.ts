import mongoose, { Schema } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    order: { type: Number, default: 1 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.Client ||
  mongoose.model("Client", ClientSchema);
