"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import styles from './tool.module.css';

const toolConfig: Record<string, { title: string, desc: string, inputLabel: string, placeholder: string }> = {
  'hashtags': { title: 'LinkedIn Hashtags Generator', desc: 'Generate trending hashtags for your LinkedIn post.', inputLabel: 'Post Topic', placeholder: 'e.g. Artificial Intelligence in HR' },
  'summary': { title: 'LinkedIn Summary Generator', desc: 'Write a professional about section for your profile.', inputLabel: 'Current Role & Key Skills', placeholder: 'e.g. Senior Frontend Developer with 5 years experience in React' },
  'post': { title: 'LinkedIn Post Generator', desc: 'Generate an engaging post for your network.', inputLabel: 'What do you want to share?', placeholder: 'e.g. I just completed a new certificate in AWS' },
  'headline': { title: 'LinkedIn Headline Generator', desc: 'Create a catchy headline that attracts recruiters.', inputLabel: 'Your current job title', placeholder: 'e.g. Product Manager' },
  'recommendation': { title: 'LinkedIn Recommendation Generator', desc: 'Write a glowing recommendation for a colleague.', inputLabel: 'Colleague Name & Role', placeholder: 'e.g. John Doe, UI Designer' },
  'resume-builder': { title: 'AI Resume Builder', desc: 'Generate a complete resume structure from your details.', inputLabel: 'Your Industry & Experience level', placeholder: 'e.g. Marketing, Mid-level' },
  'resume-gpt': { title: 'Resume GPT Assistant', desc: 'Chat with AI to improve your resume bullet points.', inputLabel: 'Paste a resume bullet point', placeholder: 'e.g. Increased sales by 20%...' },
  'resume-score': { title: 'AI Resume Scorer', desc: 'Score your resume against industry standards.', inputLabel: 'Paste your resume text', placeholder: 'e.g. John Doe, Software Engineer...' },
  'resume-tracker': { title: 'Application Tracker', desc: 'Organize and track your job applications smartly.', inputLabel: 'Paste Job Post URL', placeholder: 'e.g. https://linkedin.com/jobs/view/12345' },
  'cover-letter': { title: 'Cover Letter Generator', desc: 'Write a tailored cover letter for a specific job.', inputLabel: 'Target Job Title & Company', placeholder: 'e.g. Software Engineer at Google' },
  'job-description': { title: 'Job Description Generator', desc: 'For recruiters: Generate a precise JD.', inputLabel: 'Role Title', placeholder: 'e.g. Full Stack Developer' },
};

export default function ToolPage() {
  const params = useParams();
  const toolId = typeof params?.toolId === 'string' ? params.toolId : '';
  const config = toolConfig[toolId] || { title: 'AI Tool', desc: 'Powerful AI generation tool.', inputLabel: 'Your Input', placeholder: 'Enter details here...' };

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(`[File Attached: ${file.name}]\n\nExtracting contents...`);
      setTimeout(() => {
        setInput(`--- Extracted Text from ${file.name} ---\n\nJohn Doe\nSenior Software Engineer\n\nExperience:\n- Led a team of 10 to build an enterprise Dashboard.\n- Increased efficiency by 40% using React and Node.js.\n\nSkills: JavaScript, TypeScript, Next.js, Python, PostgreSQL`);
      }, 1500);
    }
  };

  const generateMockResult = (tool: string, userInput: string) => {
    const topic = userInput.split(' ')[0] || 'Leadership';
    
    switch (tool) {
      case 'hashtags':
        return `#${topic} #${topic}Jobs #Careers #Innovation #TechTrends #Hiring #FutureOfWork #${topic}Life #GrowthMindset #Networking #LinkedInFam #OpenToWork`;
      case 'summary':
        return `Passionate and driven professional with a proven track record in ${topic} and strategic execution. I thrive in fast-paced teams and love bridging the gap between complex problems and elegant solutions.\n\nKey Expertise:\n- Strategic Leadership\n- Process Optimization\n- Cross-functional Collaboration\n- Data-Driven Decision Making\n\nI am always looking for new challenges and opportunities to scale impact. Let's connect!`;
      case 'post':
        return `🚀 I'm incredibly excited to share my latest thoughts on ${userInput}!\n\nOver the past few weeks, I’ve realized that focusing on core fundamentals completely shifts how we approach daily challenges. The key takeaway? Never stop learning and always iterate.\n\nWhat are your thoughts on this? Let me know in the comments below! 👇\n\n#Learning #Growth #ProfessionalDevelopment`;
      case 'headline':
        return `Option 1: Senior ${topic} Specialist | Helping Brands Scale & Innovate 🚀\nOption 2: Experienced Professional in ${topic} | 5+ Years Driving Revenue & Growth\nOption 3: ${userInput} | Innovator | Problem Solver`;
      case 'recommendation':
        return `I had the absolute pleasure of working alongside ${topic} for several years. ${topic} is one of those rare professionals who not only excels in their technical domain but also possesses incredible emotional intelligence and leadership skills. They consistently delivered high-quality results ahead of schedule. Any team would be incredibly lucky to have them onboard. Highly recommended!`;
      case 'resume-builder':
        return `[Generated Resume Structure]\n\nJOHN DOE\njohn.doe@email.com | linkedin.com/in/johndoe\n\nPROFESSIONAL SUMMARY\nDynamic professional in ${userInput} with extensive experience scaling operations...\n\nEXPERIENCE\nCompany Name | Senior Lead\n- Achieved 150% of annual targets through strategic implementations.\n- Managed cross-functional teams of 15+ members.\n\nEDUCATION\nBachelor of Science in Relevant Field\nUniversity of Technology\n\nSKILLS\nLeadership, Data Analysis, Project Management`;
      case 'resume-gpt':
        return `Here are 3 stronger ways to rewrite your bullet point for maximum impact:\n\n1. Spearheaded [Project/Initiative], resulting in a 35% increase in operational efficiency and saving $50k annually.\n2. Orchestrated cross-functional collaboration to deliver [Result], outperforming Q3 targets by 150%.\n3. Engineered a new framework for [Process], dropping latency by 40% globally.`;
      case 'resume-score':
        return `📊 AI Resume Score: 87 / 100\n\n✅ Strengths:\n- Strong action verbs detected (Led, Built, Scaled).\n- Good balance of hard skills and soft skills.\n- Length is optimal (1 page).\n\n⚠️ Areas for Improvement:\n- You are missing quantifiable metrics in your most recent role. Try adding numbers (e.g. "Increased revenue by 20%").\n- Missing links to your GitHub or Portfolio.`;
      case 'resume-tracker':
        return `✅ Successfully Parsed Job Application Details!\n\nJob Title: ${userInput.substring(0, 20)} Role\nCompany: Extracted Automatically\nStatus: Pending Interview\nDate Logged: ${new Date().toLocaleDateString()}\n\nThis application has been securely saved to your CRM Dashboard. You will be reminded to follow up in 7 days!`;
      case 'cover-letter':
        return `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${userInput} position at your esteemed company. With my background in driving high-impact projects and a proven track record of delivering measurable success, I am confident in my ability to bring value to your team.\n\nIn my previous roles, I have consistently demonstrated a commitment to excellence and innovation. I admire your company’s mission and would be thrilled to contribute my expertise to help you achieve your upcoming goals.\n\nThank you for considering my application. I have attached my resume and look forward to discussing how my skills align with your needs.\n\nSincerely,\n[Your Name]`;
      case 'job-description':
        return `JOB TITLE: ${userInput}\n\nAbout Us:\nWe are a fast-growing tech company looking for a passionate ${topic} to join our dynamic team.\n\nResponsibilities:\n- Lead and execute high-priority projects.\n- Collaborate across engineering and design teams.\n- Ensure successful delivery of KPI milestones.\n\nRequirements:\n- 3+ years of proven experience in ${userInput}.\n- Strong communication skills.\n- Analytical and problem-solving mindset.\n\nBenefits:\n- Competitive Salary + Equity\n- Remote Work\n- Infinite PTO`;
      default:
        return `[AI Generation Complete for ${config.title}]\n\nHere is your custom tailored result based on: "${userInput}".`;
    }
  };

  const handleGenerate = async () => {
    if (!input) return alert('Please enter something first.');
    setIsGenerating(true);
    setResult('');
    
    // Simulate AI Generation Processing Time
    setTimeout(() => {
      const generatedContent = generateMockResult(toolId, input);
      setResult(generatedContent);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.toolHeader}>
          <h1>{config.title}</h1>
          <p>{config.desc}</p>
        </div>

        <div className={styles.workspace}>
          <div className={styles.inputSection}>
            <div className={styles.inputHeader}>
              <label className={styles.label}>{config.inputLabel}</label>
              <label className={styles.uploadLink}>
                📎 Upload File
                <input type="file" hidden accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
              </label>
            </div>
            
            <textarea 
              className={styles.textarea} 
              placeholder={config.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating AI...' : '✨ Generate Now'}
            </button>
          </div>

          <div className={styles.outputSection}>
            <label className={styles.label}>AI Result</label>
            <div className={`${styles.outputBox} ${isGenerating ? styles.pulse : ''}`}>
              {isGenerating ? 'AI is thinking...' : (result || 'Your generated result will appear here.')}
            </div>
            {result && (
              <button 
                className={styles.copyBtn}
                onClick={() => { navigator.clipboard.writeText(result); alert('Copied to clipboard!') }}
              >
                Copy to Clipboard
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
