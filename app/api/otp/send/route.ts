import { NextRequest, NextResponse } from "next/server";

// In-memory OTP storage (in production, use Redis or database)
// Format: { phone: { otp: string, expiresAt: number, attempts: number } }
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// OTP Configuration
const OTP_EXPIRY_MINUTES = 5; // OTP expires in 5 minutes
const MAX_ATTEMPTS = 3; // Maximum verification attempts
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via SMS (placeholder - integrate with SMS service)
 * In production, integrate with:
 * - Twilio: https://www.twilio.com/
 * - AWS SNS: https://aws.amazon.com/sns/
 * - MSG91: https://msg91.com/ (India)
 * - TextLocal: https://www.textlocal.in/ (India)
 */
async function sendOTPviaSMS(phone: string, otp: string): Promise<boolean> {
  try {
    // Format phone number (add country code if needed)
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    
    // TODO: Integrate with your SMS service provider
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    await client.messages.create({
      body: `Your EstateBANK.in OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    */
    
    // OTP codes must NEVER be logged for security reasons
    // In development, OTP is returned in API response only (see line 126)
    // In production, OTP is sent via SMS service only
    
    // Simulate SMS sending (remove in production)
    // In production, return true only if SMS was actually sent
    return true;
  } catch (error) {
    console.error("Error sending OTP via SMS:", error);
    return false;
  }
}

/**
 * POST /api/otp/send - Send OTP to phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validate phone number
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits for India)
    const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit phone number" },
        { status: 400 }
      );
    }

    // Check if OTP was recently sent (rate limiting)
    const existingOTP = otpStore.get(cleanPhone);
    if (existingOTP && existingOTP.expiresAt > Date.now()) {
      const remainingSeconds = Math.ceil((existingOTP.expiresAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait before requesting a new OTP. You can request again in ${Math.ceil(remainingSeconds / 60)} minute(s)`,
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP
    otpStore.set(cleanPhone, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send OTP via SMS
    const smsSent = await sendOTPviaSMS(cleanPhone, otp);

    if (!smsSent) {
      otpStore.delete(cleanPhone);
      return NextResponse.json(
        { success: false, error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Clean up expired OTPs (optional - can be done via cron job)
    cleanupExpiredOTPs();

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      // In development, include OTP in response (remove in production)
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error: any) {
    console.error("Error in send OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}

/**
 * Clean up expired OTPs from memory
 */
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}

// Clean up expired OTPs every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
}

