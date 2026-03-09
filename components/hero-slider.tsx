"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { getPropertyUrl, formatIndianPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, ArrowRight, Heart, GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/data-store";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary-client";

interface BannerSlide {
  image: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
}

interface SlideData {
  property: Property | null;
  image: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
}

interface HeroSliderProps {
  properties: Property[];
  images?: string[];
  bannerLinks?: string[]; // Optional links for banner images
  bannerSlides?: BannerSlide[]; // Full banner slide data with title, description, buttonText
  allSlides?: SlideData[]; // All slides in order (banners + properties)
}

export function HeroSlider({ properties, images = [], bannerLinks = [], bannerSlides = [], allSlides }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true
  }, [
    Autoplay({
      delay: 5000,
      stopOnInteraction: true
    })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Helper function to optimize Cloudinary URLs for hero images
  const optimizeHeroImage = (url: string) => {
    if (!url || url.startsWith('/') || url.startsWith('data:')) {
      return url; // Return as-is for local/relative/base64 images
    }
    if (isCloudinaryUrl(url)) {
      return getOptimizedUrl(url, {
        width: 1920,
        height: 1080,
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
      });
    }
    return url; // Return as-is for non-Cloudinary URLs
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Combine properties with images
  // Priority: If allSlides are provided (from hero images dashboard with correct order), use them first
  // Otherwise, fallback to bannerSlides, images array, or properties
  let slides: SlideData[] = [];
  
  if (allSlides && allSlides.length > 0) {
    // Use all slides in the correct order from dashboard (banners + properties mixed)
    slides = allSlides.map((slide) => ({
      property: slide.property,
      image: slide.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
      linkUrl: slide.linkUrl,
      title: slide.title || undefined,
      description: slide.description || undefined,
      buttonText: slide.buttonText || undefined
    }));
  } else if (bannerSlides && bannerSlides.length > 0) {
    // Use full banner slides with title, description, buttonText
    slides = bannerSlides.map((banner) => ({
      property: null as Property | null,
      image: banner.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
      linkUrl: banner.linkUrl,
      title: banner.title,
      description: banner.description,
      buttonText: banner.buttonText
    }));
    
    // Also add properties if available (they'll be mixed in)
    if (properties.length > 0) {
      const propertySlides = properties.map((prop) => ({
        property: prop,
        image: prop.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
      }));
      slides = [...slides, ...propertySlides];
    }
  } else if (images && images.length > 0) {
    // Use banner images from dashboard (legacy format)
    slides = images.map((img, index) => ({
      property: null as Property | null,
      image: img || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
      linkUrl: bannerLinks[index] || undefined
    }));
    
    // Also add properties if available (they'll be mixed in)
    if (properties.length > 0) {
      const propertySlides = properties.map((prop) => ({
        property: prop,
        image: prop.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
      }));
      slides = [...slides, ...propertySlides];
    }
  } else if (properties.length > 0) {
    // Fallback to properties if no banner images
    slides = properties.map((prop) => ({
      property: prop,
      image: prop.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
    }));
  }

  if (slides.length === 0) {
    slides.push({ property: null as Property | null, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" });
  }

  return (
    <div className="home-slider margin-bottom-0 relative">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => {
            const slideContent = (
              <>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
                
                <div className="container relative z-10 mx-auto px-4">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="home-slider-container py-12 md:py-20">
                        {slide.property ? (
                          <div className="home-slider-desc max-w-2xl">
                            <div className="modern-pro-wrap flex gap-3 mb-4">
                              <span className="property-type bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                {slide.property.status || "For Sale"}
                              </span>
                              <span className="property-featured bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Featured
                              </span>
                            </div>
                            
                            <div className="home-slider-title mb-4">
                              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                <Link href={getPropertyUrl(slide.property)} className="hover:text-primary transition-colors">
                                  {slide.property.name}
                                </Link>
                              </h3>
                              <span className="text-white/90 flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                {slide.property.location}
                              </span>
                            </div>
                            
                            <div className="slide-property-info mb-4">
                              <ul className="flex flex-wrap gap-4 text-white">
                                <li className="flex items-center gap-2">
                                  <Bed className="h-5 w-5" />
                                  Beds: {slide.property.bedrooms}
                                </li>
                                <li className="flex items-center gap-2">
                                  <Bath className="h-5 w-5" />
                                  Bath: {slide.property.bathrooms}
                                </li>
                                <li className="flex items-center gap-2">
                                  <Square className="h-5 w-5" />
                                  sqft: {slide.property.area}
                                </li>
                              </ul>
                            </div>
                            
                            <div className="listing-price-with-compare flex items-center justify-between mb-6">
                              <h4 className="list-pr text-3xl md:text-4xl font-bold text-white">
                                {formatIndianPrice(slide.property.price)}
                              </h4>
                              <div className="lpc-right flex items-center gap-2">
                                <Link 
                                  href="/compare-property" 
                                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                                >
                                  <GitCompare className="h-5 w-5" />
                                </Link>
                                <Link 
                                  href="#" 
                                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                                >
                                  <Heart className="h-5 w-5" />
                                </Link>
                              </div>
                            </div>
                            
                            <Link href={getPropertyUrl(slide.property)}>
                              <Button className="read-more bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                                View Details <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="home-slider-desc max-w-2xl">
                            {(slide.title && slide.title.trim()) || (slide.description && slide.description.trim()) || (slide.buttonText && slide.buttonText.trim()) ? (
                              <>
                                {slide.title && slide.title.trim() && (
                                  <div className="home-slider-title mb-4">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                      {slide.linkUrl ? (
                                        <Link href={slide.linkUrl} className="hover:text-primary transition-colors">
                                          {slide.title}
                                        </Link>
                                      ) : (
                                        slide.title
                                      )}
                                    </h3>
                                  </div>
                                )}
                                
                                {slide.description && slide.description.trim() && (
                                  <p className="text-lg md:text-xl text-white/90 mb-6">
                                    {slide.description}
                                  </p>
                                )}
                                
                                {slide.buttonText && slide.buttonText.trim() && (
                                  <Link href={slide.linkUrl || "/properties"}>
                                    <Button className="read-more bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                                      {slide.buttonText} <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="modern-pro-wrap flex gap-3 mb-4">
                                  <span className="property-type bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    For Sale
                                  </span>
                                  <span className="property-featured bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    Featured
                                  </span>
                                </div>
                                
                                <div className="home-slider-title mb-4">
                                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                    <Link href="/properties" className="hover:text-primary transition-colors">
                                      Find Your Dream Property
                                    </Link>
                                  </h3>
                                  <span className="text-white/90 flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Premium Properties Available
                                  </span>
                                </div>
                                
                                <Link href="/properties">
                                  <Button className="read-more bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                                    Explore Properties <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );

            // Never use outer link wrapper to avoid nested <a> tags
            // Inner links (property name, buttons, titles) handle all navigation
            // Use Next.js Image for first slide (LCP optimization), background for others
            const isFirstSlide = index === 0;
            const optimizedImage = optimizeHeroImage(slide.image);
            
            return (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                <div className="flex items-center relative min-h-[600px] md:min-h-[700px] w-full overflow-hidden">
                  {isFirstSlide ? (
                    // Use Next.js Image for first slide (LCP element)
                    <Image
                      src={optimizedImage}
                      alt={slide.property?.name || slide.title || "Hero image"}
                      fill
                      priority
                      quality={85}
                      className="object-cover"
                      sizes="100vw"
                    />
                  ) : (
                    // Use background image for other slides (lazy load)
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${optimizedImage})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                      }}
                    />
                  )}
                  {slideContent}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === selectedIndex 
                  ? "bg-white w-8" 
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
