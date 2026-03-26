"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { HeroSlider } from "@/components/hero-slider";
import { DataStore, type Property, type HeroImage } from "@/lib/data-store";
import { TrendingUp, Users, Award, Home, Building2, ArrowRight, Phone, MessageSquare, CheckCircle2, Calendar, Handshake, BadgeCheck, Shield, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [isLoading, setIsLoading] = useState(true);

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

  const defaultHeroImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80";
  
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
          || defaultHeroImage;
        
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

  // Fallback slides when no hero images from dashboard - use first 3 properties
  const fallbackSlides = heroSlides.length === 0 && properties.length > 0
    ? properties.slice(0, 3).map((p) => ({
        property: p,
        image: (p as any).featuredImage || p.images?.[0] || defaultHeroImage,
        linkUrl: undefined as string | undefined,
      }))
    : heroSlides;
  
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

      {/* Hero Slider — shows dashboard hero images, or fallback to first 3 properties */}
      {isLoading && fallbackSlides.length === 0 ? (
        <HeroSliderSkeleton />
      ) : fallbackSlides.length > 0 ? (
        <HeroSlider 
          properties={useHeroImages ? heroProperties : properties.slice(0, 3)} 
          images={useHeroImages && heroBannerImages.length > 0 ? heroBannerImages : undefined}
          bannerLinks={useHeroImages && heroBannerLinks.length > 0 ? heroBannerLinks : undefined}
          bannerSlides={useHeroImages && heroBannerSlides.length > 0 ? heroBannerSlides : undefined}
          allSlides={useHeroImages && heroSlides.length > 0 ? heroSlides : fallbackSlides}
        />
      ) : (
        /* Absolute fallback: single placeholder slide when no properties */
        <HeroSlider 
          properties={[]} 
          allSlides={[{ property: null, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" }]}
        />
      )}

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
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-primary/20">
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

      {/* ─── Stats — light strip with gold numbers ─── */}
      <section className="py-12 bg-primary/5 relative overflow-hidden border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,168,78,0.12),transparent_60%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium tracking-wide uppercase">{stat.label}</div>
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

      {/* ─── About — Split: content + office image (Figtree body, Forum heading) ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-muted/30 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_50%,rgba(201,168,78,0.08),transparent)]" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl shadow-black/[0.06] lg:grid-cols-2 lg:rounded-3xl lg:min-h-[560px]">
            {/* Copy — order below image on small screens for stronger hero photo */}
            <div className="relative order-2 flex flex-col justify-center border-t border-border/60 bg-gradient-to-br from-background via-primary/[0.04] to-muted/40 px-6 py-12 sm:px-10 md:px-14 lg:order-1 lg:border-t-0 lg:border-r lg:py-16">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-primary/60" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  About EstateBANK.in
                </p>
              </div>
              <h2 className="font-heading text-3xl font-bold leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-[2.35rem]">
                Building Wealth Through Property Since 2004
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
                What started as a single-handed project by{" "}
                <span className="font-semibold text-foreground">Mr. Pankaj Nagpal</span> has grown into one of
                Mumbai&apos;s most trusted real estate agencies. Associated with{" "}
                <span className="font-semibold text-foreground">CREBAI India</span>, we bring two decades of market
                expertise to every deal.
              </p>

              <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  { icon: Calendar, label: "20+ Years", sub: "Of Excellence" },
                  { icon: Handshake, label: "CREBAI", sub: "Certified Member" },
                  { icon: Users, label: "12+ Experts", sub: "Dedicated Team" },
                  { icon: BadgeCheck, label: "Verified Only", sub: "Trusted Listings" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={i}
                      className="group flex gap-3 rounded-xl border border-primary/10 bg-background/80 p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/15 transition group-hover:bg-primary/18">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-foreground">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.sub}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-10">
                <Button
                  asChild
                  size="lg"
                  className="group rounded-xl bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                >
                  <Link href="/about" className="flex items-center gap-2">
                    Learn More
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Image — subtle frame + trust chip */}
            <div className="relative order-1 min-h-[280px] sm:min-h-[360px] lg:order-2 lg:min-h-0">
              <Image
                src="/office.jpg"
                alt="EstateBANK.in office"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <div className="inline-flex max-w-[min(100%,20rem)] items-start gap-3 rounded-2xl border border-white/25 bg-white/92 px-4 py-3 shadow-2xl backdrop-blur-md sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25">
                    <Star className="h-5 w-5 fill-primary/30 text-primary" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Real Deals</p>
                    <p className="text-sm font-semibold leading-snug text-foreground">Trusted since 2004</p>
                  </div>
                </div>
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
                <Button asChild size="lg" className="group bg-primary text-brand-dark hover:bg-primary/90">
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

      {/* ─── CTA — Light with gold accents ─── */}
      <section className="py-20 md:py-28 bg-primary/5 relative overflow-hidden border-t border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,78,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,78,0.1),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] border border-primary/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-4">Get Started Today</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to Build Your Property Portfolio?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Whether you&apos;re buying your first home or expanding your investment portfolio, our expert team is here to guide every step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 group px-8">
                <Link href="/contact" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Us
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40 text-gray-900 hover:bg-primary/10 group px-8">
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
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-colors duration-300 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{card.desc}</p>
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
