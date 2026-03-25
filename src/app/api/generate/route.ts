import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Local Fallback Generator (Moved from ToolPage to API for consistency) ---
function generateMockResult(tool: string, userInput: string) {
  const topic = userInput.split(' ')[0] || 'Leadership';
  switch (tool) {
    case 'hashtags': return `#${topic} #Career #Growth #Innovation #Networking #Jobs`;
    case 'summary': return `Passionate professional specializing in ${topic}. Driven by results and continuous learning. Let's connect!`;
    case 'post': return `🚀 Excited to share my insights on ${userInput}! Check it out and let me know your thoughts. #Career #Insights`;
    case 'headline': return `${topic} Expert | Strategy & Execution | Scaling Impact 🚀`;
    case 'resume-score': return `📊 AI Resume Score: 85/100\n✅ Strong experience in ${topic}\n⚠️ Add more quantifiable metrics.`;
    case 'cover-letter': return `Dear Hiring Manager,\n\nI am thrilled to apply for the ${topic} position...`;
    default: return `Professional response generated for ${tool} regarding ${userInput}.`;
  }
}

export async function POST(req: Request) {
  try {
    const { toolId, input } = await req.json();

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = apiKey && apiKey.startsWith('AIza');

    if (isValidKey) {
      try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          let prompt = '';
          switch (toolId) {
            case 'hashtags': prompt = `Generate 10 LinkedIn hashtags for: "${input}".`; break;
            case 'summary': prompt = `Write a professional LinkedIn summary: "${input}".`; break;
            case 'post': prompt = `Write a LinkedIn post about: "${input}".`; break;
            case 'headline': prompt = `Generate 5 LinkedIn headlines for: "${input}".`; break;
            case 'recommendation': prompt = `Write a LinkedIn recommendation for: "${input}".`; break;
            case 'resume-gpt': prompt = `Rewrite these bullet points: "${input}".`; break;
            case 'resume-score': prompt = `Analyze this resume and provide a score, strengths, and improvements: "${input}".`; break;
            case 'cover-letter': prompt = `Write a tailored cover letter for: "${input}".`; break;
            default: prompt = `Professional output for ${toolId}: "${input}"`;
          }

          const result = await model.generateContent(prompt);
          const response = await result.response;
          return NextResponse.json({ success: true, text: response.text() });
      } catch (aiErr) {
          console.error('Gemini Live API Failed, falling back:', aiErr);
      }
    }

    // Fallback: Use Local Mock Logic if Key is Missing/Invalid or API Fails
    console.log('[API GENERATE] Using local mock fallback for:', toolId);
    const mockText = generateMockResult(toolId, input);
    return NextResponse.json({ 
      success: true, 
      text: mockText, 
      warning: 'Live AI unavailable. Using local smart-template.' 
    });

  } catch (error) {
    console.error('Unified Generation Error:', error);
    return NextResponse.json({ error: 'System Error. Please try again later.' }, { status: 500 });
  }
}
