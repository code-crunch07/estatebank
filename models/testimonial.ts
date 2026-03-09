import mongoose, { Schema } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String },
    company: { type: String },
    image: { type: String },
    rating: { type: Number, default: 5 },
    text: { type: String, required: true },
    status: { type: String, enum: ["Published", "Draft"], default: "Published" },
    createdAt: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model("Testimonial", TestimonialSchema);
