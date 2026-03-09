"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageTitle } from "@/components/page-title";

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "Published" | "Draft";
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Static routes that should not be handled by this dynamic route
const STATIC_ROUTES = [
  'about',
  'blogs',
  'career',
  'contact',
  'home-alt',
  'properties',
  'search',
  'services',
  'testimonials',
  'dashboard',
  'api',
  '_next',
  'favicon.ico',
];

export default function DynamicPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is a static route
    if (STATIC_ROUTES.includes(slug)) {
      setIsLoading(false);
      setError("Page not found");
      return;
    }

    const fetchPage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/pages/${slug}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Only show published pages
          if (data.data.status === "Published") {
            setPage(data.data);
          } else {
            setError("Page not found");
          }
        } else {
          setError("Page not found");
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setError("Failed to load page");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <PageTitle title="Loading..." subtitle="" />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading page...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <PageTitle title="Page Not Found" subtitle="" />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Featured Image */}
      {page.featuredImage && (
        <div className="relative w-full h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden">
          <Image
            src={page.featuredImage}
            alt={page.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                  {page.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={`container mx-auto px-4 py-12 max-w-4xl ${page.featuredImage ? '' : 'pt-8'}`}>
        {!page.featuredImage && (
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{page.title}</h1>
            {page.excerpt && (
              <p className="text-lg text-muted-foreground mb-6">{page.excerpt}</p>
            )}
          </div>
        )}

        {/* Rich Text Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Last Updated */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </>
  );
}
