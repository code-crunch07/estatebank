import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Middleware to protect dashboard routes
 * Verifies httpOnly cookie before allowing access
 * Uses jose library (Edge Runtime compatible) instead of jsonwebtoken
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Diagnostic logging - TEMPORARY
    const allCookies = request.cookies.getAll();
    console.error('[Middleware] Dashboard access attempt:', {
      pathname,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
    
    if (!token) {
      // No token - redirect to login
      console.error('[Middleware] No token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token using jose (Edge Runtime compatible)
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      
      // Temporary diagnostic logging (remove after fixing)
      if (!process.env.JWT_SECRET) {
        console.error('[Middleware] WARNING: JWT_SECRET not set, using fallback');
      }
      
      // jose uses TextEncoder for secret - convert string to Uint8Array
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secretKey);
      
      // Token valid - allow access
      return NextResponse.next();
    } catch (error: any) {
      // Invalid or expired token - redirect to login
      // DO NOT delete cookie here - only delete on explicit logout
      // Log error for debugging - TEMPORARY for diagnosis
      const errorDetails = {
        error: error.message || error.name || 'Unknown error',
        errorType: error.constructor?.name || 'Unknown',
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        jwtSecretPreview: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'NOT SET',
      };
      console.error('[Middleware] JWT verification failed:', JSON.stringify(errorDetails, null, 2));
      
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and trying to access login page, redirect to dashboard
  if (pathname === '/login' && token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secretKey);
      // Valid token - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch {
      // Invalid token - allow login page
      return NextResponse.next();
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};
