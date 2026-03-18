import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobId, userId, profile } = await request.json();

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Simulate automated email preparation & sending
    await new Promise(resolve => setTimeout(resolve, 2000));

    const emailDraft = `
Subject: Application for Job ID ${jobId}

Dear Hiring Manager,

I hope you are doing well.

I came across the opportunity and would like to express my interest in the position. With my experience in ${profile?.domain || 'my field'} and skills such as ${profile?.skills?.slice(0, 2).join(', ') || 'relevant areas'}, I believe my profile aligns perfectly with your requirements.

Please find my resume attached for your review.

Thank you for your time and consideration.

Best regards,
${profile?.name || 'Applicant'}
    `;

    // MOCKED EMAIL SYSTEM: Log the email to the console instead of sending real email
    console.log("=================== EMAIL SENT ===================");
    console.log(`To: hr@company.com (Mocked)`);
    console.log(emailDraft);
    console.log(`[Attachment]: Resume.pdf (Mocked)`);
    console.log("==================================================");

    // Mock Credit Deduction (Assume successful deduction)
    const creditsDeducted = 1;

    return NextResponse.json({
      success: true,
      message: 'Application email sent successfully',
      creditsDeducted
    });
  } catch (error) {
    console.error('Error sending application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
