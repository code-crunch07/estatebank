import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Create response directly to avoid CORS '*' issue
  const response = NextResponse.json(
    { success: true, data: { message: 'Logged out successfully' } },
    { status: 200 }
  );
  
  // Delete cookie - must set with same attributes (especially SameSite=None) to properly delete
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
  const isSecure = protocol === 'https' || process.env.NODE_ENV === 'production';
  
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'none', // Must match login cookie settings
    path: '/',
    maxAge: 0, // Expire immediately
  });

  // Set CORS headers - never use '*' with cookies
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  // Reuse protocol from above (line 11) - no need to redeclare
  
  let allowedOrigin: string | null = null;
  if (origin) {
    allowedOrigin = origin;
  } else if (host) {
    allowedOrigin = `${protocol}://${host}`;
  }
  
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}


