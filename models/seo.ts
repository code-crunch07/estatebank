import mongoose, { Schema } from "mongoose";

const SEOSchema = new Schema(
  {
    siteTitle: { type: String, required: true, default: "EstateBANK.in - Real Estate • Investments • Trust" },
    siteDescription: { 
      type: String, 
      required: true,
      default: "Find your dream property in Powai, Mumbai. Premium apartments, villas, and flats in prime locations."
    },
    keywords: [{ type: String }],
    ogImage: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    twitterCard: { 
      type: String, 
      enum: ["summary", "summary_large_image", "app", "player"],
      default: "summary_large_image"
    },
    twitterImage: { type: String },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    robotsTxt: { type: String, default: "User-agent: *\nAllow: /" },
    googleAnalyticsId: { type: String },
    googleTagManagerId: { type: String },
    facebookPixelId: { type: String },
  },
  { timestamps: true }
);

// Note: MongoDB automatically creates a unique index on _id, so we don't need to specify it
// To ensure only one SEO settings document exists, handle this in the application logic

// Prevent Mongoose from recompiling the model if it already exists
if (mongoose.models.SEO) {
  delete mongoose.models.SEO;
}

export default mongoose.model("SEO", SEOSchema);

