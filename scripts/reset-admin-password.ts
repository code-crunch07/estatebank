import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables
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

async function resetAdminPassword() {
  try {
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
    
    console.log('📧 Resetting password for:', adminEmail);
    console.log('🔑 New password:', adminPassword);

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Update admin user
    const result = await mongoose.connection.collection('users').updateOne(
      { email: adminEmail },
      { 
        $set: { 
          password: hashedPassword, 
          status: 'active' 
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️  No user found with email:', adminEmail);
      console.log('   Creating new admin user...');
      
      // Create new admin if doesn't exist
      const adminName = process.env.ADMIN_NAME_CREATE || process.env.ADMIN_NAME || 'Admin User';
      await mongoose.connection.collection('users').insertOne({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Password reset successfully!');
      console.log('   Matched:', result.matchedCount, 'Modified:', result.modifiedCount);
    }

    console.log('');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
