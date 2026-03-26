"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { getPropertyUrl, formatIndianPrice } from "@/lib/utils";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary-client";

interface Property {
  id?: number | string;
  _id?: string;
  name: string;
  location: string;
  address?: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  rating?: number;
  type?: string;
  // status?: string;
  status?: string | string[];
  image?: string;
  images?: string[];
  featuredImage?: string; // Featured image takes priority
  description?: string;
  segment?: "residential" | "commercial";
  createdAt?: string;
  clientName?: string;
  broker?: string;
  ownerName?: string;
  projectArea?: string;
  carpetArea?: string;
  propertyType?: string;
  rent?: string;
  occupancyType?: string;
}

interface PropertyCardProps {
  property: Property;
}

/** Matches dashboard `properties/page.tsx` Badge variant mapping (default / destructive / secondary) */
function statusBadgeClass(status: string): string {
  const lower = status.trim().toLowerCase();
  if (lower === "available" || lower === "completed") {
    return "bg-primary text-primary-foreground";
  }
  if (lower === "sold") {
    return "bg-destructive text-destructive-foreground";
  }
  return "bg-secondary text-secondary-foreground";
}

function formatRelativePosted(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffSec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  const years = Math.floor(diffSec / (365.25 * 24 * 3600));
  if (years >= 1) return `${years} year${years === 1 ? "" : "s"} ago`;
  const months = Math.floor(diffSec / (30 * 24 * 3600));
  if (months >= 1) return `${months} month${months === 1 ? "" : "s"} ago`;
  const days = Math.floor(diffSec / (24 * 3600));
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diffSec / 3600);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return "Recently";
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Format BHK configuration - use capacities if available (e.g. "2BHK And 3BHK")
  const capacities = (property as any).capacities;
  const bhkConfig = Array.isArray(capacities) && capacities.length > 0
    ? capacities.join(" And ")
    : property.bedrooms
      ? `${property.bedrooms} BHK${property.bedrooms > 1 ? "s" : ""}`
      : "N/A";
  
  // Same source as dashboard: status[] from property (multi-select in add/edit form)
  const rawStatuses = Array.isArray(property.status)
    ? property.status.filter(Boolean)
    : property.status
      ? [property.status]
      : [];
  const statuses = rawStatuses.length > 0 ? rawStatuses : ["Available"];
  const occupancyLabel = ((property as any).occupancyType as string | undefined)?.trim();
  const yearTag = (property as any).commencementDate || (property as any).dateAvailableFrom || null;
  const yearDisplay = yearTag ? (yearTag.match(/\d{4}/)?.[0] || yearTag) : null;

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    // Simulate OTP sending (replace with actual API call)
    setTimeout(() => {
      toast.success("OTP sent to your mobile number");
      setOtpSent(true);
      setIsLoading(false);
      // In production, generate and store OTP on backend
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification (replace with actual API call)
    setTimeout(() => {
      toast.success("OTP verified successfully");
      setOtpVerified(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleBookNow = async () => {
    if (!name || !email || !mobile) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!otpVerified) {
      toast.error("Please verify OTP first");
      return;
    }

    setIsLoading(true);
    // Simulate booking submission (replace with actual API call)
    setTimeout(() => {
      toast.success("Booking request submitted successfully!");
      setIsEnquiryOpen(false);
      // Reset form
      setName("");
      setEmail("");
      setMobile("");
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleEnquireNow = () => {
    setIsEnquiryOpen(true);
  };


  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + getPropertyUrl(property);
    
    // Get the property image for sharing
    const propertyImages = getPropertyImages();
    const imageUrl = propertyImages.length > 0 ? propertyImages[0] : "/logo.png";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.name,
          text: `${property.name} - ${property.location} - ${property.price}`,
          url: url,
        });
      } catch (err: any) {
        // AbortError is thrown when user cancels the share dialog - this is expected behavior
        if (err.name !== 'AbortError') {
          console.log("Error sharing:", err);
          // Fallback to clipboard
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard! Share link will show property image when pasted on social media.");
    }
  };

  // Get images with priority: featuredImage > images[0] > image > fallback
  // Build image array with featuredImage first if it exists
  const getPropertyImages = () => {
    const images: string[] = [];
    
    // Priority 1: Featured image (if exists)
    if ((property as any).featuredImage) {
      images.push((property as any).featuredImage);
    }
    
    // Priority 2: Images array
    if (property.images && property.images.length > 0) {
      // Add images array, but skip if featuredImage is already in it
      property.images.forEach(img => {
        if (!images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Priority 3: Single image property
    if (property.image && !images.includes(property.image)) {
      images.push(property.image);
    }
    
    // Priority 4: Fallback to logo if no images
    if (images.length === 0) {
      images.push("/logo.png");
    }
    
    return images;
  };
  
  const propertyImages = getPropertyImages();
  
  // Helper function to optimize Cloudinary URLs for property cards
  const optimizePropertyImage = (url: string) => {
    if (!url || url.startsWith('/') || url.startsWith('data:')) {
      return url; // Return as-is for local/relative/base64 images
    }
    if (isCloudinaryUrl(url)) {
      return getOptimizedUrl(url, {
        width: 600,
        height: 400,
        quality: 80,
        format: 'auto',
        crop: 'fill',
      });
    }
    return url; // Return as-is for non-Cloudinary URLs
  };
  
  const rawPropertyImage = propertyImages[hoveredImageIndex] || propertyImages[0];
  const propertyImage = optimizePropertyImage(rawPropertyImage);
  const hasMultipleImages = propertyImages.length > 1;
  const displayAddress = property.address || property.location;

  const postedLabel =
    formatRelativePosted((property as any).createdAt) ||
    (yearDisplay ? String(yearDisplay) : null);
  const authorName =
    (property as any).clientName ||
    (property as any).broker ||
    (property as any).ownerName ||
    "EstateBANK.in";
  const categoryParts = [
    (property as any).propertyType,
    property.type,
    property.segment,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim().toUpperCase());
  const categoryLine = [...new Set(categoryParts)].join(", ") || "PROPERTY";
  const isRent =
    !!(property as any).rent ||
    (typeof property.price === "string" && property.price.includes("/month"));
  const sqftLabel =
    (property as any).carpetArea ||
    (property as any).projectArea ||
    property.area ||
    "—";
  const parkingOrExtra =
    (property as any).parking != null && String((property as any).parking).trim() !== ""
      ? String((property as any).parking)
      : (property as any).garage != null && String((property as any).garage).trim() !== ""
        ? String((property as any).garage)
        : null;
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };


  const sqftDisplay =
    sqftLabel === "—"
      ? "—"
      : /sq\.?\s*ft|ft²|sqft|sq\.ft/i.test(String(sqftLabel))
        ? String(sqftLabel)
        : `${sqftLabel} SqFt`;
  const fourthSpec =
    parkingOrExtra != null
      ? `${parkingOrExtra} ${/^\d+$/.test(String(parkingOrExtra).trim()) ? "Garage" : ""}`.trim()
      : String((property as any).propertyType || property.type || "—");

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-none bg-card border border-border shadow-md h-full flex flex-col group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="p-4">
          <div className="relative h-60 w-full overflow-hidden bg-muted">
          <Link href={getPropertyUrl(property)} className="block h-full w-full">
            <div className="relative h-full w-full">
              <Image
                src={propertyImage}
                alt={property.name}
                fill
                className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo.png";
                }}
              />

              <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-90"}`} />

              {hasMultipleImages && (
                <div className="absolute top-3 right-3 z-20 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {hoveredImageIndex + 1} / {propertyImages.length}
                </div>
              )}
            </div>
          </Link>

          {/* Status badges — same labels & semantics as dashboard property list */}
          <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-1">
            {statuses.slice(0, 2).map((status, idx) => (
              <span
                key={`${status}-${idx}`}
                className={`inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-md sm:text-[11px] ${statusBadgeClass(status)}`}
                title={status}
              >
                {status}
              </span>
            ))}
            {statuses.length > 2 && (
              <span
                className="inline-flex items-center rounded-full border border-white/35 bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-[11px]"
                title={statuses.slice(2).join(", ")}
              >
                +{statuses.length - 2}
              </span>
            )}
            {occupancyLabel ? (
              <span
                className="inline-flex max-w-full items-center truncate rounded-full border border-white/40 bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:text-[11px]"
                title={occupancyLabel}
              >
                {occupancyLabel}
              </span>
            ) : null}
          </div>

          <div
            className={`absolute right-3 top-12 z-10 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
          >
            <button
              onClick={handleShare}
              className="rounded-full bg-white/95 p-2 text-foreground shadow-md transition hover:bg-white hover:text-primary"
              aria-label="Share property"
              type="button"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom meta: posted + author */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-2 bg-black/45 px-3 py-2.5 text-[11px] text-white backdrop-blur-[2px] sm:text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-90" />
              <span className="truncate font-medium">
                {postedLabel || (yearDisplay ? `Since ${yearDisplay}` : "Listed")}
              </span>
            </div>
            <div className="flex min-w-0 max-w-[55%] items-center justify-end gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0 opacity-90" />
              <span className="truncate text-right font-medium">{authorName}</span>
            </div>
          </div>

          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="image-nav absolute left-2 top-1/2 z-[60] -translate-y-1/2 rounded-full border border-white/30 bg-white/90 p-2 text-foreground shadow-md transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Previous image"
                title="Previous image"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="image-nav absolute right-2 top-1/2 z-[60] -translate-y-1/2 rounded-full border border-white/30 bg-white/90 p-2 text-foreground shadow-md transition hover:bg-primary hover:text-primary-foreground"
                aria-label="Next image"
                title="Next image"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-4 pb-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary line-clamp-2">
            {categoryLine}
          </p>

          <Link href={getPropertyUrl(property)} className="block min-h-[2.75rem]">
            <h3 className="text-base font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary md:text-lg">
              {property.name}
            </h3>
          </Link>

          {displayAddress && (
            <p className="text-sm text-muted-foreground line-clamp-2">{displayAddress}</p>
          )}

          {property.location && property.location !== displayAddress && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{property.location}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border pt-3 text-sm">
            <div className="flex items-start gap-2">
              <Maximize2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{sqftDisplay}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Bed className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                {Array.isArray(capacities) && capacities.length > 0 ? (
                  <span className="font-semibold leading-snug text-foreground line-clamp-2">
                    {bhkConfig}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{property.bedrooms}</span>{" "}
                    Bedrooms
                  </>
                )}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Bath className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{property.bathrooms}</span>{" "}
                Bathrooms
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Car className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-2 text-muted-foreground">
                <span className="font-semibold text-foreground">{fourthSpec}</span>
              </span>
            </div>
          </div>

          {/* Price strip (website-style): primary left + dark right, diagonal separator */}
          <div className="-mx-4 mt-auto flex min-h-[52px] w-[calc(100%+2rem)] overflow-hidden border-t border-border">
            <Link
              href={getPropertyUrl(property)}
              className="relative z-10 flex min-h-[52px] min-w-[38%] max-w-[46%] shrink-0 items-center justify-center bg-primary px-3 py-2 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.14em] text-primary-foreground sm:text-[11px]"
              style={{
                clipPath: "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
              }}
              aria-label="View property details"
            >
              {isRent ? "FOR RENT" : "VIEW DETAILS"}
            </Link>
            <div className="relative flex min-h-[52px] flex-1 items-center justify-end bg-zinc-900 px-3 py-2 pl-10 text-right text-xs font-bold text-white sm:text-sm -ml-4 before:absolute before:left-0 before:top-0 before:h-full before:w-6 before:bg-zinc-900">
              <span className="line-clamp-2">{formatIndianPrice(property.price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Form</DialogTitle>
            <DialogDescription>
              Fill in your details to enquire about this property
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="property-name">Property Name</Label>
              <Input
                id="property-name"
                value={property.name}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setMobile(value);
                    if (value.length !== 10) {
                      setOtpSent(false);
                      setOtpVerified(false);
                    }
                  }}
                  maxLength={10}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={mobile.length !== 10 || otpSent || isLoading}
                >
                  {otpSent ? "Resend OTP" : "Send OTP"}
                </Button>
              </div>
            </div>
            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP *</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(value);
                    }}
                    maxLength={6}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || otpVerified || isLoading}
                  >
                    {otpVerified ? "Verified" : "Verify OTP"}
                  </Button>
                </div>
                {otpVerified && (
                  <p className="text-xs text-green-600">✓ OTP verified successfully</p>
                )}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsEnquiryOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleBookNow}
                disabled={!otpVerified || isLoading}
              >
                {isLoading ? "Processing..." : "Book Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
