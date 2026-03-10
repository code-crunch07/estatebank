/**
 * Serves uploaded files from UPLOAD_PATH (or public/uploads)
 * Handles /api/uploads/properties/gallery/file.jpg etc.
 * Used when static serving from public/ fails (e.g. UPLOAD_PATH outside public, standalone build)
 */

import { NextRequest } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_BASE = process.env.UPLOAD_PATH || path.join(process.cwd(), 'public', 'uploads');

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const pathSegments = (await params).path;
    if (!pathSegments || pathSegments.length === 0) {
      return new Response('Not found', { status: 404 });
    }

    // Prevent path traversal
    const safePath = pathSegments.join('/').replace(/\.\./g, '');
    if (safePath !== pathSegments.join('/')) {
      return new Response('Forbidden', { status: 403 });
    }

    const filePath = path.join(UPLOAD_BASE, safePath);
    const resolvedPath = path.resolve(filePath);

    // Ensure we're still inside UPLOAD_BASE
    const uploadBaseResolved = path.resolve(UPLOAD_BASE);
    if (!resolvedPath.startsWith(uploadBaseResolved)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!existsSync(resolvedPath)) {
      return new Response('Not found', { status: 404 });
    }

    const file = await readFile(resolvedPath);
    const ext = path.extname(resolvedPath).slice(1).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    return new Response(file, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
