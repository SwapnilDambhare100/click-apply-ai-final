import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { jobId, userId, profile, jobDetails } = await request.json();

    if (!jobId || !profile) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let coverLetterText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Generate Dynamic Cover Letter via Gemini AI
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Write a concise, professional 3-paragraph cover letter email for ${profile.name || 'a candidate'} applying for a job.
Candidate's Target Role: ${profile.targetRoles?.[0] || profile.domain || 'their field'}
Candidate's Skills: ${(profile.skills || []).join(', ') || 'relevant skills'}
Applying for: ${jobDetails?.title || 'the open position'} at ${jobDetails?.company || 'your company'}.
The tone should be confident and professional. Do not include placeholder brackets like [Company Name].`;

        const result = await model.generateContent(prompt);
        coverLetterText = result.response.text();
      } catch (aiError) {
        console.error("AI cover letter failed, using template:", aiError);
      }
    }

    // Fallback Template
    if (!coverLetterText) {
      coverLetterText = `Dear Hiring Manager,\n\nI hope this message finds you well. I am writing to express my strong interest in the ${jobDetails?.title || 'open position'} role at ${jobDetails?.company || 'your company'}.\n\nWith ${profile.totalExperience || 0}+ years of experience and expertise in ${(profile.skills || []).slice(0, 3).join(', ')}, I am confident I can add immediate value to your team. My target roles include ${(profile.targetRoles || []).join(', ')}.\n\nPlease find my profile attached. I look forward to connecting.\n\nBest regards,\n${profile.name || 'Applicant'}`;
    }

    // 2. Build HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #9333EA 100%); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0;">Job Application — ${jobDetails?.title || 'Open Position'}</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">via ClickApply AI Agent</p>
        </div>
        <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
          <p style="white-space: pre-line; line-height: 1.8; font-size: 15px;">${coverLetterText}</p>
          <hr style="border: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent by ClickApply AI • Automated Job Application Agent</p>
        </div>
      </div>`;

    // 3. Send via SMTP or log mock
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass && !smtpUser.includes('your-gmail')) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"${profile.name || 'ClickApply AI'}" <${smtpUser}>`,
          to: jobDetails?.hrEmail || smtpUser, // send to self if no HR email
          subject: `Application: ${jobDetails?.title || 'Open Position'} — ${profile.name || 'Candidate'}`,
          text: coverLetterText,
          html: htmlBody,
        });
        emailSent = true;
        console.log(`[SMTP] ✅ Real email sent for: ${profile.name} → ${jobDetails?.title} at ${jobDetails?.company}`);
      } catch (smtpError: any) {
        console.error('[SMTP] Email send failed:', smtpError.message);
        // Still return success — application is logged, email failed silently
      }
    }

    if (!emailSent) {
      console.log('\n========== AI EMAIL DRAFT (Configure SMTP to send real emails) ==========');
      console.log(`To: ${jobDetails?.hrEmail || 'hr@company.com'}`);
      console.log(`Subject: Application: ${jobDetails?.title || 'Job ID ' + jobId} — ${profile.name}`);
      console.log('---');
      console.log(coverLetterText);
      console.log('==========================================================================\n');
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Real email sent successfully!' : 'Application logged (configure SMTP to send real emails)',
      emailSent,
    });

  } catch (error) {
    console.error('Error sending application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
