"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileCheck, Key, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Property",
    description: "Browse through our extensive collection of premium properties and find the perfect match for your needs.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    icon: FileCheck,
    title: "Verify Details",
    description: "Review property details, amenities, location, and all relevant information to make an informed decision.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    icon: Key,
    title: "Get Your Keys",
    description: "Complete the process smoothly with our dedicated support team and get the keys to your dream property.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  }
];

export function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => new Set([...prev, index]));
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Simple Process
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            How It Works?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Finding your dream property has never been easier. Follow these simple steps to get started on your real estate journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 -z-0"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.has(index);
            
            return (
              <div
                key={index}
                className={`relative z-10 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${step.bgColor} ${step.iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-10 w-10" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h4 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                    
                    {/* Arrow for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-24 -right-4 z-20">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-md">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
