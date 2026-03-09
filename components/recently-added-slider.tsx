"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { PropertyCard } from "./property-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Property } from "@/lib/data-store";

interface RecentlyAddedSliderProps {
  properties?: Property[];
}

export function RecentlyAddedSlider({ properties = [] }: RecentlyAddedSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, // Enable loop for continuous auto-sliding
    align: "start",
    slidesToScroll: 1, // Always scroll one slide at a time
    duration: 40, // Slower, smoother animation (higher = slower, default is 25)
  }, [
    Autoplay({ 
      delay: 5000, // Auto-slide every 5 seconds for better viewing
      stopOnInteraction: false, // Continue auto-sliding even after user interaction
      playOnInit: true, // Start auto-sliding immediately
      stopOnMouseEnter: true, // Pause on hover so users can interact
    })
  ]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recently added properties available.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Title and View More Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Recently Added Properties
        </h2>
        <Button asChild variant="outline" className="group shrink-0">
          <Link href="/properties" className="flex items-center gap-2">
            View More
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      {/* Slider Container */}
      <div className="relative">
        <div className="overflow-hidden pb-4" ref={emblaRef}>
          <div className="flex -mr-4 md:-mr-6">
            {properties.map((property, index) => {
              const propertyKey = (property as any)._id || property.id || `property-${index}-${property.name}`;
              return (
              <div
                key={propertyKey}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] min-w-0 pr-4 md:pr-6"
              >
                <div className="h-full">
                  <PropertyCard property={property} />
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        {properties.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hidden md:flex ${
                canScrollPrev
                  ? "hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              aria-label="Previous properties"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hidden md:flex ${
                canScrollNext
                  ? "hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              aria-label="Next properties"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
