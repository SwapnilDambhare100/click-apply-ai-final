import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { toEmail, jobTitle, company, applicantName, applicantEmail, matchScore, jobId } = await request.json();

    if (!toEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    // Configure the SMTP transporter (requires EMAIL_USER and EMAIL_PASS in .env.local)
    const userEmail = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(90deg, #4f46e5, #8b5cf6); padding: 25px 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Application for ${jobTitle}</h2>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Dear Hiring Team at <strong>${company}</strong>,</p>
          <p style="font-size: 16px;">I am writing to express my strong interest in the <strong>${jobTitle}</strong> position. Based on a comprehensive AI analysis of the job requirements and my background experience, my profile has been directly identified as a <strong>${matchScore}% match</strong> for this role.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #4f46e5; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Candidate Highlights</h3>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Expertise:</strong> 8+ years driving cross-functional success and scaling enterprise solutions.</li>
              <li style="margin-bottom: 10px;"><strong>Skills alignment:</strong> Deep mastery of your required technical, structural, and leadership competencies.</li>
              <li><strong>Readiness:</strong> Currently exploring top-tier opportunities and available for an immediate interview.</li>
            </ul>
          </div>

          <p style="font-size: 16px;">I have attached my digital resume for your extensive review. I firmly believe my history of delivering impactful results will make me a powerful asset to the ${company} team.</p>
          
          <p style="font-size: 16px; margin-bottom: 30px;">Thank you for your time and consideration.</p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="margin-bottom: 5px; font-size: 16px;">Best regards,</p>
            <strong style="font-size: 18px; color: #0f172a;">${applicantName}</strong><br/>
            <a href="mailto:${applicantEmail}" style="color: #4f46e5; text-decoration: none;">${applicantEmail}</a><br/>
            <br/>
            <span style="font-size: 12px; color: #64748b; margin-top: 15px; display: inline-block; background: #f1f5f9; padding: 5px 10px; border-radius: 4px;">
              🚀 <em>This application was securely facilitated via ClickApplyAI Automated Matching.</em>
            </span>
          </div>
        </div>
      </div>
    `;

    // 1. Persist to DB if jobId and applicantEmail are provided
    if (jobId && applicantEmail) {
      try {
        const u = await prisma.user.findUnique({ where: { email: applicantEmail } });
        if (u) {
          await prisma.application.upsert({
            where: { userId_jobId: { userId: u.id, jobId: jobId } },
            update: { status: 'Applied', dateApplied: new Date() },
            create: { userId: u.id, jobId: jobId, status: 'Applied' }
          });
        }
      } catch (dbErr) {
        console.error('DB Persistence Error:', dbErr);
      }
    }

    const isPlaceholder = userEmail === 'your_email@gmail.com' || pass === 'your_app_password';

    if (!userEmail || !pass || isPlaceholder) {
      return NextResponse.json({ 
        success: true, 
        message: 'Draft generated successfully (DB tracked).',
        draft: emailHtml
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: userEmail, pass }
    });

    const sendPromise = transporter.sendMail({
      from: `"${applicantName} (via ClickApplyAI)" <${userEmail}>`,
      to: toEmail,
      subject: `Job Application: ${jobTitle} - ${applicantName}`,
      html: emailHtml
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP Timeout - took more than 3 seconds')), 3000)
    );

    const info: any = await Promise.race([sendPromise, timeoutPromise]);

    return NextResponse.json({ success: true, message: 'Email sent successfully', draft: emailHtml, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
