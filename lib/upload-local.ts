/**
 * Local file upload - saves images to public/uploads directory
 * Files are served at /uploads/{folder}/{filename}
 */

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_BASE = process.env.UPLOAD_PATH || path.join(process.cwd(), 'public', 'uploads');

/**
 * Save base64 image to local filesystem
 * @param base64 - Base64 encoded image (data:image/...)
 * @param folder - Subfolder within uploads (e.g. 'properties/featured', 'team-members')
 * @param publicId - Optional filename (without extension). Auto-generated if not provided.
 * @returns URL path for the saved file (e.g. /uploads/properties/featured/abc123.jpg)
 */
export async function uploadBase64ToLocal(
  base64: string,
  folder: string,
  publicId?: string
): Promise<string> {
  if (!base64 || !base64.startsWith('data:image')) {
    throw new Error('Invalid base64 image format');
  }

  // Parse base64 to get format and data
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = Buffer.from(matches[2], 'base64');

  // Generate filename
  const filename = publicId
    ? `${publicId}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  // Full path: public/uploads/{folder}/{filename}
  const dirPath = path.join(UPLOAD_BASE, folder);
  const filePath = path.join(dirPath, filename);

  // Create directory if it doesn't exist
  await mkdir(dirPath, { recursive: true });

  // Write file
  await writeFile(filePath, data);

  // Return URL path (relative to site root)
  const urlPath = `/uploads/${folder}/${filename}`.replace(/\/+/g, '/');
  return urlPath;
}
