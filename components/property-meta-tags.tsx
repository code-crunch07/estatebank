"use client";

import { useEffect } from "react";

interface PropertyMetaTagsProps {
  property: {
    name: string;
    description?: string;
    location: string;
    price?: string;
    featuredImage?: string;
    images?: string[];
    image?: string;
  };
  baseUrl?: string;
}

export function PropertyMetaTags({ property, baseUrl }: PropertyMetaTagsProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Safety check - ensure property has required fields
    if (!property || !property.name) {
      return;
    }

    try {
      // Helper function to validate image URLs (reject base64 data URIs)
      const isValidImageUrl = (url: string): boolean => {
        if (!url || !url.trim()) return false;
        // Reject base64 data URIs
        if (url.startsWith('data:')) return false;
        // Reject URLs containing base64 patterns
        if (url.includes('data:image')) return false;
        return true;
      };

      // Get the best available image
      let mainImage = "/logo.png";
      if (property.featuredImage && isValidImageUrl(property.featuredImage)) {
        mainImage = property.featuredImage.trim();
      } else if (Array.isArray(property.images) && property.images.length > 0) {
        // Find first valid image in array
        const validImage = property.images.find((img: string) => img && isValidImageUrl(img));
        if (validImage) {
          mainImage = validImage.trim();
        }
      } else if (property.image && isValidImageUrl(property.image)) {
        mainImage = property.image.trim();
      }

      // Convert to absolute URL
      const siteUrl = baseUrl || window.location.origin;
      let absoluteImageUrl = mainImage;
      
      if (mainImage.startsWith('http://') || mainImage.startsWith('https://')) {
        absoluteImageUrl = mainImage;
      } else {
        const cleanPath = mainImage.startsWith('/') ? mainImage : `/${mainImage}`;
        absoluteImageUrl = `${siteUrl}${cleanPath}`;
      }

      // Ensure HTTPS in production
      if (process.env.NODE_ENV === 'production' && absoluteImageUrl.startsWith('http://')) {
        absoluteImageUrl = absoluteImageUrl.replace('http://', 'https://');
      }

      // Clean up URL
      absoluteImageUrl = absoluteImageUrl.replace(/([^:]\/)\/+/g, '$1');
      
      // Final validation - reject base64 or invalid URLs
      if (absoluteImageUrl.includes('data:') || 
          absoluteImageUrl.includes('base64') || 
          !absoluteImageUrl.startsWith('http')) {
        absoluteImageUrl = `${siteUrl}/logo.png`;
      }

      const title = `${property.name} - EstateBANK.in`;
      const description = property.description || `${property.name} in ${property.location || 'Mumbai'}`;
      const url = window.location.href;

    // Function to update or create meta tag
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let tag = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Update Open Graph tags
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', absoluteImageUrl);
    setMetaTag('og:image:secure_url', absoluteImageUrl);
    setMetaTag('og:image:type', 'image/jpeg');
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
    setMetaTag('og:image:alt', property.name);
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'website');
    setMetaTag('og:site_name', 'EstateBANK.in');

    // Update Twitter tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', absoluteImageUrl, true);

    // Update page title
    document.title = title;

      // Update description meta tag
      setMetaTag('description', description, true);
    } catch (error) {
      // Silently fail - meta tags are not critical for page functionality
      console.error('Error updating meta tags:', error);
    }
  }, [property, baseUrl]);

  return null;
}
