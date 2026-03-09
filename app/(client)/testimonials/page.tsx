"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import Image from "next/image";
import { Testimonial } from "@/lib/data-store";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // Fetch testimonials from API
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials?status=Published");
        const data = await response.json();
        if (data.success && data.data) {
          setTestimonials(Array.isArray(data.data) ? data.data : []);
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
        setTestimonials([]);
      }
    };

    loadTestimonials();
    
    // Refresh periodically
    const interval = setInterval(loadTestimonials, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
            <Quote className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Client Testimonials
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Hear from our satisfied clients about their experience with EstateBANK.in
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Quote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Testimonials Available
              </h3>
              <p className="text-muted-foreground">
                Check back soon for client testimonials
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-2xl flex flex-col h-full"
                >
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex-shrink-0 mb-4">
                      <span className="text-base font-semibold text-primary">
                        {testimonial.rating || 5}/5
                      </span>
                    </div>

                    {/* Quote Icon */}
                    <div className="mb-4">
                      <Quote className="h-8 w-8 text-primary/20" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-base text-gray-700 leading-relaxed flex-1 mb-4">
                      {testimonial.text}
                    </p>

                    {/* Client Info */}
                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100 flex-shrink-0 mt-auto">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {testimonial.name}
                        </h4>
                        {(testimonial.role || testimonial.company) && (
                          <p className="text-xs text-muted-foreground leading-relaxed break-words">
                            {[testimonial.role, testimonial.company].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1200+</div>
              <div className="text-lg text-muted-foreground">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-lg text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">20+</div>
              <div className="text-lg text-muted-foreground">Years of Experience</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
