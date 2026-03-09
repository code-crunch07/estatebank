import mongoose, { Schema } from "mongoose";

const AmenityEmbeddedSchema = new Schema(
  {
    name: String,
    icon: String,
    iconLibrary: String,
    description: String,
  },
  { _id: false }
);

const TransportSchema = new Schema(
  {
    name: String,
    distance: String,
  },
  { _id: false }
);

const NearbyPlaceSchema = new Schema(
  {
    name: String,
    distance: String,
    icon: String,
  },
  { _id: false }
);

const PropertySchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String },
    price: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    area: { type: String },
    projectArea: { type: String },
    rating: { type: Number, default: 4.5 },
    type: { type: String },
    status: { type: [String], default: ["Available"] }, // Array of statuses (e.g., ["Hot", "Resale", "Near Possession"])
    capacity: { type: String }, // Single capacity ID (for backward compatibility)
    capacities: [{ type: String }], // Array of capacity IDs (e.g., ["1 BHK", "2 BHK", "3 BHK"])
    occupancyType: { type: String }, // Occupancy type (e.g., "Ready to Move", "Under Construction")
    commencementDate: { type: String },
    dateAvailableFrom: { type: String }, // For rent properties - date when property becomes available
    description: { type: String },
    keyDetails: [{ type: String }],
    amenities: [AmenityEmbeddedSchema],
    featuredImage: { type: String }, // Single featured image
    images: [{ type: String }], // Gallery images
    floorPlans: [{ type: String }], // Floor plan images
    videoTour: { type: String }, // Video URL (YouTube, Vimeo, etc.)
    transport: [TransportSchema],
    nearby: [NearbyPlaceSchema], // Nearby places (restaurants, schools, etc.)
    // Additional fields
    sequence: { type: String }, // Sequence number for ordering
    landmark: { type: String }, // Landmark near property
    priceNote: { type: String }, // Note about price
    videoLink: { type: String }, // Additional video link (different from videoTour)
    clientName: { type: String }, // Client name
    broker: { type: String }, // Broker name
    ownerName: { type: String }, // Owner name
    metaTitle: { type: String }, // SEO meta title
    metaKeywords: { type: String }, // SEO meta keywords
    metaDescription: { type: String }, // SEO meta description
    segment: { type: String }, // Property segment (residential/commercial)
    rent: { type: String }, // Rent amount (for rent properties)
    deposit: { type: String }, // Deposit amount (for rent properties)
    carpetArea: { type: String }, // Carpet area (for buy properties)
    overview: { type: String }, // Property overview/description
    keyHighlights: { type: String }, // Key highlights of the property
    propertyType: { type: String }, // Property type (e.g., "Apartment", "Villa", "Flat")
  },
  { timestamps: true }
);

// Create indexes for better query performance
PropertySchema.index({ status: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ location: 1 });
PropertySchema.index({ createdAt: -1 });
PropertySchema.index({ segment: 1 }); // Index for segment filtering
PropertySchema.index({ name: 1 }); // Index for name searches
// Compound indexes for common query patterns
PropertySchema.index({ segment: 1, status: 1 });
PropertySchema.index({ location: 1, type: 1 });
PropertySchema.index({ segment: 1, type: 1, status: 1 });

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
