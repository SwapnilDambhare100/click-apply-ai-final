import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// --- Smart Regex-Based Fallback Parser (Enhanced) ---
function parseResumeLocally(text: string) {
  const textLower = text.toLowerCase();
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  // 1. Extract Email
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extract Phone
  const phoneRegex = /(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extract Name (Top of file strategy)
  let name = '';
  for (const line of lines.slice(0, 15)) {
    if (!/[@0-9:|•]/.test(line) && /^[A-Za-z\s]{5,35}$/.test(line)) {
      name = line;
      break;
    }
  }

  // 4. Extract Total Experience (Quantified)
  const expRegex = /(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp|working)/i;
  const expMatch = text.match(expRegex);
  const totalExperience = expMatch ? parseInt(expMatch[1]) : 0;

  // 5. Broad Technical & Soft Skill Detection
  const techStacks = [
    'React', 'Next.js', 'Angular', 'Vue', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Cassandra',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Tailwind', 'Material UI', 'Sass', 'Figma', 'GraphQL', 'REST API', 'WebSockets',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLTK', 'Pandas', 'NumPy', 'Excel', 'Tableau', 'Power BI'
  ];
  const softSkills = ['Leadership', 'Teamwork', 'Communication', 'Agile', 'Scrum', 'Problem Solving', 'Project Management'];
  
  const extractedSkills = [...techStacks, ...softSkills].filter(s => textLower.includes(s.toLowerCase()));

  // 6. Role Detection (Target Sections)
  const roleTags = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Data Analyst', 'DevOps Engineer', 'Cloud Architect', 'Security Engineer',
    'Product Manager', 'Project Manager', 'Procurement Specialist', 'Supply Chain Lead',
    'HR Business Partner', 'Marketing Executive', 'UI/UX Designer', 'Solution Architect'
  ];
  const targetRoles = roleTags.filter(role => textLower.includes(role.toLowerCase()));

  return {
    personalInfo: { name: name || 'Applicant', email, phone },
    skills: extractedSkills.length > 0 ? extractedSkills : ['General Professional Skills'],
    totalExperience,
    targetRoles: targetRoles.length > 0 ? targetRoles : ['Professional'],
    recentPosition: targetRoles[0] || 'Professional Experience'
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
        
        const prompt = `
          You are a world-class Recruitment AI. Extract a high-fidelity profile from this resume text.
          
          Guidelines:
          - personalInfo: Extract Name, Email, Phone.
          - skills: List only top-tier technical and professional skills.
          - totalExperience: Integer representing years of work experience.
          - targetRoles: Most suitable job titles for this candidate (max 5).
          - recentPosition: Most recent or current official job title.
          
          Return ONLY valid JSON.
          
          JSON Schema:
          {
            "personalInfo": { "name": string, "email": string, "phone": string },
            "skills": string[],
            "totalExperience": number,
            "targetRoles": string[],
            "recentPosition": string
          }
          
          Resume Text:
          """
          ${extractedText.slice(0, 8000)}
          """
        `;

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
