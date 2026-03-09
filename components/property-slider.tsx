"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Property } from "@/lib/data-store";

interface PropertySliderProps {
  properties: Property[];
  title?: string;
  subtitle?: string;
  itemsToShow?: number; // Number of items to show at once (responsive)
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
}

export function PropertySlider({
  properties,
  title,
  subtitle,
  itemsToShow = 3,
  autoSlide = true,
  autoSlideInterval = 4000,
  showNavigation = true,
  showDots = true,
}: PropertySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(itemsToShow);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (width < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(itemsToShow); // Desktop: default
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [itemsToShow]);

  const maxIndex = Math.max(0, properties.length - itemsPerView);

  useEffect(() => {
    if (!autoSlide || properties.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, properties.length, itemsPerView, maxIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {properties.length > itemsPerView && (
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="rounded-full"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div className="relative overflow-visible min-h-[520px]">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6 h-full"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex-shrink-0 h-full flex"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showNavigation && properties.length > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white shadow-lg hover:bg-white z-10 hidden md:flex"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white shadow-lg hover:bg-white z-10 hidden md:flex"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && properties.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
