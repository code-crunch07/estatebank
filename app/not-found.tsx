"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, MapPin, Building2, MessageSquare } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageTitle 
          title="404"
          subtitle="Page Not Found"
          description="The page you're looking for doesn't exist or has been moved."
        />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="relative mb-12">
              <div className="text-9xl font-bold text-primary/10 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary/30" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Oops! Page Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                
                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                    <Link href="/">
                      <Home className="h-5 w-5" />
                      <span className="text-sm font-semibold">Home</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                    <Link href="/properties">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm font-semibold">Properties</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                    <Link href="/contact">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-sm font-semibold">Contact Us</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Links */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Pages</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link 
                    href="/properties" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    All Properties
                  </Link>
                  <Link 
                    href="/properties/under-construction" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    New Projects
                  </Link>
                  <Link 
                    href="/properties?segment=residential" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    Residential
                  </Link>
                  <Link 
                    href="/properties?segment=commercial" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    Commercial
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    About Us
                  </Link>
                  <Link 
                    href="/blogs" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    Blogs
                  </Link>
                  <Link 
                    href="/services" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    Services
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-sm text-primary hover:underline py-2 transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="mt-8">
              <Button 
                variant="default" 
                size="lg"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

