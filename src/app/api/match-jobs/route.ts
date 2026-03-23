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

    console.log(`Matching Engine: ${isExplicitSearch ? 'EXPLICIT SEARCH' : 'PROFILE MATCH'} - Tags: [${tags.join(', ')}]`);

    // Fetch all active jobs physically synced to the DB
    const storedJobs = await (prisma.job as any).findMany({
      where: {
        isLive: true,
        postedAt: { gt: twentyFiveDaysAgo }
      },
      orderBy: { postedAt: 'desc' }
    });

    // Score jobs against multi-tag profile
    let validJobs = storedJobs.map((dbJob: any) => {
      const computedScore = calculateMatchScore(dbJob.description, dbJob.title, skills, tags);
      const daysOld = Math.floor((Date.now() - (dbJob.postedAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24));
      
      const titleMatch = tags.some((tag: string) => (dbJob.title || '').toLowerCase().includes(tag.toLowerCase()));
      const descMatch = tags.some((tag: string) => (dbJob.description || '').toLowerCase().includes(tag.toLowerCase()));
      
      // Strict Filter: Title matches are golden. Description matches are acceptable.
      const isTagMatch = titleMatch || descMatch;

      return {
        id: dbJob.id,
        title: dbJob.title,
        company: dbJob.company,
        location: dbJob.location || 'Remote',
        description: dbJob.description,
        matchScore: dbJob.matchScore || computedScore,
        posted: daysOld === 0 ? 'Today via Agent' : `${daysOld}d ago via Agent`,
        url: dbJob.url,
        isTagMatch
      }
    });

    // 1. Filter: If tags exist, prioritize tag matches
    if (tags.length > 0 && tags[0] !== '') {
       validJobs = validJobs.filter((job: any) => job.isTagMatch);
    }

    // 2. Location Filter (New)
    const targetLoc = body.location || '';
    if (targetLoc && targetLoc.toLowerCase() !== 'india' && targetLoc.toLowerCase() !== 'all') {
      validJobs = validJobs.filter((job: any) => 
        (job.location || '').toLowerCase().includes(targetLoc.toLowerCase()) ||
        (targetLoc.toLowerCase() === 'remote' && (job.location || '').toLowerCase().includes('remote'))
      );
    }

    // 3. Sort & Limit
    validJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
    const resultCount = Math.min(validJobs.length, limit);
    const finalResult = validJobs.slice(0, resultCount);

    return NextResponse.json({
      success: true,
      data: finalResult,
      totalMatches: validJobs.length,
      limitApplied: limit,
      message: `Successfully matched ${finalResult.length} roles against ${tags.length} target tags.`
    });

  } catch (error) {
    console.error('Matching Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
