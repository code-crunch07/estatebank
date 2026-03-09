"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PropertyCard } from "./property-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/data-store";

interface NewProjectsSliderProps {
  properties?: Property[];
}

export function NewProjectsSlider({ properties = [] }: NewProjectsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 1280px)": { slidesToScroll: 4 },
    },
  });

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
    return null; // Don't render anything if no properties
  }

  return (
    <div className="w-full">
      {/* Slider Container */}
      <div className="relative">
        <div className="overflow-hidden pb-4" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {properties.map((property, index) => (
              <div
                key={(property as any)._id || property.id || `property-${index}`}
                className="flex-[0_0_100%] md:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-11px)] xl:flex-[0_0_calc(25%-14px)] min-w-0"
              >
                <div className="h-full">
                  <PropertyCard property={property} />
                </div>
              </div>
            ))}
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

