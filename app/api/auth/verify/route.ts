import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/auth/verify
 * Verify httpOnly cookie and return user data
 * 
 * This endpoint verifies the auth_token cookie and returns:
 * - authenticated: boolean
 * - user: { id, email, name, role } (if authenticated)
 * 
 * Always returns 200 status - authentication state is data, not an error.
 * This prevents redirect loops when checking res.ok vs data.authenticated.
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth_token cookie
    const token = request.cookies.get('auth_token')?.value;
    
    // Debug: Log cookie presence (remove in production if needed)
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(c => c.name === 'auth_token');
    
    if (!token) {
      // Not authenticated - return 200 with authenticated: false
      // Include debug info in development
      const debugInfo = process.env.NODE_ENV === 'development' ? {
        cookiePresent: hasAuthCookie,
        cookieCount: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
      } : undefined;
      
      return successResponse({ 
        authenticated: false,
        ...(debugInfo && { debug: debugInfo })
      });
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Authenticated - return 200 with authenticated: true and user data
      return successResponse({
        authenticated: true,
        user: {
          id: decoded.userId || decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      });
    } catch (error) {
      // Invalid or expired token - return 200 with authenticated: false
      return successResponse({ authenticated: false });
    }
  } catch (error: any) {
    console.error('Auth verify error:', error);
    // Only return error status for actual server errors
    return errorResponse('Failed to verify authentication', 500);
  }
}
