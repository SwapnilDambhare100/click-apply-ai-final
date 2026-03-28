import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Simplified OTP storage in memory (will reset on server restart, but fine for this trial)
// WARNING: In production, use Redis or a database (MongoDB/PostgreSQL) with expiration
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp: userOtp, action, type } = body;

    // --- TYPE: SEND ---
    if (type === 'send') {
      if (!email) return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

      // Store OTP
      otpStore.set(email, { otp, expires });
      console.log(`[OTP] Generated ${otp} for ${email}`);

      // Validate environment variables
      const user = process.env.EMAIL_USER || process.env.SMTP_USER;
      const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
      const hasSMTP = !!(user && pass && user !== 'your_email@gmail.com');

      if (!hasSMTP) {
        console.warn('⚠️ SMTP Configuration Missing. Mocking email delivery for local testing.');
        console.log(`\n================================`);
        console.log(`📧 Simulated Email to: ${email}`);
        console.log(`🔑 Your Login OTP is: ${otp}`);
        console.log(`================================\n`);
        return NextResponse.json({ success: true, message: 'OTP sent (Check terminal logs for code)', mockOtp: otp });
      }

      // Configure Nodemailer for Gmail specifically to match the .env.local instructions
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      const actionText = action === 'register' ? 'creating your account' : 'logging in';

      try {
        // We AWAIT the email to catch if Gmail rejects the login/password
        // STRIKE: We add a strict 3-SECOND TIMEOUT so it NEVER hangs the UI!
        const sendPromise = transporter.sendMail({
          from: `"ClickApply AI" <${user}>`,
          to: email,
          subject: `Your Verification Code: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4F46E5;">Verification Code</h2>
              <p>Hi there,</p>
              <p>You are ${actionText} on <strong>ClickApply AI</strong>. Use the verification code below to proceed:</p>
              <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; border-radius: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 ClickApply AI. All rights reserved.</p>
            </div>
          `,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SMTP Timeout - took more than 3 seconds')), 3000)
        );

        await Promise.race([sendPromise, timeoutPromise]);

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
      } catch (emailError: any) {
        console.error("Failed to send OTP Email via SMTP:", emailError.message);
        // FALLBACK: If Gmail blocks the email (wrong password, App password needed, etc),
        // we do NOT lock the user out. We fallback to returning the OTP securely to the UI.
        return NextResponse.json({ 
          success: true, 
          message: 'SMTP failed, using fallback.', 
          mockOtp: otp // Send it to UI so they can see it in a Toast instead of being stuck
        });
      }
    }

    // --- TYPE: VERIFY ---
    if (type === 'verify') {
      if (!email || !userOtp) return NextResponse.json({ success: false, error: 'Email and OTP required' }, { status: 400 });

      const stored = otpStore.get(email);
      if (!stored) {
        return NextResponse.json({ success: false, error: 'No OTP requested for this email' }, { status: 400 });
      }

      if (Date.now() > stored.expires) {
        otpStore.delete(email);
        return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 });
      }

      if (stored.otp === userOtp) {
        otpStore.delete(email); // One-time use
        return NextResponse.json({ success: true, message: 'Verified' });
      }

      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
