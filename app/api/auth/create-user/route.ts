import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { successResponse, errorResponse } from '@/lib/api-utils';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema (same as login route)
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// POST /api/auth/create-user - Create user with role (for team member dashboard access)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password, name, role = 'agent' } = body;

    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'agent'];
    if (!validRoles.includes(role)) {
      return errorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role,
      status: 'active',
    });

    await user.save();

    return successResponse({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    }, 201);
  } catch (error: any) {
    console.error('Create user error:', error);
    return errorResponse(error.message || 'Failed to create user', 500);
  }
}
