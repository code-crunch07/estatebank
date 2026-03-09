import mongoose, { Schema } from "mongoose";

const HomepageAreaSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    order: { type: Number, default: 1 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.models.HomepageArea ||
  mongoose.model("HomepageArea", HomepageAreaSchema);
