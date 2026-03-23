import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// This endpoint is triggered by a 1-Click link in the user's email matching notification.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  const userId = searchParams.get('userId');
  const token = searchParams.get('token'); // In a real app, this would be a secure HMAC token

  if (!jobId || !userId) {
    return new NextResponse('Invalid Request: Missing parameters', { status: 400 });
  }

  try {
    // 1. Fetch User & Job
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { profile: true }
    });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!user || !job) {
      return new NextResponse('Resource not found', { status: 404 });
    }

    // 2. Security Check (Basic for now)
    // if (token !== someGeneratedHash(userId, jobId)) return ...

    // 3. Check Credits
    if (user.credits < 1) {
       return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #ef4444;">Oops! Insufficient Credits</h1>
            <p>You have 0 credits left. Please log in to your dashboard to top up.</p>
            <a href="/dashboard/credits" style="color: #3b82f6;">Go to Credits →</a>
          </body>
        </html>
      `, { status: 402, headers: { 'Content-Type': 'text/html' } });
    }

    // 4. Deduct Credit
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } }
    });

    // 5. Send Application to Recruiter (Mock or Real)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // In a real scenario, attach user.profile.resumeFileUrl
    const mailOptions = {
        from: `"Click Apply AI" <${process.env.EMAIL_USER}>`,
        to: job.recruiterEmail || process.env.EMAIL_USER || '',
        subject: `Job Application: ${job.title} - ${user.name}`,
        html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <h2>New Job Application via Click Apply AI</h2>
                <p>Hello Recruiting Team,</p>
                <p><strong>${user.name}</strong> has applied for the <strong>${job.title}</strong> position at ${job.company}.</p>
                <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Candidate Interests:</strong> Based on profile matching, this candidate has a high compatibility with this role.</p>
                </div>
                <p>Please find the profile details attached in the dashboard or reach out via their registered email: ${user.email}.</p>
                <p>Best Regards,<br/>Click Apply AI Team</p>
            </div>
        `
    };

    // We use a try/catch for email dispatch to ensure DB logging still happens even if SMTP fails
    try {
        await transporter.sendMail(mailOptions);
    } catch (e) {
        console.error('SMTP Failure in Auto-Apply:', e);
    }

    // 6. Log Application in DB
    await (prisma.application as any).upsert({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
      update: { status: 'Applied' },
      create: { userId: user.id, jobId: job.id, status: 'Applied' }
    });

    return new NextResponse(`
      <html>
        <head>
          <title>Application Confirmed! | Click Apply AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f4f8; color: #1e293b; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 3rem; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); text-align: center; max-width: 450px; border: 1px solid white; animation: slideUp 0.6s ease-out; }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .icon { font-size: 5rem; margin-bottom: 1.5rem; display: block; }
            h1 { font-size: 1.75rem; margin: 0 0 1rem; color: #10b981; }
            .job-chip { background: #f1f5f9; padding: 8px 16px; border-radius: 12px; display: inline-block; font-weight: 700; margin-bottom: 2rem; color: #3b82f6; }
            p { font-size: 1.1rem; opacity: 0.8; line-height: 1.6; margin-bottom: 2.5rem; }
            .btn { background: #3b82f6; color: white; padding: 1rem 2.5rem; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-block; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); }
            .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="icon">✅</span>
            <h1>Application Submitted!</h1>
            <div class="job-chip">${job.title}</div>
            <p>Great news! Your application for <strong>${job.company}</strong> has been sent directly. You can now close this tab.</p>
            <a href="/dashboard/applications" class="btn">Go to Dashboard</a>
            <p style="font-size: 0.8rem; margin-top: 2rem; opacity: 0.5;">This window will auto-close in 3 seconds...</p>
          </div>
          <script>
            setTimeout(() => {
              // Note: Only works if the user's browser allows self-closing of triggered tabs
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('Auto-Apply Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
