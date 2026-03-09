/**
 * Client-side safe Cloudinary utilities
 * These functions only manipulate URLs and don't require the Cloudinary SDK
 * Safe to use in client components
 */

/**
 * Check if a string is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Check if a string is a base64 image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image');
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param url - Cloudinary URL
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | string;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original if not Cloudinary URL
  }

  // Extract segments after /upload/ to detect existing transformations
  // Cloudinary URL structure: /upload/[TRANSFORMATIONS]/[vVERSION]/folder/file.jpg
  // Check if URL already has transformations
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const afterUpload = url.substring(uploadIndex + 8); // +8 for '/upload/'
  const segments = afterUpload.split('/');
  
  if (segments.length > 0) {
    const firstSegment = segments[0];
    
    // Check if first segment is a transformation
    // Transformations contain: numbers, x, underscores, commas, transformation prefixes
    const isVersionNumber = /^v\d+$/i.test(firstSegment);
    const isTransformation = !isVersionNumber && (
      firstSegment.includes('_') || 
      firstSegment.includes(',') ||
      /^\d+x\d+/.test(firstSegment) || // e.g., "1920x1080"
      /^w_\d+/.test(firstSegment) ||   // e.g., "w_600"
      /^h_\d+/.test(firstSegment) ||   // e.g., "h_400"
      firstSegment.includes('c_') ||
      firstSegment.includes('q_') ||
      firstSegment.includes('f_')
    );
    
    if (isTransformation) {
      // Already has transformations - return as-is to avoid double transformation
      return url;
    }
  }

  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

  const transformations: string[] = [];

  // Cloudinary prefers w_WIDTH,h_HEIGHT format over WIDTHxHEIGHT
  if (width && height) {
    transformations.push(`w_${width}`, `h_${height}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }

  if (crop) {
    transformations.push(`c_${crop}`);
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  if (format) {
    transformations.push(`f_${format}`);
  }

  if (transformations.length === 0) {
    return url;
  }

  // Insert transformations into Cloudinary URL
  const transformString = transformations.join(',');
  
  // Replace /upload/ with /upload/TRANSFORMATIONS/
  // But if there's already a version number right after /upload/, insert before it
  if (url.match(/\/upload\/v\d+\//i)) {
    // Has version number - insert transformations before version
    return url.replace(/\/upload\/(v\d+\/)/i, `/upload/${transformString}/$1`);
  }
  
  // No version number - just add transformations
  return url.replace('/upload/', `/upload/${transformString}/`);
}
