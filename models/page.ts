import mongoose, { Schema } from "mongoose";

const PageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: String, required: true },
    excerpt: { type: String },
    status: { 
      type: String, 
      enum: ["Published", "Draft"],
      default: "Draft" 
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    featuredImage: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster queries
// Note: slug already has a unique index from the unique: true option in the field definition above
PageSchema.index({ status: 1 });

// Prevent Mongoose from recompiling the model if it already exists
if (mongoose.models.Page) {
  delete mongoose.models.Page;
}

export default mongoose.model("Page", PageSchema);

