"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { getPropertyUrl, formatIndianPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
                {/* Gradient overlay from left for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                
                <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl">
                    {slide.property ? (
                      <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                          <Link href={getPropertyUrl(slide.property)} className="hover:text-primary transition-colors">
                            {slide.property.name}
                          </Link>
                        </h2>
                        <p className="text-lg md:text-xl text-white/90">
                          {slide.property.location} &bull; {formatIndianPrice(slide.property.price)}
                        </p>
                        <Link href={getPropertyUrl(slide.property)}>
                          <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 rounded-xl text-base font-semibold flex items-center gap-2 shadow-xl">
                            View Details <ArrowRight className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(slide.title && slide.title.trim()) || (slide.description && slide.description.trim()) || (slide.buttonText && slide.buttonText.trim()) ? (
                          <>
                            {slide.title && slide.title.trim() && (
                              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                {slide.linkUrl ? (
                                  <Link href={slide.linkUrl} className="hover:text-primary transition-colors">
                                    {slide.title}
                                  </Link>
                                ) : (
                                  slide.title
                                )}
                              </h2>
                            )}
                            {slide.description && slide.description.trim() && (
                              <p className="text-lg md:text-xl text-white/90 max-w-xl">
                                {slide.description}
                              </p>
                            )}
                            {slide.buttonText && slide.buttonText.trim() && (
                              <Link href={slide.linkUrl || "/properties"}>
                                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 rounded-xl text-base font-semibold flex items-center gap-2 shadow-xl">
                                  {slide.buttonText} <ArrowRight className="h-5 w-5" />
                                </Button>
                              </Link>
                            )}
                          </>
                        ) : (
                          <>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                              <Link href="/properties" className="hover:text-primary transition-colors">
                                Find Your Dream Property
                              </Link>
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 max-w-xl">
                              Premium properties in Mumbai. Residential, commercial, and under-construction listings for sale and rent.
                            </p>
                            <Link href="/properties">
                              <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 rounded-xl text-base font-semibold flex items-center gap-2 shadow-xl">
                                Explore Properties <ArrowRight className="h-5 w-5" />
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    )}
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
                <div className="flex items-center relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden">
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
      
      {/* Pagination — bottom-left: horizontal bars (active = accent, inactive = grey) */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-8 md:left-12 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 rounded-full transition-all ${
                index === selectedIndex 
                  ? "bg-primary w-8" 
                  : "bg-white/40 hover:bg-white/60 w-4"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows — bottom-right: rounded squares */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-8 md:right-12 z-20 flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="w-12 h-12 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="w-12 h-12 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
