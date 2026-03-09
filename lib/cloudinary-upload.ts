/**
 * Client-side utility for uploading images to Cloudinary
 * This can be used in React components
 */

/**
 * Upload a file to Cloudinary via API
 * @param file - File object from input
 * @param folder - Cloudinary folder path
 * @returns Cloudinary URL
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  // Convert file to base64
  const base64 = await fileToBase64(file);

  // Upload via API
  const response = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64,
      folder,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.data.url;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if URL is already a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Check if string is base64 image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image');
}
