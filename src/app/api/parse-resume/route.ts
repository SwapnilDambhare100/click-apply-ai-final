import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Smart Regex-Based Fallback Parser ---
function parseResumeLocally(text: string) {
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract name: typically first 1-3 words on a line near the top (before email/summary)
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  let name = '';
  for (const line of lines.slice(0, 10)) {
    // Skip lines with @, numbers, or keywords
    if (!/[@0-9:|•]/.test(line) && /^[A-Za-z\s]{4,40}$/.test(line.trim())) {
      name = line.trim();
      break;
    }
  }

  // Extract years of experience
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
  const totalExperience = expMatch ? parseInt(expMatch[1]) : 0;

  // Common skills keyword list to scan for
  const skillKeywords = [
    'JavaScript','TypeScript','Python','Java','C++','C#','React','Next.js','Node.js',
    'Vue','Angular','SQL','MongoDB','PostgreSQL','MySQL','AWS','Azure','GCP','Docker',
    'Kubernetes','Git','REST','GraphQL','SAP','ERP','Vendor Management','Supply Chain',
    'Procurement','Logistics','Negotiation','Communication','Leadership','Project Management',
    'Excel','Power BI','Tableau','Machine Learning','Data Analysis','Agile','Scrum',
    'ServiceNow','Salesforce','Contracts','Budgeting','Forecasting','Operations',
    'HR','Recruitment','Marketing','SEO','Finance','Accounting','Customer Service',
    'Indirect Procurement','Direct Procurement','Category Management','Sourcing',
  ];
  const textLower = text.toLowerCase();
  const skills = skillKeywords.filter(skill => textLower.includes(skill.toLowerCase()));

  // Extract likely target roles based on text sections
  const roleKeywords = [
    'Software Engineer','Frontend Developer','Backend Developer','Full Stack Developer',
    'Product Manager','Project Manager','Procurement Specialist','Supply Chain Manager',
    'Data Analyst','Data Scientist','DevOps Engineer','Cloud Engineer','HR Manager',
    'Business Analyst','Marketing Manager','Operations Manager','Finance Manager',
    'Category Manager','Sourcing Manager','Indirect Procurement Lead',
  ];
  const targetRoles = roleKeywords.filter(role => textLower.includes(role.toLowerCase()));

  return {
    personalInfo: { name: name || 'See resume', email, phone },
    skills: skills.length > 0 ? skills : ['Please check resume manually'],
    totalExperience,
    targetRoles: targetRoles.length > 0 ? targetRoles : ['General Professional'],
  };
}

// Helper: extract text from PDF using pdf2json (pure JS, no native deps)
function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const PDFParser = require('pdf2json');
    const parser = new PDFParser(null, 1);
    
    parser.on('pdfParser_dataError', (err: any) => reject(new Error(err?.parserError || 'PDF parsing failed')));
    parser.on('pdfParser_dataReady', () => {
      try {
        const rawText = (parser as any).getRawTextContent();
        resolve(rawText || '');
      } catch (e) {
        reject(e);
      }
    });
    
    parser.parseBuffer(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    let extractedText = '';

    // Step 1: Extract raw text
    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      extractedText = await extractPdfText(buffer);
    } else if (fileName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const mammoth = require('mammoth');
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file. Please upload a PDF or DOCX file.' }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Could not extract text. Try a text-based PDF or DOCX (not scanned image).' }, { status: 400 });
    }

    // Step 2: Try Gemini AI if key is available and valid
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are an expert HR resume parser. Extract the following from the resume text and return ONLY raw JSON (no markdown, no code fences):\n{\n  "personalInfo": { "name": "...", "email": "...", "phone": "..." },\n  "skills": ["skill1", "skill2"],\n  "totalExperience": <number>,\n  "targetRoles": ["role1", "role2"]\n}\nResume Text:\n"""\n${extractedText.slice(0, 6000)}\n"""`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(responseText);
        return NextResponse.json({ data: parsedData });
      } catch (aiErr: any) {
        console.warn('[PARSE API] Gemini failed, falling back to regex parser:', aiErr.message);
        // Fall through to local parser
      }
    }

    // Step 3: Smart local regex parser (works without Gemini key)
    console.log('[PARSE API] Using smart local regex parser on actual resume text.');
    const localParsed = parseResumeLocally(extractedText);
    return NextResponse.json({
      data: localParsed,
      warning: 'AI parsing unavailable. Add a valid GEMINI_API_KEY to .env.local for better results.'
    });

  } catch (error: any) {
    console.error('[PARSE API] Critical error:', error?.message || error);
    return NextResponse.json({ error: `Parsing failed: ${error?.message || 'Unknown error'}` }, { status: 500 });
  }
}
