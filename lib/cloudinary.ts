import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload a base64 image to Cloudinary
 * @param base64 - Base64 encoded image string (data:image/...)
 * @param folder - Cloudinary folder path
 * @param publicId - Optional public ID for the image
 * @returns Cloudinary secure URL
 */
export async function uploadBase64ToCloudinary(
  base64: string,
  folder: string,
  publicId?: string
): Promise<string> {
  if (!base64 || !base64.startsWith('data:image')) {
    throw new Error('Invalid base64 image format');
  }

  try {
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'auto',
      overwrite: false,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(base64, uploadOptions);
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - Image buffer
 * @param folder - Cloudinary folder path
 * @param publicId - Optional public ID for the image
 * @returns Cloudinary secure URL
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'auto',
      overwrite: false,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed: No result'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID or URL
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    // Extract public_id from URL if full URL is provided
    let id = publicId;
    if (publicId.includes('cloudinary.com')) {
      const matches = publicId.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
      if (matches) {
        id = `${matches[1]}/${matches[2]}/${matches[3].replace(/\.[^/.]+$/, '')}`;
      }
    }

    await cloudinary.uploader.destroy(id);
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
}

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
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url; // Return original if not Cloudinary URL
  }

  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

  const transformations: string[] = [];

  if (width || height) {
    const size = width && height ? `${width}x${height}` : width ? `w_${width}` : `h_${height}`;
    transformations.push(size);
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
  return url.replace('/upload/', `/upload/${transformString}/`);
}

export { cloudinary };