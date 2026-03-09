"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface PageTitleProps {
  title: string;
  subtitle?: string; // Gradient subtitle (e.g., "Let's Connect")
  description?: string; // Description paragraph below title
  eyebrow?: string;
  actions?: ReactNode;
  backgroundImage?: string;
}

export function PageTitle({ 
  title, 
  subtitle, 
  description,
  eyebrow = "We're Here to Help • 20+ Years of Excellence", 
  actions,
  backgroundImage 
}: PageTitleProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern-dots.svg')] opacity-10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Background Image with Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-primary/60"></div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm mb-8 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {eyebrow}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
            {subtitle && (
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {subtitle}
              </span>
            )}
          </h1>
          
          {description && (
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="max-w-4xl mx-auto mt-8 flex justify-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
