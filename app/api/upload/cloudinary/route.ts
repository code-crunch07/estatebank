import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64ToCloudinary } from '@/lib/cloudinary';
import { errorResponse, successResponse } from '@/lib/api-utils';

/**
 * POST /api/upload/cloudinary
 * Upload base64 image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64, folder, publicId } = body;

    if (!base64) {
      return errorResponse('Base64 image is required', 400);
    }

    if (!base64.startsWith('data:image')) {
      return errorResponse('Invalid base64 image format', 400);
    }

    const folderPath = folder || 'uploads';
    const cloudinaryUrl = await uploadBase64ToCloudinary(base64, folderPath, publicId);

    return successResponse({
      url: cloudinaryUrl,
      folder: folderPath,
    });
  } catch (error: any) {
    console.error('Cloudinary upload API error:', error);
    return errorResponse(error.message || 'Failed to upload image', 500);
  }
}
