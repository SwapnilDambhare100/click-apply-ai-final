import { NextResponse } from 'next/server';

function calculateMatchScore(jobDescription: string, jobTitle: string, skills: string[], targetRoles: string[]): number {
  if (!skills || skills.length === 0) return Math.floor(Math.random() * 15) + 75; // Baseline if no skills provided
  
  const text = (jobDescription + ' ' + jobTitle).toLowerCase();
  let matches = 0;
  
  skills.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      matches += 1;
    }
  });

  // Base score 60. Each matching skill adds points. Max score limit 95 before role bonus.
  let calculatedScore = 60 + (matches * 7);
  if (calculatedScore > 95) calculatedScore = 95;
  
  // Bonus if job title explicitly includes a target role
  if (targetRoles && targetRoles.length > 0) {
    const isRoleMatch = targetRoles.some(role => jobTitle.toLowerCase().includes(role.toLowerCase()));
    if (isRoleMatch) {
      calculatedScore = Math.min(99, calculatedScore + 10);
    }
  }

  return calculatedScore;
}

export async function POST(request: Request) {
  try {
    // Also accepting the new parsed JSON structure
    const body = await request.json();
    const profile = body.profile || body.data || body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    const queryDomain = (profile.targetRoles && profile.targetRoles.length > 0) 
                        ? profile.targetRoles[0] 
                        : (profile.domain || 'Software Engineer');
                        
    const keyword = queryDomain.toLowerCase().trim();
    const encodedQuery = encodeURIComponent(queryDomain);
    const skills = profile.skills || [];
    const targetRoles = profile.targetRoles || [keyword];

    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    const joobleApiKey = process.env.JOOBLE_API_KEY;

    let allFetchedJobs: any[] = [];

    // 1. Fetch from Adzuna API (Indian Market)
    if (adzunaAppId && adzunaAppKey) {
      try {
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=30&what_phrase=${encodedQuery}`;
        const response = await fetch(adzunaUrl);
        const data = await response.json();
        if (data.results) {
          const formattedAdzuna = data.results.map((job: any) => ({
            id: 'adz_' + job.id.toString(),
            title: job.title,
            company: job.company.display_name,
            location: job.location.display_name,
            description: job.description.substring(0, 150) + '...',
            matchScore: calculateMatchScore(job.description, job.title, skills, targetRoles),
            posted: 'Recently via Adzuna',
            url: job.redirect_url,
            isStrictMatch: job.title.toLowerCase().includes(keyword) || job.company.display_name.toLowerCase().includes(keyword)
          }));
          allFetchedJobs = [...allFetchedJobs, ...formattedAdzuna];
        }
      } catch(e) { console.error("Adzuna error: ", e); }
    }

    // 2. Fetch from Jooble API
    if (joobleApiKey) {
      try {
        const joobleUrl = `https://in.jooble.org/api/${joobleApiKey}`;
        const response = await fetch(joobleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: queryDomain, location: "India" })
        });
        const data = await response.json();
        if (data.jobs) {
          const formattedJooble = data.jobs.map((job: any) => ({
            id: 'jbl_' + job.id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.snippet.substring(0, 150).replace(/<\/?[^>]+(>|$)/g, "") + '...',
            matchScore: calculateMatchScore(job.snippet, job.title, skills, targetRoles),
            posted: 'Recently via Jooble',
            url: job.link,
            isStrictMatch: job.title.toLowerCase().includes(keyword) || job.company.toLowerCase().includes(keyword)
          }));
          allFetchedJobs = [...allFetchedJobs, ...formattedJooble];
        }
      } catch(e) { console.error("Jooble error: ", e); }
    }

    let validJobs = allFetchedJobs;
    if (keyword && keyword !== 'software engineer' && allFetchedJobs.length > 0) {
      validJobs = allFetchedJobs.filter((job: any) => job.isStrictMatch);
    }

    if (validJobs.length > 0) {
      validJobs.sort((a, b) => b.matchScore - a.matchScore);
      return NextResponse.json({
        success: true,
        data: validJobs.slice(0, 15),
        message: 'Live jobs fetched and matched successfully'
      });
    }

    // FALLBACK: Mocks
    console.log('Using Local Indian Market fallback mocks.');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

    const fallbackDomain = queryDomain;
    const localIndianMocks = [
      { id: 'mk1', title: `${fallbackDomain} - Associate`, company: 'Tata Consultancy Services (TCS)', location: 'Pune, Maharashtra', matchScore: calculateMatchScore('We need Node.js and React expertise.', `${fallbackDomain} - Associate`, skills, targetRoles), posted: '1d ago via Naukri' },
      { id: 'mk2', title: `Senior ${fallbackDomain}`, company: 'Infosys', location: 'Bengaluru, Karnataka', matchScore: calculateMatchScore('Looking for 5 years experience in JS.', `Senior ${fallbackDomain}`, skills, targetRoles), posted: '2d ago via LinkedIn' },
      { id: 'mk3', title: `Lead ${fallbackDomain}`, company: 'Reliance Jio', location: 'Navi Mumbai, Maharashtra', matchScore: calculateMatchScore('Expertise in procurement and vendor management.', `Lead ${fallbackDomain}`, skills, targetRoles), posted: '5h ago via Indeed' },
      { id: 'mk4', title: `${fallbackDomain} Specialist`, company: 'Wipro', location: 'Hyderabad, Telangana', matchScore: 84, posted: '3d ago via Glassdoor' },
      { id: 'mk5', title: `${fallbackDomain} Consultant`, company: 'HCL Technologies', location: 'Noida, Uttar Pradesh', matchScore: 81, posted: '12h ago via Instahyre' },
    ];
    
    localIndianMocks.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: localIndianMocks,
      message: 'Job matching completed via Simulator'
    });
  } catch (error) {
    console.error('Error matching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
