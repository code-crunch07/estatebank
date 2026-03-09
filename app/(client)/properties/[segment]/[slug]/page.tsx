"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Share2,
  MapPin,
  CheckCircle2,
  X,
  Bed,
  Bath,
  Square,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Bookmark,
  Download,
  Printer,
  ChefHat,
  Star,
  Clock,
  Calendar,
  TrendingUp,
  Shield,
  Award,
  Home,
  UtensilsCrossed,
  GraduationCap,
  ShoppingBag,
  Car,
  Plane,
  Monitor,
  Phone,
  Mail,
  Maximize2,
  Play,
  ZoomIn,
  ExternalLink,
  Info,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { DataStore, Property } from "@/lib/data-store";
import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { getPropertyUrl, generateSlug, formatIndianPrice } from "@/lib/utils";
import { PropertyMetaTags } from "@/components/property-meta-tags";
import { PropertyDetailSkeleton } from "@/components/skeletons/property-detail-skeleton";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary-client";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const segment = params.segment as string;
  const slug = params.slug as string;
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This is required by React's Rules of Hooks
  
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState(`${segment}-${slug}`);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Force re-render when params change - reset everything
  useEffect(() => {
    if (segment && slug) {
      const newKey = `${segment}-${slug}`;
      if (newKey !== pageKey) {
        setPageKey(newKey);
        setProperty(null);
        setError(null);
        setIsLoading(true);
        setSelectedImageIndex(0);
      }
    }
  }, [segment, slug, pageKey]);
  
  const [loanCalculator, setLoanCalculator] = useState({
    totalAmount: "",
    interestRate: "",
    loanTerm: "",
    downPayment: "",
  });
  const [loanResults, setLoanResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalLoan: 0,
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyName: "",
  });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [videoIframeError, setVideoIframeError] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capacities, setCapacities] = useState<Array<{ _id: string; name: string; bedrooms: number; bathrooms: number }>>([]);
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    description: true,
    amenities: true,
    video: false,
    videoLink: false,
    floorPlans: false,
    nearby: false,
    reviews: false,
  });
  
  // Static routes that should redirect to their actual pages
  const staticRoutes = ['under-construction', 'add'];
  const isStaticRoute = staticRoutes.includes(segment);
  
  // Redirect static routes immediately
  useEffect(() => {
    if (isStaticRoute) {
      router.replace(`/properties/${segment}`);
    }
  }, [isStaticRoute, segment, router]);


  // Note: Meta tags are handled both server-side (layout.tsx) and client-side (PropertyMetaTags)
  // This ensures maximum compatibility with all social media platforms including WhatsApp

  useEffect(() => {
    // This check is redundant now since we have early return above,
    // but keeping it as a safety net
    if (!segment || !slug) {
      console.error("Missing segment or slug:", { segment, slug });
      router.replace("/properties");
      return;
    }

    // Property lookup logging removed for production
    
    // Fetch property directly by slug and segment - much more efficient!
    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);
      
      // Use the optimized endpoint that queries only by segment (indexed) and filters by slug
      // Add timeout and cache for better performance
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        const response = await fetch(`/api/properties/slug/${slug}?segment=${segment}`, {
          signal: controller.signal,
          cache: 'force-cache', // Use browser cache
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Property not found - show error immediately instead of searching other segments
            // (This was causing slow loading - removed fallback search)
            setError(`Property not found in ${segment} segment`);
            toast.error("Property not found");
            setIsLoading(false);
            setTimeout(() => {
              router.push("/properties");
            }, 2000);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          const propertyData = data.data;
          setProperty(propertyData as Property);
          setContactForm(prev => ({ ...prev, propertyName: propertyData.name }));
          setIsLoading(false);
        } else {
          setError("Failed to load property from API");
          toast.error("Failed to load property");
          setIsLoading(false);
          setTimeout(() => {
            router.push("/properties");
          }, 2000);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setError("Request timeout - property is taking too long to load");
          toast.error("Loading timeout. Please try again.");
        } else {
          console.error("Error fetching property:", fetchError);
          setError(fetchError.message || "Failed to load property");
          toast.error("Failed to load property");
        }
        setIsLoading(false);
        setTimeout(() => {
          router.push("/properties");
        }, 2000);
      }
    };
    
    fetchProperty();

    // Load recent properties from API (non-blocking, use lightweight for list)
    // This runs after the main property loads, so it doesn't delay the page
    const fetchRecentProperties = async () => {
      try {
        // Only fetch if we have a property loaded (to avoid unnecessary calls)
        // Use lightweight mode, filter by segment, and limit to reduce data transfer
        const params = new URLSearchParams({
          lightweight: 'true',
          limit: '10',
        });
        
        // Filter by segment to show similar properties from the same segment
        if (segment) {
          params.append('segment', segment);
        }
        
        const response = await fetch(`/api/properties?${params.toString()}`);
        
        if (!response.ok) {
          console.warn(`Similar properties API returned ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        // API returns: { success: true, data: properties[] } when lightweight=true
        let propertiesData: any[] = [];
        if (data.success && data.data) {
          propertiesData = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          // Fallback: handle direct array response
          propertiesData = data;
        }
        
        if (propertiesData.length > 0) {
          // Filter out current property and filter by segment
          const filtered = propertiesData
            .filter((p: any) => {
              const propertySlug = generateSlug(p.name);
              const isDifferentProperty = propertySlug !== slug;
              // Filter by segment if available
              const isSameSegment = !segment || !p.segment || p.segment.toLowerCase() === segment.toLowerCase();
              return isDifferentProperty && isSameSegment;
            })
            .slice(0, 3);
          
          setRecentProperties(filtered as Property[]);
        }
      } catch (error) {
        console.error("Error fetching recent properties:", error);
        // Don't show error to user - this is non-critical
      }
    };
    
    // Fetch recent properties after a short delay to prioritize main property load
    setTimeout(() => {
      fetchRecentProperties();
    }, 500);
  }, [segment, slug, router]);

  // Fetch capacities to display BHK options
  useEffect(() => {
    const fetchCapacities = async () => {
      try {
        const response = await fetch('/api/capacities');
        const data = await response.json();
        if (data.success && data.data) {
          setCapacities(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching capacities:', error);
      }
    };
    fetchCapacities();
  }, []);

  // Build images array with featuredImage first if it exists, then images array
  // Memoize to prevent unnecessary re-renders and hook dependency issues
  // MUST be called before any conditional returns to follow Rules of Hooks
  const propertyImages: string[] = useMemo(() => {
    if (!property) {
      return ["/logo.png"]; // Fallback when property is not loaded yet
    }
    
    const images: string[] = [];
    
    // Priority 1: Featured image (if exists)
    if ((property as any).featuredImage) {
      images.push((property as any).featuredImage);
    }
    
    // Priority 2: Images array (skip if featuredImage is already in it)
    if (Array.isArray(property.images) && property.images.length > 0) {
      property.images.forEach((img: string) => {
        if (!images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Priority 3: Single image property (if exists and not already added)
    if ((property as any).image && !images.includes((property as any).image)) {
      images.push((property as any).image);
    }
    
    // Fallback: If no images at all, use logo
    if (images.length === 0) {
      images.push("/logo.png");
    }
    
    return images;
  }, [property]);

  // Helper function to optimize Cloudinary URLs
  // MUST be defined before conditional returns (used in useEffect and render)
  const optimizeImageUrl = (url: string, options?: { width?: number; height?: number; quality?: number | 'auto' }) => {
    if (!url || url.startsWith('/') || url.startsWith('data:')) {
      return url; // Return as-is for local/relative/base64 images
    }
    if (isCloudinaryUrl(url)) {
      return getOptimizedUrl(url, {
        width: options?.width,
        height: options?.height,
        quality: options?.quality || 'auto',
        format: 'auto',
        crop: 'fill',
      });
    }
    return url; // Return as-is for non-Cloudinary URLs
  };

  // Preload next and previous images for faster switching
  // MUST be declared BEFORE conditional returns (Rules of Hooks)
  useEffect(() => {
    // Only preload if property is loaded and has multiple images
    if (!property || propertyImages.length <= 1) {
      return;
    }

    const preloadImages = () => {
      const nextIndex = (selectedImageIndex + 1) % propertyImages.length;
      const prevIndex = selectedImageIndex === 0 ? propertyImages.length - 1 : selectedImageIndex - 1;
      
      [nextIndex, prevIndex].forEach((idx) => {
        const imgUrl = propertyImages[idx];
        if (imgUrl && !imgUrl.startsWith('/') && !imgUrl.startsWith('data:')) {
          const optimizedUrl = optimizeImageUrl(imgUrl, { width: 1200, height: 800, quality: 'auto' });
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = optimizedUrl;
          document.head.appendChild(link);
        }
      });
    };
    
    preloadImages();
  }, [selectedImageIndex, propertyImages, property]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed bookmark" : "Bookmarked");
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper function to render amenity icon
  const renderAmenityIcon = (amenity: { name: string; icon?: string; iconLibrary?: "lucide" | "react-icons" }) => {
    if (!amenity.icon) {
      return <CheckCircle2 className="h-5 w-5" />;
    }

    if (amenity.iconLibrary === "lucide" || !amenity.iconLibrary) {
      const IconComponent = (LucideIcons as any)[amenity.icon];
      if (IconComponent) {
        return <IconComponent className="h-5 w-5" />;
      }
    } else {
      const prefix = amenity.icon.substring(0, 2);
      let IconComponent: any = null;
      
      if (prefix === "Fa") {
        IconComponent = (FaIcons as any)[amenity.icon];
      } else if (prefix === "Md") {
        IconComponent = (MdIcons as any)[amenity.icon];
      } else if (prefix === "Hi") {
        IconComponent = (HiIcons as any)[amenity.icon];
      } else if (prefix === "Io") {
        IconComponent = (IoIcons as any)[amenity.icon];
      }
      
      if (IconComponent) {
        return <IconComponent className="h-5 w-5" />;
      }
    }
    
    // Fallback to CheckCircle2 if icon not found
    return <CheckCircle2 className="h-5 w-5" />;
  };

  const handleSubmitInquiry = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/email/property-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message || `Hello, I am interested in ${property?.name || 'this property'}`,
          propertyName: property?.name || 'Property',
          propertyLocation: property?.location,
          propertyPrice: property?.price,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send enquiry');
      }

      toast.success("Inquiry submitted successfully! We'll contact you soon.");
      setContactForm({ name: "", email: "", phone: "", message: "", propertyName: property?.name || "" });
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!property) return;
    
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `${property.name} - ${property.location}\n${formatIndianPrice(property.price)}\n\n${property.description || 'Check out this amazing property!'}\n\n${shareUrl}`;
    
    if (navigator.share && property) {
      try {
        // Get the best available image
        let mainImage = "/logo.png";
        if ((property as any).featuredImage) {
          mainImage = (property as any).featuredImage;
        } else if (propertyImages.length > 0) {
          mainImage = propertyImages[0];
        } else if ((property as any).image) {
          mainImage = (property as any).image;
        }
        
        // Convert to absolute URL for sharing
        const absoluteImageUrl = mainImage.startsWith('http') 
          ? mainImage 
          : `${window.location.origin}${mainImage.startsWith('/') ? mainImage : '/' + mainImage}`;
        
        // For supported browsers, use native share (includes image on some platforms)
        const shareData: any = {
          title: property.name,
          text: `${property.name} - ${property.location} - ${formatIndianPrice(property.price)}`,
          url: shareUrl,
        };
        
        // Some platforms support files/images in share API
        if (navigator.canShare && navigator.canShare({ files: [] })) {
          // Note: File sharing requires user interaction and file object
          // For now, we'll use URL and text
        }
        
        await navigator.share(shareData);
      } catch (err: any) {
        // AbortError is thrown when user cancels the share dialog - this is expected behavior
        if (err.name !== 'AbortError') {
          console.log("Error sharing:", err);
          // Fallback to clipboard copy
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard! Preview will show when pasted.");
          } catch (clipboardErr) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success("Link copied to clipboard!");
          }
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied! Preview will appear when shared on social media.");
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const calculateLoan = () => {
    const total = parseFloat(loanCalculator.totalAmount.replace(/[^\d.]/g, ""));
    const rate = parseFloat(loanCalculator.interestRate) / 100 / 12;
    const term = parseFloat(loanCalculator.loanTerm) * 12;
    const down = parseFloat(loanCalculator.downPayment.replace(/[^\d.]/g, ""));

    if (isNaN(total) || isNaN(rate) || isNaN(term) || isNaN(down)) {
      toast.error("Please fill all fields correctly");
      return;
    }

    const loanAmount = total - down;
    const monthlyPayment = (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalLoan = monthlyPayment * term;
    const totalInterest = totalLoan - loanAmount;

    setLoanResults({
      monthlyPayment: monthlyPayment || 0,
      totalInterest: totalInterest || 0,
      totalLoan: totalLoan || 0,
    });
  };

  const handleWhatsApp = () => {
    if (!property) return;
    const message = `Hi, I'm interested in ${property.name} - ${property.location} (${property.price})`;
    const whatsappUrl = `https://wa.me/919820590353?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Don't render anything if it's a static route - just redirect
  // This check happens AFTER all hooks are called
  if (isStaticRoute) {
    return null;
  }

  if (isLoading || !property) {
    return (
      <div key={pageKey}>
        {isLoading ? (
          <PropertyDetailSkeleton />
        ) : error ? (
          <div className="min-h-[60vh] bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="h-12 w-12 mx-auto mb-4 text-red-500">
                <X className="h-12 w-12" />
              </div>
              <p className="text-lg font-semibold text-red-600 mb-2">Error Loading Property</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push("/properties")} variant="outline" className="mt-4">
                Back to Properties
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[60vh] bg-background flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground">
                <Home className="h-12 w-12" />
              </div>
              <p className="text-lg font-semibold mb-2">Property Not Found</p>
              <p className="text-sm text-muted-foreground mb-4">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/properties")} variant="outline" className="mt-4">
                Back to Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Optimize main image (large size for main display)
  // Note: optimizeImageUrl is already defined above (before conditional returns)
  // Ensure selectedImageIndex is within bounds
  const safeImageIndex = propertyImages.length > 0 
    ? Math.min(selectedImageIndex, propertyImages.length - 1)
    : 0;
  const rawMainImage = propertyImages[safeImageIndex] || propertyImages[0] || "/logo.png";
  const mainImage = optimizeImageUrl(rawMainImage, { width: 1200, height: 800, quality: 'auto' });

  const hasMultipleImages = propertyImages.length > 1;

  return (
    <div key={pageKey}>
      {/* Client-side meta tags for WhatsApp and other platforms */}
      {property && (
        <PropertyMetaTags 
          property={property} 
          baseUrl={process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://estatebank.in')}
        />
      )}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl w-full overflow-x-hidden">
          {/* Header Section: Location, Title, Price, Share */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              {/* Left Side: Location and Title */}
              <div className="flex-1">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{property.location}</span>
                  {property.address && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{property.address}</span>
                    </>
                  )}
                </div>
                
                {/* Property Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-left leading-tight mb-4">
                  {property.name}
                </h1>
                
              </div>

              {/* Right Side: Price and Share */}
              <div className="flex flex-col sm:flex-row items-start sm:items-start gap-3">
                {/* Price Section */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="px-8 py-4 bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary/95 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg hover:scale-105 h-auto"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {formatIndianPrice(property.price)}
                  </Button>
                  {/* Price Note */}
                  {(property as any).priceNote && (
                    <p className="text-xs text-muted-foreground italic px-2 text-center sm:text-left">
                      {(property as any).priceNote}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 items-start">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-[56px] w-12 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md hover:shadow-lg border-2 flex items-center justify-center"
                    title="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Image Gallery and Property Details Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
            {/* Left Column: Image Gallery with Thumbnails */}
            <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="w-full">
                {/* Main Image */}
                <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 min-h-[500px] md:min-h-[600px] group">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <Image
                    src={mainImage}
                    alt={property.name}
                    fill
                    className={`object-cover cursor-pointer transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
                    unoptimized
                    priority
                    onLoadStart={() => setImageLoading(true)}
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logo.png";
                      setImageLoading(false);
                    }}
                    onClick={() => {
                      setShowImageLightbox(true);
                      setLightboxImageIndex(selectedImageIndex);
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {hasMultipleImages && (
                    <>
                      {/* Navigation Arrows */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageLoading(true);
                          setSelectedImageIndex(
                            selectedImageIndex > 0
                              ? selectedImageIndex - 1
                              : propertyImages.length - 1
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl z-20 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageLoading(true);
                          setSelectedImageIndex(
                            selectedImageIndex < propertyImages.length - 1
                              ? selectedImageIndex + 1
                              : 0
                          );
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl z-20 hover:scale-110 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* View All Photos Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImageLightbox(true);
                          setLightboxImageIndex(selectedImageIndex);
                        }}
                        className="absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-900 px-6 py-3 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 rounded-full hover:scale-105 backdrop-blur-sm flex items-center gap-2 z-20"
                      >
                        <Maximize2 className="h-4 w-4" />
                        View All {propertyImages.length} Photos
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2.5 text-sm font-semibold rounded-full backdrop-blur-md shadow-xl border border-white/10 z-30">
                        {selectedImageIndex + 1} / {propertyImages.length}
                      </div>
                    </>
                  )}
                  
                  {/* Fullscreen Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowImageLightbox(true);
                      setLightboxImageIndex(selectedImageIndex);
                    }}
                    className="absolute bottom-20 right-4 bg-white/95 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100"
                    aria-label="Fullscreen"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                  
                  {/* Thumbnail Navigation - Overlapping at Bottom */}
                  {(propertyImages.length > 0 || (property.videoTour && property.videoTour.trim())) && (
                    <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm pt-4 pb-3 overflow-hidden">
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide justify-start md:justify-center snap-x snap-mandatory scroll-smooth pl-4 pr-4 md:pl-8 md:pr-8 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {/* Video Thumbnail (if available) - First item */}
                        {property.videoTour && property.videoTour.trim() && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVideoModal(true);
                            }}
                            className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 border-white/50 hover:border-primary/80 hover:scale-105 opacity-90 hover:opacity-100 group snap-center"
                            title="Click to play video"
                          >
                            {(() => {
                              const url = property.videoTour || "";
                              const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
                              
                              if (isYouTube) {
                                let videoId = "";
                                if (url.includes('youtu.be/')) {
                                  videoId = url.split('youtu.be/')[1]?.split('?')[0] || "";
                                } else if (url.includes('youtube.com/watch?v=')) {
                                  videoId = url.split('v=')[1]?.split('&')[0] || "";
                                } else if (url.includes('youtube.com/embed/')) {
                                  videoId = url.split('embed/')[1]?.split('?')[0] || "";
                                }
                                
                                return videoId ? (
                                  <Image
                                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                    alt="Video thumbnail"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    unoptimized
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : null;
                              }
                              
                              return null;
                            })()}
                            
                            {/* Fallback gradient if no thumbnail available */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-black" />
                            
                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                              <div className="bg-white/90 group-hover:bg-white transition-all p-2.5 rounded-full shadow-lg">
                                <Play className="h-6 w-6 md:h-7 md:w-7 text-black fill-black" />
                              </div>
                            </div>
                          </button>
                        )}
                        {/* Image Thumbnails */}
                        {propertyImages.map((img, idx) => {
                          // Optimize thumbnail images (smaller size for thumbnails)
                          const thumbnailUrl = optimizeImageUrl(img, { width: 200, height: 200, quality: 80 });
                          
                          return (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageLoading(true);
                                setSelectedImageIndex(idx);
                                // Scroll thumbnail into view with proper padding
                                const container = e.currentTarget.closest('.overflow-x-auto');
                                if (container) {
                                  const buttonRect = e.currentTarget.getBoundingClientRect();
                                  const containerRect = container.getBoundingClientRect();
                                  const scrollLeft = container.scrollLeft;
                                  const buttonLeft = e.currentTarget.offsetLeft;
                                  const buttonWidth = e.currentTarget.offsetWidth;
                                  const containerWidth = container.clientWidth;
                                  
                                  // Calculate scroll position to center the button
                                  const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
                                  
                                  container.scrollTo({
                                    left: targetScroll,
                                    behavior: 'smooth'
                                  });
                                }
                              }}
                              className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 snap-center ${
                                selectedImageIndex === idx
                                  ? "border-primary shadow-lg scale-110 ring-2 ring-primary/50 ring-offset-2 ring-offset-black/50 z-10"
                                  : "border-white/50 hover:border-primary/80 hover:scale-105 opacity-90 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={thumbnailUrl}
                                alt={`${property.name} - Image ${idx + 1}`}
                                fill
                                className="object-cover transition-opacity duration-200"
                                unoptimized
                                loading={idx < 3 ? "eager" : "lazy"}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/logo.png";
                                }}
                              />
                              {selectedImageIndex === idx && (
                                <div className="absolute inset-0 bg-primary/30 border-2 border-primary" />
                              )}
                              {/* Overlay for non-selected thumbnails */}
                              {selectedImageIndex !== idx && (
                                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Modal - Modern Centered Player */}
            {showVideoModal && property.videoTour && property.videoTour.trim() && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                  onClick={() => setShowVideoModal(false)}
                />
                
                {/* Modal Container */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                  <div className="relative w-full max-w-5xl bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    {/* Close Button - Top Right */}
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition-all duration-200 backdrop-blur-md z-50 group"
                      aria-label="Close video"
                    >
                      <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Video Title Badge */}
                    <div className="absolute top-4 left-4 z-30 bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                      Property Virtual Tour
                    </div>

                    {/* Video Player */}
                    <div className="relative w-full bg-black aspect-video overflow-hidden">
                    {(() => {
                      const url = property.videoTour || "";
                      const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                      const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);

                      if (isDirectVideo) {
                        return (
                          <video
                            src={url}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full"
                            onError={() => setVideoIframeError(true)}
                          />
                        );
                      }

                      if (isYouTube) {
                        const embedUrl = (() => {
                          let videoId = "";
                          if (url.includes('youtu.be/')) {
                            videoId = url.split('youtu.be/')[1]?.split('?')[0] || "";
                          } else if (url.includes('youtube.com/watch?v=')) {
                            videoId = url.split('v=')[1]?.split('&')[0] || "";
                          } else if (url.includes('youtube.com/embed/')) {
                            videoId = url.split('embed/')[1]?.split('?')[0] || "";
                          }
                          
                          if (!videoId) return url;
                          
                          // Use standard YouTube embed URL (fixes Error 153)
                          // Add enablejsapi=1 and origin for better compatibility
                          // Remove autoplay from modal to match collapsible section behavior
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${origin}&playsinline=1`;
                        })();

                        return (
                          <>
                            <iframe
                              key={embedUrl}
                              src={embedUrl}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              title="Property Virtual Tour"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              onError={() => setVideoIframeError(true)}
                              onLoad={() => setVideoIframeError(false)}
                            />
                            {videoIframeError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                                <div className="text-center p-6">
                                  <p className="text-white mb-4">Video failed to load. This may be due to:</p>
                                  <ul className="text-white/80 text-sm mb-4 space-y-1">
                                    <li>• Video privacy settings</li>
                                    <li>• Browser extensions blocking content</li>
                                    <li>• Network restrictions</li>
                                  </ul>
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-block px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                                  >
                                    Watch on YouTube
                                  </a>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }

                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all">Open Video</a>
                        </div>
                      );
                    })()}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Right Column: Property Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 z-20 self-start space-y-4 transition-all duration-300">
                {/* Property Details Card */}
                <Card className="rounded-2xl border-2 border-gray-200/50 shadow-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 p-6 border-b">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    {/* Property Status */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">Status</p>
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Handle both array and string status (backward compatibility)
                          const statuses: string[] = Array.isArray(property.status) 
                            ? property.status 
                            : (property.status ? [property.status] : ["Available"]);
                          return statuses.map((status, idx) => (
                            <span 
                              key={`${status}-${idx}`}
                              className="text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-full shadow-sm border border-primary/20"
                            >
                              {status}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Property Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Property Segment */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Monitor className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Segment</p>
                        </div>
                        <p className="text-base font-bold text-gray-900 capitalize">{(property as any).segment || segment || "Residential"}</p>
                      </div>

                      {/* Property Type */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Home className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</p>
                        </div>
                        <p className="text-base font-bold text-gray-900 capitalize">{property.type || "Buy"}</p>
                      </div>

                      {/* Project Area */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Square className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</p>
                        </div>
                        <p className="text-base font-bold text-gray-900">{property.area || "N/A"}</p>
                      </div>

                      {/* Commencement Date / Available From */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {property.type === "Rent" ? "Available" : "Commence"}
                          </p>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {(() => {
                            const dateStr = property.type === "Rent" 
                              ? (property as any).dateAvailableFrom 
                              : (property as any).commencementDate;
                            
                            if (!dateStr) return "N/A";
                            
                            // Handle both month format (YYYY-MM) and full date format (YYYY-MM-DD)
                            const date = dateStr.length === 7 
                              ? new Date(dateStr + '-01') // Add day for month-only format
                              : new Date(dateStr);
                            
                            return date.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short'
                            });
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-200 rounded-lg">
                            <Bed className="h-4 w-4 text-blue-700" />
                          </div>
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Bedrooms</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(() => {
                            // Get capacity names from capacities array
                            if ((property as any).capacities && Array.isArray((property as any).capacities) && (property as any).capacities.length > 0) {
                              const capacityNames = (property as any).capacities
                                .map((capId: string) => {
                                  const cap = capacities.find(c => c._id === capId);
                                  return cap ? `${cap.bedrooms} BHK` : null;
                                })
                                .filter(Boolean);
                              
                              if (capacityNames.length > 0) {
                                return capacityNames.map((name: string, idx: number) => (
                                  <span 
                                    key={`${name}-${idx}`}
                                    className="text-base font-bold text-blue-900"
                                  >
                                    {name}{idx < capacityNames.length - 1 ? ", " : ""}
                                  </span>
                                ));
                              }
                            }
                            // Fallback to single bedrooms value
                            return (
                              <span className="text-base font-bold text-blue-900">
                                {property.bedrooms} BHK
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-green-200 rounded-lg">
                            <Bath className="h-4 w-4 text-green-700" />
                          </div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Bathrooms</p>
                        </div>
                        <p className="text-base font-bold text-green-900">{property.bathrooms}</p>
                      </div>
                    </div>

                    {/* Kitchen */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-200 rounded-lg">
                          <ChefHat className="h-4 w-4 text-orange-700" />
                        </div>
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Kitchen</p>
                      </div>
                      <p className="text-base font-bold text-orange-900">01</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Two Columns: Details Left, Form Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description and Highlights Section */}
              {(property.description || (property.keyDetails && property.keyDetails.length > 0)) && (
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                  <CardHeader 
                    className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                    onClick={() => toggleSection('description')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Description & Highlights
                      </CardTitle>
                      {openSections.description ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  {openSections.description && (
                    <CardContent className="pt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                      {/* Description */}
                      {property.description && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200/50">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">About This Property</h3>
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                            {property.description}
                          </p>
                        </div>
                      )}

                      {/* Key Highlights */}
                      {property.keyDetails && property.keyDetails.length > 0 && (
                        <div className={property.description ? "pt-6 border-t border-gray-200" : ""}>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Key Highlights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {property.keyDetails.map((detail, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
                              >
                                <div className="p-1.5 bg-primary rounded-full flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-gray-700 group-hover:text-gray-900 transition-colors font-medium text-sm leading-relaxed">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                  )}
                </Card>
              )}

              {/* Amenities - Collapsible */}
              {property.amenities && property.amenities.length > 0 && (
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                  <CardHeader 
                    className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                    onClick={() => toggleSection('amenities')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Amenities & Features
                      </CardTitle>
                      {openSections.amenities ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  {openSections.amenities && (
                    <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.amenities.map((amenity, idx) => {
                        // Generate color based on index for variety
                        const colors = [
                          { bg: "from-blue-50 to-blue-100/50", border: "border-blue-200/50 hover:border-blue-400", iconBg: "bg-blue-500 group-hover:bg-blue-600", iconColor: "text-white", textColor: "text-blue-900 group-hover:text-blue-950" },
                          { bg: "from-purple-50 to-purple-100/50", border: "border-purple-200/50 hover:border-purple-400", iconBg: "bg-purple-500 group-hover:bg-purple-600", iconColor: "text-white", textColor: "text-purple-900 group-hover:text-purple-950" },
                          { bg: "from-green-50 to-green-100/50", border: "border-green-200/50 hover:border-green-400", iconBg: "bg-green-500 group-hover:bg-green-600", iconColor: "text-white", textColor: "text-green-900 group-hover:text-green-950" },
                          { bg: "from-pink-50 to-pink-100/50", border: "border-pink-200/50 hover:border-pink-400", iconBg: "bg-pink-500 group-hover:bg-pink-600", iconColor: "text-white", textColor: "text-pink-900 group-hover:text-pink-950" },
                          { bg: "from-cyan-50 to-cyan-100/50", border: "border-cyan-200/50 hover:border-cyan-400", iconBg: "bg-cyan-500 group-hover:bg-cyan-600", iconColor: "text-white", textColor: "text-cyan-900 group-hover:text-cyan-950" },
                          { bg: "from-orange-50 to-orange-100/50", border: "border-orange-200/50 hover:border-orange-400", iconBg: "bg-orange-500 group-hover:bg-orange-600", iconColor: "text-white", textColor: "text-orange-900 group-hover:text-orange-950" },
                        ];
                        const colorScheme = colors[idx % colors.length];
                        
                        return (
                          <div 
                            key={idx} 
                            className={`group flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}
                          >
                            <div className={`p-3 ${colorScheme.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110 shadow-md`}>
                              <div className={colorScheme.iconColor}>
                                {renderAmenityIcon(amenity)}
                              </div>
                            </div>
                            <span className={`text-xs font-semibold ${colorScheme.textColor} transition-colors text-center leading-tight`}>
                              {amenity.name}
                            </span>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  )}
                </Card>
              )}

              {/* Video Tour - Collapsible */}
              {property.videoTour && property.videoTour.trim() && (
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                  <CardHeader 
                    className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                    onClick={() => toggleSection('video')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary" />
                        Virtual Tour
                      </CardTitle>
                      {openSections.video ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  {openSections.video && (
                    <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl rounded-xl border-2 border-gray-200 group">
                        {(() => {
                          const url = property.videoTour || "";
                          const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                          const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);

                          if (isDirectVideo) {
                            return (
                              <video
                                src={url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full rounded-xl bg-black"
                                onError={() => setVideoIframeError(true)}
                                onLoadedMetadata={() => setVideoIframeError(false)}
                              />
                            );
                          }

                          if (isYouTube) {
                            // Show iframe for YouTube - use standard YouTube embed (fixes Error 153)
                            const embedUrl = (() => {
                              let videoId = "";
                              if (url.includes('youtu.be/')) {
                                videoId = url.split('youtu.be/')[1]?.split('?')[0] || "";
                              } else if (url.includes('youtube.com/watch?v=')) {
                                videoId = url.split('v=')[1]?.split('&')[0] || "";
                              } else if (url.includes('youtube.com/embed/')) {
                                videoId = url.split('embed/')[1]?.split('?')[0] || "";
                              }
                              
                              if (!videoId) return url;
                              
                              // Use standard YouTube embed URL with enablejsapi for better compatibility
                              return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
                            })();

                            return (
                              <>
                                <iframe
                                  src={embedUrl}
                                  className="w-full h-full rounded-xl"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  title="Property Virtual Tour"
                                  onError={() => setVideoIframeError(true)}
                                  onLoad={() => setVideoIframeError(false)}
                                />
                                {videoIframeError && (
                                  <div className="absolute inset-0 flex items-center justify-center p-6 bg-white/90 rounded-xl">
                                    <div className="text-center">
                                      <p className="mb-3 text-sm text-gray-700">Video failed to load — it may be blocked by an extension or network policy.</p>
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary text-white rounded-lg shadow">Watch on YouTube</a>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          }

                          // Generic URL (could be remote video CDN or embed-ready link)
                          // Try rendering HTML5 video if it looks like a direct media URL, otherwise render a link
                          const looksLikeMedia = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                          if (looksLikeMedia) {
                            return (
                              <video
                                src={url}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full rounded-xl bg-black"
                                onError={() => setVideoIframeError(true)}
                                onLoadedMetadata={() => setVideoIframeError(false)}
                              />
                            );
                          }

                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              <a href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary text-white rounded-lg shadow">Open Video</a>
                            </div>
                          );
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Video Link - Collapsible */}
              {(property as any).videoLink && (
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                  <CardHeader 
                    className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                    onClick={() => toggleSection('videoLink')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Play className="h-5 w-5 text-primary" />
                        Video Link
                      </CardTitle>
                      {openSections.videoLink ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  {openSections.videoLink && (
                    <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Watch the property video
                        </p>
                        <a
                          href={(property as any).videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          <Play className="h-4 w-4" />
                          Watch Video
                        </a>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Floor Plans - Collapsible */}
              {property.floorPlans && property.floorPlans.length > 0 && (
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                  <CardHeader 
                    className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                    onClick={() => toggleSection('floorPlans')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Floor Plans
                      </CardTitle>
                      {openSections.floorPlans ? (
                        <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  {openSections.floorPlans && (
                    <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.floorPlans.map((plan, idx) => (
                          <div 
                            key={idx} 
                            className="relative aspect-[4/3] w-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-lg hover:shadow-2xl rounded-xl group cursor-pointer bg-gray-100"
                            onClick={() => {
                              setShowImageLightbox(true);
                              setLightboxImageIndex(propertyImages.length + idx);
                            }}
                          >
                            <Image 
                              src={plan} 
                              alt={`Floor Plan ${idx + 1}`} 
                              fill 
                              className="object-contain transition-transform duration-500 group-hover:scale-110" 
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/logo.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                                <p className="text-sm font-semibold text-gray-900">Floor Plan {idx + 1}</p>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                  )}
                </Card>
              )}

              {/* What's Nearby - Collapsible */}
              <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden bg-white">
                <CardHeader 
                  className="cursor-pointer bg-gradient-to-r from-gray-50 via-gray-100/50 to-gray-50 hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300 py-6 border-b border-gray-200/50"
                  onClick={() => toggleSection('nearby')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      What&apos;s Nearby
                    </CardTitle>
                    {openSections.nearby ? (
                      <ChevronUp className="h-5 w-5 text-primary transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
                    )}
                  </div>
                </CardHeader>
                {openSections.nearby && (
                  <CardContent className="pt-6 animate-in fade-in slide-in-from-top-2 duration-300 p-6">
                    {(() => {
                      // Combine nearby and transport fields (transport is the database field, nearby is the interface field)
                      const nearbyPlaces = (property as any).nearby || [];
                      const transportPlaces = (property as any).transport || [];
                      const allPlaces = [...nearbyPlaces, ...transportPlaces];
                      
                      return allPlaces.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {allPlaces.map((place: any, idx: number) => {
                          // Map common place names to icons
                          const getIcon = (name: string) => {
                            const lowerName = name.toLowerCase();
                            if (lowerName.includes("restaurant") || lowerName.includes("food") || lowerName.includes("dining")) {
                              return { Icon: UtensilsCrossed, color: "bg-blue-500 text-white", hoverColor: "bg-blue-600" };
                            }
                            if (lowerName.includes("school") || lowerName.includes("education") || lowerName.includes("university")) {
                              return { Icon: GraduationCap, color: "bg-green-500 text-white", hoverColor: "bg-green-600" };
                            }
                            if (lowerName.includes("shopping") || lowerName.includes("mall") || lowerName.includes("market")) {
                              return { Icon: ShoppingBag, color: "bg-purple-500 text-white", hoverColor: "bg-purple-600" };
                            }
                            if (lowerName.includes("transport") || lowerName.includes("metro") || lowerName.includes("station") || lowerName.includes("bus")) {
                              return { Icon: Car, color: "bg-orange-500 text-white", hoverColor: "bg-orange-600" };
                            }
                            if (lowerName.includes("hospital") || lowerName.includes("medical") || lowerName.includes("clinic")) {
                              return { Icon: Award, color: "bg-red-500 text-white", hoverColor: "bg-red-600" };
                            }
                            if (lowerName.includes("park") || lowerName.includes("garden")) {
                              return { Icon: Home, color: "bg-emerald-500 text-white", hoverColor: "bg-emerald-600" };
                            }
                            // Default icon
                            return { Icon: MapPin, color: "bg-gray-500 text-white", hoverColor: "bg-gray-600" };
                          };
                          
                          const { Icon, color, hoverColor } = getIcon(place.name);
                          
                          return (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white hover:from-primary/5 hover:to-primary/10 transition-all duration-300 rounded-xl border-2 border-gray-200 hover:border-primary/30 hover:shadow-lg cursor-pointer group">
                              <div className={`p-3 ${color} group-hover:${hoverColor} rounded-xl transition-all duration-300 group-hover:scale-110 shadow-md`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{place.name}</p>
                                <p className="text-sm text-gray-600 font-medium">{place.distance}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                            </div>
                          );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border-2 border-dashed border-gray-300">
                          <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                          <p className="text-gray-600 font-medium">No nearby places information available</p>
                        </div>
                      );
                    })()}
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right Column - Schedule Tour Form */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 z-20 self-start w-full transition-all duration-300">
                {/* Schedule Tour Form */}
                <Card className="rounded-2xl border-2 border-gray-200/50 hover:border-primary/30 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden w-full bg-gradient-to-br from-white to-gray-50/50">
                  <CardHeader className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 border-b p-6">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Schedule Tour
                    </CardTitle>
                    <p className="text-sm text-white/90 mt-1">Get in touch with us today</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6 p-6 bg-white">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <span>Your Name</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Your Email</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Your Phone</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="h-12 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-sm font-semibold text-gray-700">
                        Message
                      </Label>
                      <Textarea
                        id="contact-message"
                        value={contactForm.message || `Hello, I am interested in ${property.name}`}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder={`Hello, I am interested in ${property.name}`}
                        rows={4}
                        className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none rounded-xl bg-white"
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary/95 text-white font-bold h-14 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-[0.98] text-base"
                      onClick={handleSubmitInquiry}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Submit Inquiry
                        </span>
                      )}
                    </Button>
                    
                    {/* Quick Contact Options */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Or Contact Directly</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleWhatsApp}
                          variant="outline"
                          className="flex-1 h-11 border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 rounded-xl transition-all duration-300"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="flex-1 h-11 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all duration-300"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {recentProperties.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Similar Properties</h2>
                <p className="text-gray-600">Explore other properties you might like</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProperties
                  .filter((p) => p.id !== property.id)
                  .slice(0, 3)
                  .map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Image Lightbox */}
      {showImageLightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowImageLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 bg-black/50 rounded-full p-3 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageLightbox(false);
            }}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {(() => {
              // Combine property images and floor plans
              const allImages = [
                ...propertyImages,
                ...(property.floorPlans || [])
              ];
              
              if (allImages.length === 0) return null;
              
              const currentImage = allImages[lightboxImageIndex] || allImages[0];
              // Optimize lightbox image (high quality, full size)
              const optimizedLightboxImage = optimizeImageUrl(currentImage, { width: 1920, height: 1080, quality: 'auto' });
              
              return (
                <>
                  <Image
                    src={optimizedLightboxImage}
                    alt={lightboxImageIndex < propertyImages.length 
                      ? `${property.name} - Image ${lightboxImageIndex + 1}`
                      : `Floor Plan ${lightboxImageIndex - propertyImages.length + 1}`
                    }
                    fill
                    className="object-contain"
                    unoptimized
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logo.png";
                    }}
                  />
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImageIndex(
                            lightboxImageIndex > 0 ? lightboxImageIndex - 1 : allImages.length - 1
                          );
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm z-40"
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImageIndex(
                            lightboxImageIndex < allImages.length - 1 ? lightboxImageIndex + 1 : 0
                          );
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm z-40"
                      >
                        <ChevronRight className="h-8 w-8" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-2.5 text-sm font-semibold rounded-full backdrop-blur-md shadow-xl border border-white/10 z-40">
                        {lightboxImageIndex + 1} / {allImages.length}
                        {lightboxImageIndex >= propertyImages.length && (
                          <span className="ml-2 text-xs opacity-75">(Floor Plan)</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
