import mongoose, { Schema } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Published", "Draft"],
      default: "Draft" 
    },
    content: { type: String, required: true },
    excerpt: { type: String },
    category: { type: String },
    tags: { type: String }, // Comma-separated tags
    featuredImage: { type: String },
    images: [{ type: String }], // Array of image URLs
    metaTitle: { type: String },
    metaDescription: { type: String },
    views: { type: Number, default: 0 },
    createdAt: { type: String },
  },
  { timestamps: true }
);

// Create indexes for better query performance
BlogSchema.index({ status: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ createdAt: -1 });

// Clear cached model if it exists to ensure schema updates are applied
if (mongoose.models.Blog) {
  delete mongoose.models.Blog;
}

export default mongoose.model("Blog", BlogSchema);

