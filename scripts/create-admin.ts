import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables - check .env.production first (for Docker/production), then .env.local (for local dev)
const envProduction = resolve(process.cwd(), '.env.production');
const envLocal = resolve(process.cwd(), '.env.local');

if (existsSync(envProduction)) {
  console.log('📄 Loading environment from .env.production');
  config({ path: envProduction });
} else if (existsSync(envLocal)) {
  console.log('📄 Loading environment from .env.local');
  config({ path: envLocal });
} else {
  console.log('⚠️  No .env.production or .env.local found, using system environment variables');
  config(); // Load from system env
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'agent'], default: 'admin' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Get admin details from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL_CREATE || process.env.ADMIN_EMAIL || 'admin@estatebank.in';
    const adminPassword = process.env.ADMIN_PASSWORD_CREATE || process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME_CREATE || process.env.ADMIN_NAME || 'Admin User';
    
    console.log('📧 Creating admin with email:', adminEmail);
    console.log('👤 Admin name:', adminName);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      console.log('   To create a new admin, use a different email or delete the existing one.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      status: 'active',
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  Store these credentials securely!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   User with this email already exists');
    }
    process.exit(1);
  }
}

createAdmin();

