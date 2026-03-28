import { NextResponse } from 'next/server';

// Score calculator
function calculateMatchScore(jobDescription: string = '', jobTitle: string = '', skills: string[] = [], targetTags: string[] = []): number {
  const text = (jobDescription + ' ' + jobTitle).toLowerCase();
  let matches = 0;
  if (skills?.length > 0) {
    skills.forEach(skill => { if (skill && text.includes(skill.toLowerCase())) matches += 1; });
  }
  let score = 60 + (matches * 6);
  if (score > 92) score = 92;
  if (targetTags?.length > 0) {
    const titleMatch = targetTags.find(tag => tag && jobTitle.toLowerCase().includes(tag.toLowerCase()));
    if (titleMatch) {
      score = 98 + (matches * 0.1);
    } else {
      const descMatch = targetTags.some(tag => tag && jobDescription.toLowerCase().includes(tag.toLowerCase()));
      if (descMatch) score = Math.min(92, score + 15);
    }
  }
  return Math.max(70, Math.min(99, score));
}

// ── Live API Fetchers ──────────────────────────────────────────────
async function fetchFromAdzuna(query: string): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what_phrase=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.results || []).map((job: any, i: number) => ({
      id: 'adz_' + job.id,
      title: job.title,
      company: job.company?.display_name || 'Confidential',
      location: job.location?.display_name || 'India',
      description: (job.description || '').substring(0, 400),
      url: job.redirect_url,
      posted: 'Live via Adzuna',
      source: 'Adzuna'
    }));
  } catch { return []; }
}

async function fetchFromJooble(query: string): Promise<any[]> {
  const key = process.env.JOOBLE_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`https://in.jooble.org/api/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: query, location: 'India' })
    });
    const data = await res.json();
    return (data.jobs || []).map((job: any) => ({
      id: 'jbl_' + job.id,
      title: job.title,
      company: job.company || 'Confidential',
      location: job.location || 'India',
      description: (job.snippet || '').replace(/<\/?[^>]+(>|$)/g, '').substring(0, 400),
      url: job.link,
      posted: 'Live via Jooble',
      source: 'Jooble'
    }));
  } catch { return []; }
}

async function fetchFromGoogleJobs(query: string): Promise<any[]> {
  const key = process.env.SEARCHAPI_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`https://www.searchapi.io/api/v1/search?engine=google_jobs&q=${encodeURIComponent(query)}&location=India&api_key=${key}`);
    const data = await res.json();
    return (data.jobs || []).map((job: any) => ({
      id: 'goog_' + (job.job_id || Math.random().toString(36).substr(2, 9)),
      title: job.title,
      company: job.company_name || 'Confidential',
      location: job.location || (job.detected_extensions?.work_from_home ? 'Remote' : 'India'),
      description: (job.description || '').substring(0, 400),
      url: job.apply_link || job.sharing_link || '',
      posted: 'Live via Google Jobs',
      source: 'Google Jobs'
    }));
  } catch { return []; }
}

async function fetchFromFindWork(query: string): Promise<any[]> {
  const key = process.env.FINDWORK_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(query)}&location=India&sort_by=newest`, {
      headers: { 'Authorization': `Token ${key}` }
    });
    const data = await res.json();
    return (data.results || []).map((job: any) => ({
      id: 'fwk_' + job.id,
      title: job.role || job.title || query,
      company: job.company_name || 'Confidential',
      location: job.location || 'India',
      description: (job.text || '').substring(0, 400),
      url: job.url || '',
      posted: 'Live via FindWork',
      source: 'FindWork'
    }));
  } catch { return []; }
}

// ── Main Handler ───────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isExplicitSearch = Array.isArray(body.tags) && body.tags.length > 0;
    const tags: string[] = isExplicitSearch ? body.tags : (body.profile?.targetRoles || ['Software Engineer']);
    const skills: string[] = body.profile?.skills || [];
    const limit = body.limit || 50;
    const query = tags.join(' ');

    // Step 1: Try database first (if DATABASE_URL is set)
    let dbJobs: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const whereClause: any = {
          isLive: true,
          postedAt: { gt: sixtyDaysAgo }
        };
        if (tags.length > 0 && tags[0] !== '') {
          // 🔒 TITLE-ONLY filter: Never match on description alone to avoid irrelevant results
          whereClause.OR = tags.map((tag: string) => ({
            title: { contains: tag, mode: 'insensitive' }
          }));
        }
        dbJobs = await (prisma.job as any).findMany({
          where: whereClause,
          orderBy: { postedAt: 'desc' },
          take: 200
        });
        await prisma.$disconnect();
        console.log(`Matching Engine: Found ${dbJobs.length} jobs in database.`);
      } catch (dbErr) {
        console.warn('DB unavailable, falling back to live APIs:', dbErr);
        dbJobs = [];
      }
    }

    // Step 2: If DB has no results, fetch directly from live APIs
    let liveJobs: any[] = [];
    if (dbJobs.length < 5) {
      console.log('Fetching live jobs from APIs...');
      const results = await Promise.allSettled([
        fetchFromAdzuna(query),
        fetchFromJooble(query),
        fetchFromGoogleJobs(query),
        fetchFromFindWork(query)
      ]);
      liveJobs = results
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // 🔒 STRICT TITLE-ONLY FILTER: No fallback to description — ever.
      if (tags.length > 0 && tags[0] !== '') {
        liveJobs = liveJobs.filter(job => {
          const titleLower = (job.title || '').toLowerCase();
          return tags.some((tag: string) => titleLower.includes(tag.toLowerCase()));
        });
      }

      console.log(`Matching Engine: ${liveJobs.length} relevant live jobs after strict title filter.`);

    }

    // Step 3: Merge and score
    const allJobs = [
      ...dbJobs.map((dbJob: any) => ({
        id: dbJob.id,
        title: dbJob.title,
        company: dbJob.company,
        location: dbJob.location || 'India',
        description: dbJob.description || '',
        url: dbJob.url,
        posted: (() => {
          const daysOld = Math.floor((Date.now() - (dbJob.postedAt?.getTime?.() || Date.now())) / (1000 * 60 * 60 * 24));
          return daysOld === 0 ? 'Today' : `${daysOld}d ago`;
        })(),
        source: dbJob.source || 'Database'
      })),
      ...liveJobs
    ];

    // Step 4: Deduplicate by title+company
    const seen = new Set<string>();
    const deduped = allJobs.filter(job => {
      const key = `${(job.title || '').toLowerCase()}_${(job.company || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Step 5: Score & filter
    let scoredJobs = deduped.map((job: any) => {
      const score = calculateMatchScore(job.description, job.title, skills, tags);
      const titleLower = (job.title || '').toLowerCase();
      const hasDirectTitleMatch = tags.some((tag: string) => titleLower.includes(tag.toLowerCase()));
      // 🔒 STRICT: isTagMatch uses title ONLY - no description fallback
      const isTagMatch = tags.length === 0 || hasDirectTitleMatch;
      return { ...job, matchScore: score, isTagMatch };
    });

    // Filter by tag relevance
    if (tags.length > 0 && tags[0] !== '') {
      scoredJobs = scoredJobs.filter((job: any) => job.isTagMatch);
    }

    // Location filter
    const targetLoc = body.location || '';
    if (targetLoc && targetLoc.toLowerCase() !== 'india' && targetLoc.toLowerCase() !== 'all') {
      scoredJobs = scoredJobs.filter((job: any) =>
        (job.location || '').toLowerCase().includes(targetLoc.toLowerCase()) ||
        (targetLoc.toLowerCase() === 'remote' && (job.location || '').toLowerCase().includes('remote'))
      );
    }

    // Sort & limit
    scoredJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
    let finalResult = scoredJobs.slice(0, limit);

    // Step 6: Gemini AI Boost (top 3)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && finalResult.length > 0) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const userSummary = `Skills: ${skills.join(', ')}. Roles: ${tags.join(', ')}. Exp: ${body.profile?.totalExperience || 0} years.`;
        for (let job of finalResult.slice(0, 3)) {
          const prompt = `Rate the match between this candidate and job 0-100. Candidate: ${userSummary}. Job: ${job.title} at ${job.company}. Desc: ${(job.description || '').substring(0, 400)}. Return ONLY the numeric score.`;
          const result = await model.generateContent(prompt);
          const aiScore = parseInt(result.response.text().trim().replace(/[^0-9]/g, ''));
          if (!isNaN(aiScore)) {
            job.matchScore = Math.floor((job.matchScore * 0.4) + (aiScore * 0.6));
            job.aiVerified = true;
          }
        }
        finalResult.sort((a: any, b: any) => b.matchScore - a.matchScore);
      } catch (aiError) {
        console.warn('Semantic AI Matching failed:', aiError);
      }
    }

    return NextResponse.json({
      success: true,
      data: finalResult,
      totalMatches: scoredJobs.length,
      limitApplied: limit,
      source: dbJobs.length >= 5 ? 'database' : 'live-api',
      message: `Found ${finalResult.length} live roles for "${query}".`
    });

  } catch (error) {
    console.error('Matching Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
