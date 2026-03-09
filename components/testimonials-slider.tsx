"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 1 },
      "(min-width: 1024px)": { slidesToScroll: 1 },
    },
  }, [Autoplay({ delay: 4000, stopOnInteraction: false, playOnInit: true, stopOnMouseEnter: false })]);

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
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    // Fetch testimonials from API
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials?status=Published");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data)) {
            setTestimonials(data.data);
          } else {
            setTestimonials([]);
          }
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // Detect slides per view for dots
    const updateSlidesPerView = () => {
      if (!emblaApi) return;
      const container = emblaApi.rootNode();
      if (window.innerWidth >= 1024) setSlidesPerView(3);
      else if (window.innerWidth >= 768) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, [emblaApi, onSelect]);

  // Reinitialize carousel when testimonials change
  useEffect(() => {
    if (emblaApi && testimonials.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, testimonials.length]);

  // Always show the section - testimonials will be empty array if none found

  return (
    <section className="w-full py-16 md:py-24 bg-gray-100">
      <div className="w-full px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied clients have to say about their experience with EstateBANK.in.
          </p>
        </div>

        {/* Testimonials Content - Full Width */}
        <div className="w-full bg-gray-100 rounded-2xl p-8 md:p-12">
          {/* Slider Container */}
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex items-stretch -mr-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id || testimonial._id}
                    className={
                      slidesPerView === 3
                        ? "flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0 flex mr-6"
                        : slidesPerView === 2
                        ? "flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] min-w-0 flex mr-6"
                        : "flex-[0_0_100%] min-w-0 flex mr-6"
                    }
                  >
                    <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-2xl flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Rating */}
                          <div className="flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {testimonial.rating || 5}/5
                            </span>
                          </div>

                          {/* Testimonial Text */}
                          <p className="text-base text-gray-700 leading-relaxed">
                            &quot;{testimonial.text}&quot;
                          </p>

                          {/* Client Info */}
                          <div className="flex items-start gap-3 pt-3 border-t border-gray-100 flex-shrink-0 mt-auto">
                            {testimonial.image && (
                              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={testimonial.image}
                                  alt={testimonial.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/logo.png";
                                  }}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                {testimonial.name}
                              </h4>
                              {(testimonial.role || testimonial.company) && (
                                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                  {[testimonial.role, testimonial.company].filter(Boolean).join(" • ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Always show if there are testimonials */}
            {testimonials.length > 0 && (
              <>
                <button
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                    canScrollPrev
                      ? "hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                    canScrollNext
                      ? "hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Dots Navigation */}
            {testimonials.length > slidesPerView && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(testimonials.length / slidesPerView) }).map((_, index) => {
                  const isActive = selectedIndex >= index * slidesPerView && selectedIndex < (index + 1) * slidesPerView;
                  return (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index * slidesPerView)}
                      className={`h-2 rounded-full transition-all ${
                        isActive ? "w-8 bg-primary" : "w-2 bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
