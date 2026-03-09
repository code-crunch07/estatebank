import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { successResponse, errorResponse } from '@/lib/api-utils';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User Schema
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'agent'], default: 'admin' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user
    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password - use bcrypt.compare directly to avoid method attachment issues
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Create response with cookie FIRST, then add CORS headers
    // This ensures the cookie is properly set before headers are finalized
    const response = NextResponse.json(
      { success: true, data: { user: userData, token } },
      { status: 200 }
    );

    // Set httpOnly cookie with explicit path
    // CRITICAL: For HTTPS sites, secure must be true
    // Detect HTTPS from request headers (works behind reverse proxy)
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.url.startsWith('https://') ? 'https' : 'http');
    const isSecure = protocol === 'https' || process.env.NODE_ENV === 'production';
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: isSecure, // Must be true for HTTPS sites (browsers reject insecure cookies on HTTPS)
      sameSite: 'none', // REQUIRED: Allows cookie to be sent in RSC requests, fetch(), and cross-site contexts
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // Explicit path - required for cookie to work across all routes
    };
    
    // Don't set domain - let browser handle it (works for both www and non-www)
    // Setting domain explicitly can cause issues if accessed via different subdomains
    
    response.cookies.set('auth_token', token, cookieOptions);

    // Add CORS headers AFTER setting cookie
    // CRITICAL: Cannot use '*' with credentials - browsers will reject cookies
    // Always use specific origin, never '*'
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Determine the allowed origin (reuse protocol from above)
    let allowedOrigin: string | null = null;
    if (origin) {
      allowedOrigin = origin;
    } else if (host) {
      // Fallback: construct from host header using protocol already determined above
      allowedOrigin = `${protocol}://${host}`;
    }
    
    // Set CORS headers only if we have a valid origin (never use '*')
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');
    }
    
    // Always set these headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed', 500);
  }
}

// POST /api/auth/create-admin - Create admin user (one-time setup)
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password, name, secretKey } = body;

    // Require secret key for security
    if (secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return errorResponse('Unauthorized', 401);
    }

    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User already exists', 400);
    }

    // Create admin user
    const user = new User({
      email,
      password,
      name,
      role: 'admin',
      status: 'active',
    });

    await user.save();

    return successResponse({ message: 'Admin user created successfully' }, 201);
  } catch (error: any) {
    console.error('Create admin error:', error);
    return errorResponse(error.message || 'Failed to create admin user', 500);
  }
}


