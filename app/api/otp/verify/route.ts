import { NextRequest, NextResponse } from "next/server";

// Import the same OTP store (in production, use Redis or database)
// This should be shared with send route - for now using same in-memory approach
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

/**
 * POST /api/otp/verify - Verify OTP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    // Validate inputs
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { success: false, error: "OTP is required" },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanOTP = otp.replace(/\D/g, ""); // Remove non-digits

    // Validate OTP format
    if (cleanOTP.length !== 6) {
      return NextResponse.json(
        { success: false, error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedData = otpStore.get(cleanPhone);

    if (!storedData) {
      return NextResponse.json(
        { success: false, error: "OTP not found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Check if OTP expired
    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(cleanPhone);
      return NextResponse.json(
        { success: false, error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(cleanPhone);
      return NextResponse.json(
        { success: false, error: "Maximum verification attempts exceeded. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (storedData.otp !== cleanOTP) {
      storedData.attempts += 1;
      const remainingAttempts = 3 - storedData.attempts;
      
      return NextResponse.json(
        {
          success: false,
          error: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : "Please request a new OTP."}`,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    // Remove OTP from store (one-time use)
    otpStore.delete(cleanPhone);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error: any) {
    console.error("Error in verify OTP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

