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
import { MapPin, Bed, Bath, Square, ArrowUpRight, Tag, Grid3x3, Home, Eye, MessageSquare, Share2, ChevronLeft, ChevronRight } from "lucide-react";
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
}

interface PropertyCardProps {
  property: Property;
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

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${property.name} - ${property.location} (${property.price})`;
    const whatsappUrl = `https://wa.me/919820590353?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Get property type (Residential/Commercial) or default
  const propertyWithSegment = property as Property & { segment?: "residential" | "commercial" };
  const propertyType = propertyWithSegment.segment === "commercial" ? "Commercial" : propertyWithSegment.segment === "residential" ? "Residential" : property.type || "Residential";
  
  // Format BHK configuration
  const bhkConfig = property.bedrooms ? `${property.bedrooms} BHK${property.bedrooms > 1 ? "s" : ""}` : "N/A";
  
  // Get statuses for badges (support both array and single string)
  const statuses = Array.isArray(property.status) ? property.status : (property.status ? [property.status] : ["Available"]);
  const statusColors: Record<string, string> = {
    "New Launch": "bg-orange-500",
    "NEW LAUNCH": "bg-orange-500",
    "Under Construction": "bg-orange-500",
    "UNDER CONSTRUCTION": "bg-orange-500",
    "Available": "bg-green-500",
    "AVAILABLE": "bg-green-500",
    "Completed": "bg-blue-500",
    "COMPLETED": "bg-blue-500",
    "Hot": "bg-red-500",
    "HOT": "bg-red-500",
    "Resale": "bg-purple-500",
    "RESALE": "bg-purple-500",
    "Near Possession": "bg-teal-500",
    "NEAR POSSESSION": "bg-teal-500",
    "Sold": "bg-gray-500",
    "SOLD": "bg-gray-500",
    "Reserved": "bg-yellow-500",
    "RESERVED": "bg-yellow-500",
    "Coming Soon": "bg-indigo-500",
    "COMING SOON": "bg-indigo-500",
  };

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


  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-lg bg-white border border-gray-200 shadow-lg h-full flex flex-col group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
          <Link href={getPropertyUrl(property)} className="block h-full w-full">
            <div className="relative h-full w-full">
              <Image
                src={propertyImage}
                alt={property.name}
                fill
                className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo.png";
                }}
              />
              
              {/* Dark overlay on hover */}
              <div className={`absolute inset-0 bg-black/0 transition-all duration-300 ${isHovered ? 'bg-black/20' : ''}`} />
              
              {/* Image counter - Always visible when multiple images */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-20 backdrop-blur-sm">
                  {hoveredImageIndex + 1} / {propertyImages.length}
                </div>
              )}
            </div>
          </Link>
          
          {/* Type Badge - Top Left */}
          {property.type && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                property.type.toLowerCase() === 'rent' 
                  ? 'bg-blue-500/90 text-white' 
                  : 'bg-green-500/90 text-white'
              }`}>
                {property.type.toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Action buttons overlay - Top right */}
          <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-primary backdrop-blur-sm shadow-lg transition-all"
              aria-label="Share property"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Status Tags - Bottom Left */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 max-w-[calc(100%-24px)]">
            {statuses.slice(0, 3).map((status, index) => {
              const statusBg = statusColors[status] || statusColors[status.toUpperCase()] || "bg-orange-500";
              return (
                <div 
                  key={`${status}-${index}`}
                  className={`${statusBg} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
                >
                  {status.toUpperCase()}
                </div>
              );
            })}
            {statuses.length > 3 && (
              <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                +{statuses.length - 3}
              </div>
            )}
          </div>
          
          {/* Image Navigation Arrows - Always visible when multiple images exist */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="image-nav absolute left-3 top-1/2 -translate-y-1/2 bg-white hover:bg-primary hover:text-white text-gray-900 p-3.5 rounded-full shadow-2xl transition-all z-[60] hover:scale-110 border-2 border-gray-300 hover:border-primary cursor-pointer opacity-100"
                aria-label="Previous image"
                title="Previous image"
                type="button"
                style={{ zIndex: 60 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="image-nav absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-primary hover:text-white text-gray-900 p-3.5 rounded-full shadow-2xl transition-all z-[60] hover:scale-110 border-2 border-gray-300 hover:border-primary cursor-pointer opacity-100"
                aria-label="Next image"
                title="Next image"
                type="button"
                style={{ zIndex: 60 }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <CardContent className="p-5 pb-4 flex-1 flex flex-col">
          <Link href={getPropertyUrl(property)} className="block">
            {/* Property Name - Bold, Black */}
            <h3 className="text-lg font-bold mb-0 text-gray-900 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors duration-300">
              {property.name}
            </h3>
          </Link>

          {/* Property Description - Two Liner */}
          {property.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 -mt-1">
              {property.description}
            </p>
          )}

          {/* Key Information Grid */}
          <div className="space-y-3 mb-4 flex-1">
            {/* First Row: Location | Property Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 min-w-0 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm text-gray-700 truncate">{property.location}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item">
                <Tag className="h-4 w-4 text-green-600 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm text-gray-700 truncate">{propertyType}</span>
              </div>
            </div>

            {/* Second Row: BHK Configuration | Area */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 min-w-0 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item">
                <Grid3x3 className="h-4 w-4 text-green-600 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm text-gray-700 truncate">{bhkConfig}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item">
                <Home className="h-4 w-4 text-green-600 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                <span className="text-sm text-gray-700 truncate">{property.area}</span>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="mb-4">
            <p className="text-base">
              <span className="text-gray-600">Price </span>
              <span className="font-bold text-primary">
                {formatIndianPrice(property.price)}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            {/* View Details Button - Transparent with Border */}
            <Link href={getPropertyUrl(property)} className="flex-1 min-w-0">
              <Button
                variant="outline"
                className="w-full bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary border-gray-300 text-gray-900 font-normal rounded-lg flex items-center justify-center gap-1.5 text-sm px-2 py-2 h-auto transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">View Details</span>
              </Button>
            </Link>

            {/* Connect with Expert Button - Primary Color (Logo Color) */}
            <Button
              onClick={handleWhatsApp}
              className="flex-1 min-w-0 bg-primary hover:bg-primary/90 text-primary-foreground font-normal rounded-lg flex items-center justify-center gap-1.5 text-sm px-2 py-2 h-auto transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">Connect with</span>
            </Button>
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
