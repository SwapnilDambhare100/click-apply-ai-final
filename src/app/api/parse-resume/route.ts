import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resume = formData.get('resume') as File | null;

    if (!resume) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    // Simulate AI parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mocked AI Extracted Profile Data
    const mockExtractedData = {
      name: "John Doe",
      domain: "Procurement & Supply Chain",
      experience: 5,
      skills: ["Vendor Management", "Negotiation", "Supplier Development", "Cost Optimization"],
      extractedText: "Experienced professional with 5 years in procurement, vendor negotiation, and supply chain...",
    };

    return NextResponse.json({
      success: true,
      data: mockExtractedData,
      message: 'Resume parsed successfully using AI Mock'
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
