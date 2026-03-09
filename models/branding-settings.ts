import mongoose, { Schema } from "mongoose";

const NavSubLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, default: "/" },
    order: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const NavLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, default: "/" },
    order: { type: Number, default: 1 },
    visible: { type: Boolean, default: true },
    children: [NavSubLinkSchema],
  },
  { _id: false }
);

const BrandingSettingsSchema = new Schema(
  {
    headerLogo: { type: String, default: "/logo.png" },
    dashboardLogo: { type: String, default: "/logo.png" },
    favicon: { type: String, default: "/images/fav-icon/icon.png" },
    clientFontUrl: { type: String, default: "" },
    clientFontFamily: { type: String, default: "" },
    dashboardFontUrl: { type: String, default: "" },
    dashboardFontFamily: { type: String, default: "" },
    navLinks: [NavLinkSchema],
  },
  { timestamps: true }
);

export default mongoose.models.BrandingSettings ||
  mongoose.model("BrandingSettings", BrandingSettingsSchema);
