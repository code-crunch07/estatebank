/**
 * Script to verify property metadata is being generated correctly
 * Run with: npx tsx scripts/verify-metadata.ts <segment> <slug>
 * Example: npx tsx scripts/verify-metadata.ts residential sample-property
 */

import { connectToDatabase } from "../lib/mongoose";
import Property from "../models/property";
import { generateSlug } from "../lib/utils";

async function verifyMetadata(segment: string, slug: string) {
  try {
    await connectToDatabase();
    
    const properties = await Property.find({
      segment: segment.toLowerCase()
    }).lean();
    
    const property = properties.find((p: any) => {
      const propertySlug = generateSlug(p.name);
      return propertySlug === slug;
    });
    
    if (!property) {
      console.error(`Property not found: ${segment}/${slug}`);
      return;
    }
    
    // Get the best available image (prioritize featuredImage, then images array, then single image)
    // IMPORTANT: Filter out base64 data URIs as they cannot be used for social sharing
    let mainImage = "/logo.png";
    
    const isValidImageUrl = (url: string): boolean => {
      if (!url || !url.trim()) return false;
      // Reject base64 data URIs
      if (url.startsWith('data:')) return false;
      // Reject URLs containing base64 patterns
      if (url.includes('data:image')) return false;
      return true;
    };
    
    if ((property as any).featuredImage && isValidImageUrl((property as any).featuredImage)) {
      mainImage = (property as any).featuredImage.trim();
    } else if (Array.isArray(property.images) && property.images.length > 0) {
      // Find first valid image in array
      const validImage = property.images.find((img: string) => img && isValidImageUrl(img));
      if (validImage) {
        mainImage = validImage.trim();
      }
    } else if ((property as any).image && isValidImageUrl((property as any).image)) {
      mainImage = (property as any).image.trim();
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || (process.env.NODE_ENV === 'production' ? 'https://estatebank.in' : 'http://localhost:3000');
    
    const validBaseUrl = baseUrl || 'https://estatebank.in';
    
    let absoluteImageUrl = mainImage;
    if (mainImage.startsWith('http://') || mainImage.startsWith('https://')) {
      absoluteImageUrl = mainImage;
    } else {
      const cleanPath = mainImage.startsWith('/') ? mainImage : `/${mainImage}`;
      absoluteImageUrl = `${validBaseUrl}${cleanPath}`;
    }
    
    // Final validation - ensure URL is valid and doesn't contain undefined/null/base64
    if (!absoluteImageUrl || 
        absoluteImageUrl.includes('undefined') || 
        absoluteImageUrl.includes('null') ||
        absoluteImageUrl.includes('data:') ||
        absoluteImageUrl.includes('base64') ||
        !absoluteImageUrl.startsWith('http')) {
      absoluteImageUrl = `${validBaseUrl}/logo.png`;
    }
    
    absoluteImageUrl = absoluteImageUrl.replace(/([^:]\/)\/+/g, '$1');
    
    if (process.env.NODE_ENV === 'production' && absoluteImageUrl.startsWith('http://')) {
      absoluteImageUrl = absoluteImageUrl.replace('http://', 'https://');
    }
    
    const url = `${validBaseUrl}/properties/${segment}/${slug}`;
    
    console.log('\n=== Property Metadata Verification ===\n');
    console.log('Property Name:', property.name);
    console.log('Segment:', segment);
    console.log('Slug:', slug);
    console.log('\n--- Image URLs ---');
    console.log('Original Image Path:', mainImage);
    console.log('Absolute Image URL:', absoluteImageUrl);
    console.log('\n--- Meta Tags ---');
    console.log('Title:', `${property.name} - EstateBANK.in`);
    console.log('Description:', property.description || `${property.name} in ${property.location}`);
    console.log('URL:', url);
    console.log('\n--- Open Graph Tags ---');
    console.log('og:title:', property.name);
    console.log('og:description:', property.description || `${property.name} in ${property.location}`);
    console.log('og:image:', absoluteImageUrl);
    console.log('og:url:', url);
    console.log('\n--- Verification ---');
    console.log('Base URL:', validBaseUrl);
    console.log('Image URL Valid:', absoluteImageUrl.startsWith('http'));
    console.log('Image URL HTTPS:', absoluteImageUrl.startsWith('https'));
    console.log('Image URL Contains Base64:', absoluteImageUrl.includes('data:') || absoluteImageUrl.includes('base64'));
    console.log('\n--- Open Graph Meta Tags (for HTML) ---');
    console.log('<meta property="og:title" content="' + property.name + ' - EstateBANK.in" />');
    console.log('<meta property="og:description" content="' + (property.description || `${property.name} in ${property.location}`).replace(/"/g, '&quot;') + '" />');
    console.log('<meta property="og:image" content="' + absoluteImageUrl + '" />');
    console.log('<meta property="og:image:secure_url" content="' + absoluteImageUrl + '" />');
    console.log('<meta property="og:image:width" content="1200" />');
    console.log('<meta property="og:image:height" content="630" />');
    console.log('<meta property="og:image:type" content="image/jpeg" />');
    console.log('<meta property="og:url" content="' + url + '" />');
    console.log('<meta property="og:type" content="website" />');
    console.log('<meta property="og:site_name" content="EstateBANK.in" />');
    console.log('\n=== End Verification ===\n');
    
    // Test if image URL is accessible
    try {
      const response = await fetch(absoluteImageUrl, { method: 'HEAD' });
      console.log('Image Accessibility Test:');
      console.log('  Status:', response.status);
      console.log('  Accessible:', response.ok);
      if (!response.ok) {
        console.warn('  ⚠️  Image might not be accessible to social media crawlers!');
      }
    } catch (error) {
      console.warn('  ⚠️  Could not verify image accessibility:', error);
    }
    
  } catch (error) {
    console.error('Error verifying metadata:', error);
  } finally {
    process.exit(0);
  }
}

const segment = process.argv[2];
const slug = process.argv[3];

if (!segment || !slug) {
  console.error('Usage: npx tsx scripts/verify-metadata.ts <segment> <slug>');
  console.error('Example: npx tsx scripts/verify-metadata.ts residential sample-property');
  process.exit(1);
}

verifyMetadata(segment, slug);
