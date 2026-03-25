import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Hardcoded Match engine 
function calculateMatchScore(jobDescription: string = '', jobTitle: string = '', skills: string[] = [], targetTags: string[] = []): number {
  const safeDesc = jobDescription || '';
  const safeTitle = jobTitle || '';
  const text = (safeDesc + ' ' + safeTitle).toLowerCase();
  let matches = 0;
  
  if (skills && skills.length > 0) {
    skills.forEach(skill => {
        if (skill && text.includes(skill.toLowerCase())) matches += 1;
    });
  }

  // Base score 60. Each matching skill adds points. Max score limit 92 before role bonus.
  let calculatedScore = 60 + (matches * 6);
  if (calculatedScore > 92) calculatedScore = 92;
  
  // Multi-Tag Role Bonus: If any of the target tags match the title, give a MASSIVE boost
  if (targetTags && targetTags.length > 0) {
    const matchedTag = targetTags.find(tag => tag && safeTitle.toLowerCase().includes(tag.toLowerCase()));
    if (matchedTag) {
      // Direct title match = elite priority (98%+)
      calculatedScore = 98 + (matches * 0.1); 
    } else {
      // Check description
      const descMatch = targetTags.some(tag => tag && safeDesc.toLowerCase().includes(tag.toLowerCase()));
      if (descMatch) {
         calculatedScore = Math.min(92, calculatedScore + 15);
      }
    }
  }

  return Math.max(70, Math.min(99, calculatedScore));
}

export async function POST(request: Request) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    
    // Determine if we are doing a profile-match or a specific tag-search
    const isExplicitSearch = Array.isArray(body.tags) && body.tags.length > 0;
    const tags = isExplicitSearch ? body.tags : (body.profile?.targetRoles || ['Software Engineer']);
    
    const limit = body.limit || 50;
    const skills = body.profile?.skills || [];

    // Blazing-fast Local Database Query
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

    // 🔍 Database Query: Initial broad filter to reduce memory load

    const whereClause: any = {
      isLive: true,
      postedAt: { gt: twentyFiveDaysAgo }
    };

    // If we have explicit tags, only pull jobs that loosely match them in title/description
    if (tags.length > 0 && tags[0] !== '') {
      whereClause.OR = tags.map((tag: string) => ([
        { title: { contains: tag, mode: 'insensitive' } },
        { description: { contains: tag, mode: 'insensitive' } }
      ])).flat();
    }

    const storedJobs = await (prisma.job as any).findMany({
      where: whereClause,
      orderBy: { postedAt: 'desc' },
      take: 200 // Safety limit for initial ranking
    });

    console.log(`Matching Engine: Processing ${storedJobs.length} potential matches.`);

    // 🚀 Hybrid Multi-Factor Scoring
    let validJobs = storedJobs.map((dbJob: any) => {
      // 1. Keyword Score (Base)
      const keywordScore = calculateMatchScore(dbJob.description, dbJob.title, skills, tags);
      
      // 2. Title Weighting (Critical)
      const titleLower = (dbJob.title || '').toLowerCase();
      const hasDirectTitleMatch = tags.some((tag: string) => titleLower.includes(tag.toLowerCase()));
      
      // 3. Experience Heuristic (Bonus)
      const userExp = body.profile?.totalExperience || 0;
      const jobDescLower = (dbJob.description || '').toLowerCase();
      const expMentioned = jobDescLower.match(/(\d+)\+?\s*years?/i);
      let expBonus = 0;
      if (expMentioned) {
        const requiredExp = parseInt(expMentioned[1]);
        if (userExp >= requiredExp) expBonus = 10;
        else if (userExp < requiredExp - 2) expBonus = -15; // Penalty for missing major seniority
      }

      // 4. Final Weighted Score
      let finalScore = keywordScore + expBonus;
      if (hasDirectTitleMatch) finalScore += 20; // Massive boost for title alignment
      
      // Clamp between 70-99
      finalScore = Math.max(70, Math.min(99, finalScore));

      const daysOld = Math.floor((Date.now() - (dbJob.postedAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24));

      return {
        id: dbJob.id,
        title: dbJob.title,
        company: dbJob.company,
        location: dbJob.location || 'Remote',
        description: dbJob.description,
        matchScore: finalScore,
        posted: daysOld === 0 ? 'Today via Agent' : `${daysOld}d ago via Agent`,
        url: dbJob.url,
        isTagMatch: tags.length === 0 || hasDirectTitleMatch || tags.some((tag: string) => jobDescLower.includes(tag.toLowerCase()))
      }
    });

    // --- SECONDARY FILTERING ---
    
    // 1. Tag Match Filter (Strict)
    if (tags.length > 0 && tags[0] !== '') {
       validJobs = validJobs.filter((job: any) => job.isTagMatch);
    }

    // 2. Location Filter
    const targetLoc = body.location || '';
    if (targetLoc && targetLoc.toLowerCase() !== 'india' && targetLoc.toLowerCase() !== 'all') {
      validJobs = validJobs.filter((job: any) => 
        (job.location || '').toLowerCase().includes(targetLoc.toLowerCase()) ||
        (targetLoc.toLowerCase() === 'remote' && (job.location || '').toLowerCase().includes('remote'))
      );
    }

    // 3. Sort & Limit
    validJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
    let finalResult = validJobs.slice(0, limit);

    // 🚀 LEVEL 3: Semantic AI Boost (Top 3 only to preserve performance)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && finalResult.length > 0) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const topJobs = finalResult.slice(0, 3);
        const userSummary = `Skills: ${skills.join(', ')}. Roles: ${tags.join(', ')}. Exp: ${body.profile?.totalExperience || 0} years.`;

        for (let job of topJobs) {
          const prompt = `Rate the match between this candidate and job on a scale of 0-100.
          Candidate: ${userSummary}
          Job: ${job.title} at ${job.company}. Desc: ${job.description.substring(0, 800)}
          Return ONLY the numeric score.`;
          
          const result = await model.generateContent(prompt);
          const aiScore = parseInt(result.response.text().trim().replace(/[^0-9]/g, ''));
          if (!isNaN(aiScore)) {
             job.matchScore = Math.floor((job.matchScore * 0.4) + (aiScore * 0.6)); // Weighted average
             job.aiVerified = true;
          }
        }
        // Re-sort after AI boost
        finalResult.sort((a: any, b: any) => b.matchScore - a.matchScore);
      } catch (aiError) {
        console.warn('Semantic AI Matching failed:', aiError);
      }
    }

    return NextResponse.json({
      success: true,
      data: finalResult,
      totalMatches: validJobs.length,
      limitApplied: limit,
      message: `Successfully matched ${finalResult.length} roles using Hybrid Heuristics + AI Semantic Review.`
    });



  } catch (error) {
    console.error('Matching Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
