"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { HeroSlider } from "@/components/hero-slider";
import { DataStore, type Property, type HeroImage } from "@/lib/data-store";
import { Search, MapPin, TrendingUp, Users, Award, Home, Building2, ArrowRight, Phone, MessageSquare, CheckCircle2, Calendar, Handshake, BadgeCheck, Bed, IndianRupee, Shield, Star, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { HeroSliderSkeleton } from "@/components/skeletons/hero-slider-skeleton";

// Dynamic imports for non-critical components (code splitting)
const GridPropertyOne = dynamic(() => import("@/components/grid-property-one").then(mod => ({ default: mod.GridPropertyOne })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

const ClientsSlider = dynamic(() => import("@/components/clients-slider").then(mod => ({ default: mod.ClientsSlider })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

const TestimonialsSlider = dynamic(() => import("@/components/testimonials-slider").then(mod => ({ default: mod.TestimonialsSlider })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

const RecentlyAddedSlider = dynamic(() => import("@/components/recently-added-slider").then(mod => ({ default: mod.RecentlyAddedSlider })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

const NewProjectsSlider = dynamic(() => import("@/components/new-projects-slider").then(mod => ({ default: mod.NewProjectsSlider })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

const QuickEnquiryForm = dynamic(() => import("@/components/quick-enquiry-form").then(mod => ({ default: mod.QuickEnquiryForm })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true,
});

interface HeroImageApi {
  _id: string;
  type: "property" | "banner";
  propertyId?: string | { _id: string; [key: string]: any };
  image?: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  order: number;
  status: "Active" | "Inactive";
}

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImageApi[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch properties and hero images in parallel for better performance
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use Promise.all to fetch both APIs in parallel with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const [propertiesResponse, heroImagesResponse] = await Promise.all([
            fetch('/api/properties?lightweight=true&limit=100', {
              signal: controller.signal,
              cache: 'force-cache', // Use browser cache
            }),
            fetch('/api/hero-images?status=Active', {
              signal: controller.signal,
              cache: 'force-cache',
            }),
          ]);
          
          clearTimeout(timeoutId);

        // Process properties response
        try {
          const propertiesData = await propertiesResponse.json();
          
          if (propertiesData.success) {
            // Handle both response formats:
            // 1. When lightweight=true: data.data is an array
            // 2. When lightweight=false: data.data is { properties: [...], count: ... }
            let propertiesArray: any[] = [];
            
            if (Array.isArray(propertiesData.data)) {
              propertiesArray = propertiesData.data;
            } else if (propertiesData.data?.properties && Array.isArray(propertiesData.data.properties)) {
              propertiesArray = propertiesData.data.properties;
            } else if (propertiesData.data && typeof propertiesData.data === 'object') {
              const keys = Object.keys(propertiesData.data);
              for (const key of keys) {
                if (Array.isArray(propertiesData.data[key])) {
                  propertiesArray = propertiesData.data[key];
                  break;
                }
              }
            }
            
            // Filter out invalid properties (must have id/_id and name)
            const validProperties = propertiesArray.filter((p: any) => p && (p._id || p.id) && p.name);
            
            // Normalize properties: ensure both _id and id are available
            const normalizedProperties = validProperties.map((p: any) => ({
              ...p,
              id: p._id || p.id,
              _id: p._id || p.id,
            }));
            
            setProperties(normalizedProperties);
          } else {
            setProperties([]);
          }
        } catch (error) {
          console.error('Error processing properties:', error);
          setProperties([]);
        }

        // Process hero images response
        try {
          const heroImagesData = await heroImagesResponse.json();
          if (heroImagesData.success && heroImagesData.data) {
            setHeroImages(Array.isArray(heroImagesData.data) ? heroImagesData.data : []);
          } else {
            setHeroImages([]);
          }
        } catch (error) {
          console.error('Error processing hero images:', error);
          setHeroImages([]);
        }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            console.error('Fetch timeout - data taking too long to load');
          } else {
            console.error('Error fetching data:', fetchError);
          }
          // Don't clear existing data on error - show cached data if available
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Don't clear existing data on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Removed automatic refresh interval - data will refresh on page reload or navigation
    // This reduces unnecessary API calls and improves performance
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Process hero images to get properties and banner images in order
  const activeHeroImages = heroImages
    .filter(img => img.status === "Active")
    .sort((a, b) => a.order - b.order);
  
  // Homepage processing logs removed for production
  
  // Build slides array maintaining order from dashboard
  const heroSlides: Array<{ 
    property: Property | null; 
    image: string; 
    linkUrl?: string;
    title?: string;
    description?: string;
    buttonText?: string;
  }> = [];
  
  activeHeroImages.forEach((heroImage, index) => {
    if (heroImage.type === "property" && heroImage.propertyId) {
      // propertyId might be a populated object (from API populate) or a string ID
      let property: Property | null = null;
      
      if (typeof heroImage.propertyId === 'object' && heroImage.propertyId !== null) {
        // propertyId is populated - use it directly
        const populatedProperty = heroImage.propertyId as any;
        property = {
          id: populatedProperty._id ? parseInt(populatedProperty._id.toString().slice(-6), 16) || 0 : populatedProperty.id || 0,
          name: populatedProperty.name || '',
          location: populatedProperty.location || '',
          price: populatedProperty.price || '',
          type: populatedProperty.type || 'Buy',
          bedrooms: populatedProperty.bedrooms || 0,
          bathrooms: populatedProperty.bathrooms || 0,
          area: populatedProperty.area || '',
          images: populatedProperty.images || [],
          status: populatedProperty.status || ['Available'],
          segment: populatedProperty.segment || 'residential',
          ...populatedProperty // Include all other fields
        } as Property;
      } else {
        // propertyId is a string - find matching property
        const propertyId = heroImage.propertyId.toString();
        property = properties.find(p => {
          // Try to match by id (number) or _id (string)
          return p.id?.toString() === propertyId || (p as any)._id?.toString() === propertyId;
        }) || null;
      }
      
      if (property) {
        // Use property's featuredImage or first image
        // Don't optimize here - HeroSlider will optimize it
        const propertyImage = (property as any).featuredImage 
          || property.images?.[0] 
          || "/20200513110502.jpg";
        
        heroSlides.push({
          property: property,
          image: propertyImage,
          linkUrl: undefined
        });
      } else {
        console.warn('[Homepage] ✗ Property not found for hero image:', {
          propertyId: heroImage.propertyId,
          propertyIdType: typeof heroImage.propertyId,
          availablePropertyIds: properties.map(p => ({ id: p.id, _id: (p as any)._id }))
        });
      }
    } else if (heroImage.type === "banner" && heroImage.image) {
      // Don't optimize here - HeroSlider will optimize it
      heroSlides.push({
        property: null,
        image: heroImage.image,
        linkUrl: heroImage.linkUrl || undefined,
        title: heroImage.title && heroImage.title.trim() ? heroImage.title.trim() : undefined,
        description: heroImage.description && heroImage.description.trim() ? heroImage.description.trim() : undefined,
        buttonText: heroImage.buttonText && heroImage.buttonText.trim() ? heroImage.buttonText.trim() : undefined
      });
    }
  });
  
  // Use hero images from dashboard if available, otherwise fallback to first 3 properties
  const heroProperties = heroSlides
    .filter(slide => slide.property !== null)
    .map(slide => slide.property as Property);
  
  const heroBannerSlides = heroSlides
    .filter(slide => slide.property === null)
    .map(slide => ({
      image: slide.image,
      linkUrl: slide.linkUrl,
      title: slide.title,
      description: slide.description,
      buttonText: slide.buttonText
    }));
  
  // Legacy support - keep for backward compatibility
  const heroBannerImages = heroSlides
    .filter(slide => slide.property === null)
    .map(slide => slide.image);
  
  const heroBannerLinks = heroSlides
    .filter(slide => slide.property === null && slide.linkUrl)
    .map(slide => slide.linkUrl as string);
  
  // If we have hero images from dashboard, use them; otherwise use default properties
  const useHeroImages = activeHeroImages.length > 0;
  
  // Get recently added properties (sorted by id descending, most recent first)
  const recentlyAddedProperties = [...properties]
    .sort((a, b) => b.id - a.id)
    .slice(0, 12); // Get up to 12 most recent properties
  
  // Get properties for grid sections
  // Get first 8 properties for grid (featured property doesn't exist in current schema)
  const gridProperties = properties.slice(0, 8);
  // Filter properties with "Under Construction" status (handle both array and string status)
  const newProjects = properties.filter(p => {
    const statuses = Array.isArray(p.status) ? p.status : (p.status ? [p.status] : []);
    return statuses.some(s => 
      s.toLowerCase() === "under construction" || 
      s.toLowerCase() === "under-construction" ||
      s === "Under Construction"
    );
  }).slice(0, 12);

  const stats = [
    { icon: Home, value: "1200+", label: "Properties Sold", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Users, value: "5000+", label: "Happy Clients", color: "text-green-600", bg: "bg-green-100" },
    { icon: Building2, value: "200+", label: "Active Projects", color: "text-purple-600", bg: "bg-purple-100" },
    { icon: Award, value: "20+", label: "Years Experience", color: "text-orange-600", bg: "bg-orange-100" },
  ];

  // Get unique locations and types for filters
  const uniqueLocations = [...new Set(properties.map(p => p.location))].filter(Boolean).sort();
  const uniqueTypes = [...new Set(properties.map(p => p.type))].filter(Boolean).sort();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (selectedLocation !== "all") {
      params.set("location", selectedLocation);
    }
    if (selectedType !== "all") {
      params.set("type", selectedType);
    }
    if (selectedPrice !== "all") {
      params.set("price", selectedPrice);
    }
    if (selectedBedrooms !== "all") {
      params.set("bedrooms", selectedBedrooms);
    }
    
    window.location.href = `/properties?${params.toString()}`;
  };

  const trustPoints = [
    { icon: Shield, title: "Verified Properties", desc: "Every listing inspected by our expert team" },
    { icon: TrendingUp, title: "Investment Growth", desc: "Strategic picks for maximum returns" },
    { icon: Star, title: "Premium Service", desc: "White-glove experience from search to keys" },
    { icon: Clock, title: "20+ Years Trust", desc: "Two decades of building wealth through property" },
  ];

  return (
    <>
      {/* Quick Enquiry Form */}
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <QuickEnquiryForm />
      </Suspense>

      {/* Hero Slider — KEPT AS IS */}
      {isLoading && heroSlides.length === 0 ? (
        <HeroSliderSkeleton />
      ) : (
        heroSlides.length > 0 && (
          <HeroSlider 
            properties={useHeroImages ? heroProperties : properties.slice(0, 3)} 
            images={useHeroImages && heroBannerImages.length > 0 ? heroBannerImages : undefined}
            bannerLinks={useHeroImages && heroBannerLinks.length > 0 ? heroBannerLinks : undefined}
            bannerSlides={useHeroImages && heroBannerSlides.length > 0 ? heroBannerSlides : undefined}
            allSlides={useHeroImages && heroSlides.length > 0 ? heroSlides : undefined}
          />
        )
      )}

      {/* ─── Search Bar — dark floating card ─── */}
      <section className="relative -mt-10 md:-mt-20 z-30 mb-0">
        <div className="container mx-auto px-4">
          <Card className="shadow-2xl border-0 bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
            <form onSubmit={handleSearch} className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="text"
                      placeholder="Search by location, property name, or features..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 text-base bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-primary rounded-xl transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 px-8 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-primary text-gray-900 hover:bg-primary/90"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {isMounted ? (
                    <>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className="h-12 pl-10 bg-gray-800 border-gray-700 text-white rounded-xl transition-all [&>span]:text-gray-300" suppressHydrationWarning>
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Locations</SelectItem>
                            {uniqueLocations.map((location) => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="h-12 pl-10 bg-gray-800 border-gray-700 text-white rounded-xl transition-all [&>span]:text-gray-300" suppressHydrationWarning>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {uniqueTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                          <SelectTrigger className="h-12 pl-10 bg-gray-800 border-gray-700 text-white rounded-xl transition-all [&>span]:text-gray-300" suppressHydrationWarning>
                            <SelectValue placeholder="Price Range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any Price</SelectItem>
                            <SelectItem value="below-1">Below ₹1 Cr</SelectItem>
                            <SelectItem value="1-3">₹1 Cr - ₹3 Cr</SelectItem>
                            <SelectItem value="3-5">₹3 Cr - ₹5 Cr</SelectItem>
                            <SelectItem value="above-5">Above ₹5 Cr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
                          <SelectTrigger className="h-12 pl-10 bg-gray-800 border-gray-700 text-white rounded-xl transition-all [&>span]:text-gray-300" suppressHydrationWarning>
                            <SelectValue placeholder="Bedrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any BHK</SelectItem>
                            <SelectItem value="1">1 BHK</SelectItem>
                            <SelectItem value="2">2 BHK</SelectItem>
                            <SelectItem value="3">3 BHK</SelectItem>
                            <SelectItem value="4">4 BHK</SelectItem>
                            <SelectItem value="5">5+ BHK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">Real Estate &bull; Investments &bull; Trust</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Investors Choose EstateBANK</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {trustPoints.map((tp, i) => {
              const Icon = tp.icon;
              return (
                <div key={i} className="group text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5 text-base">{tp.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Stats — dark strip with gold numbers ─── */}
      <section className="py-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,168,78,0.08),transparent_60%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recently Added Properties ─── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <RecentlyAddedSlider properties={recentlyAddedProperties} />
          </Suspense>
        </div>
      </section>

      {/* ─── About — Split: dark left, image right ─── */}
      <section className="py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left — Dark panel */}
          <div className="bg-gray-900 text-white flex items-center">
            <div className="px-8 md:px-16 lg:px-20 py-16 lg:py-20 max-w-xl">
              <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-4">About EstateBANK.in</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Building Wealth Through Property Since 2004
              </h2>
              <p className="text-gray-300 leading-relaxed mb-8">
                What started as a single-handed project by <span className="text-white font-semibold">Mr. Pankaj Nagpal</span> has grown into one of Mumbai&apos;s most trusted real estate agencies. Associated with <span className="text-white font-semibold">CREBAI India</span>, we bring two decades of market expertise to every deal.
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-10">
                {[
                  { icon: Calendar, label: "20+ Years", sub: "Of Excellence" },
                  { icon: Handshake, label: "CREBAI", sub: "Certified Member" },
                  { icon: Users, label: "12+ Experts", sub: "Dedicated Team" },
                  { icon: BadgeCheck, label: "Verified Only", sub: "Trusted Listings" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.label}</h4>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button asChild size="lg" className="group bg-primary text-gray-900 hover:bg-primary/90">
                <Link href="/about" className="flex items-center gap-2">
                  Learn More
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — Full-bleed image */}
          <div className="relative min-h-[400px] lg:min-h-0">
            <Image
              src="/office.jpg"
              alt="EstateBANK.in Office"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent lg:from-gray-900/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="inline-flex items-center gap-2 bg-gray-900/80 backdrop-blur-md rounded-xl px-5 py-3 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-white font-semibold text-sm">REAL DEALS — Trusted Since 2004</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ─── */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">Curated Collection</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Featured Properties
              </h2>
            </div>
            <Button asChild variant="outline" size="lg" className="group border-gray-300 self-start md:self-auto">
              <Link href="/properties" className="flex items-center gap-2">
                Browse All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <GridPropertyOne properties={gridProperties} border={false} />
          </Suspense>
        </div>
      </section>

      {/* ─── Upcoming New Projects ─── */}
      {newProjects.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
              <div className="flex-1">
                <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">Under Construction</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Upcoming New Projects
                </h2>
              </div>
              <div className="flex-1 lg:text-right">
                <p className="text-muted-foreground mb-6 max-w-xl lg:ml-auto">
                  Be among the first to invest in premium developments in prime locations — modern amenities, innovative designs, and exceptional value.
                </p>
                <Button asChild size="lg" className="group bg-primary text-gray-900 hover:bg-primary/90">
                  <Link href="/properties/under-construction" className="flex items-center gap-2">
                    View All Projects
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
              <NewProjectsSlider properties={newProjects} />
            </Suspense>
          </div>
        </section>
      )}

      {/* ─── CTA — Dark with gold accents ─── */}
      <section className="py-20 md:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,78,0.12),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,78,0.08),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] border border-primary/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-4">Get Started Today</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Build Your Property Portfolio?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              Whether you&apos;re buying your first home or expanding your investment portfolio, our expert team is here to guide every step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary text-gray-900 hover:bg-primary/90 group px-8">
                <Link href="/contact" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Us
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 group px-8">
                <a href="https://wa.me/919820590353" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: CheckCircle2, title: "Verified Listings", desc: "Every property inspected and verified by our team" },
                { icon: TrendingUp, title: "Smart Investments", desc: "Data-driven picks for maximum capital appreciation" },
                { icon: Users, title: "Dedicated Support", desc: "Personal advisor from first visit to final handover" },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-primary/30 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-base font-bold text-white">{card.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <TestimonialsSlider />
      </Suspense>

      {/* ─── Clients / Partners ─── */}
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
        <ClientsSlider />
      </Suspense>
    </>
  );
}
