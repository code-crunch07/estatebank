import mongoose, { Schema } from "mongoose";

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    role: { 
      type: String, 
      enum: ["CEO & Founder", "Sales Head", "Sales In Charge", "Sourcing Manager", "Manager", "Agent", "Admin", "Support"],
      default: "Agent" 
    },
    department: { type: String, required: false },
    location: { type: String, required: false },
    image: { type: String, required: false },
    bio: { type: String, required: false },
    socials: {
      linkedin: { type: String, required: false },
      twitter: { type: String, required: false },
      facebook: { type: String, required: false },
      instagram: { type: String, required: false },
    },
    leads: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"],
      default: "Active" 
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Clear cached model if it exists to ensure schema updates are applied
if (mongoose.models.TeamMember) {
  delete mongoose.models.TeamMember;
}

export default mongoose.model("TeamMember", TeamMemberSchema);
