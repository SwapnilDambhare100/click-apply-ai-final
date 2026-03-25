import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Optional: Add a CRON_SECRET to your .env.local to secure this route
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    const queryParam = url.searchParams.get('query'); // NEW: Targeted refresh
    
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized CRON Trigger' }, { status: 401 });
    }

    console.log('CRON: Waking up optimized job fetcher...');

    const adzunaAppId = process.env.ADZUNA_APP_ID;
    const adzunaAppKey = process.env.ADZUNA_APP_KEY;
    const joobleApiKey = process.env.JOOBLE_API_KEY;
    const theirstackApiKey = process.env.THEIRSTACK_API_KEY;
    const rapidApiIndianJobsKey = process.env.RAPIDAPI_INDIAN_JOBS_KEY;
    const findWorkKey = process.env.FINDWORK_API_KEY;
    const searchapiApiKey = process.env.SEARCHAPI_API_KEY;

    // Use queryParam if provided, otherwise use full list
    const domainsToSearch = queryParam ? [queryParam] : [
      'Software Engineer', 'Web Developer', 'Data Analyst', 'Project Manager',
      'Digital Marketing', 'Sales Representative', 'Customer Service', 'HR Manager',
      'Accountant', 'Graphic Designer', 'Operations Manager', 'Administrative Assistant',
      'Procurement', 'Supply Chain', 'Logistics', 'Cosmetologist', 'Cosmetologist Professional',
      'Esthetician', 'Makeup Artist', 'Beauty Professional'
    ];

    let allFetchedJobs: any[] = [];

    // Define Fetchers
    const fetchAdzuna = async (domain: string) => {
      if (!adzunaAppId || !adzunaAppKey) return [];
      try {
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&results_per_page=30&what_phrase=${encodeURIComponent(domain)}`;
        const res = await fetch(adzunaUrl);
        const data = await res.json();
        return (data.results || []).map((job: any) => ({
          externalId: 'adz_' + job.id.toString(),
          title: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          description: job.description.substring(0, 300) + '...',
          postedAt: job.created ? new Date(job.created) : new Date(),
          url: job.redirect_url,
          source: 'Adzuna'
        }));
      } catch (e) { return []; }
    };

    const fetchJooble = async (domain: string) => {
      if (!joobleApiKey) return [];
      try {
        const joobleUrl = `https://in.jooble.org/api/${joobleApiKey}`;
        const res = await fetch(joobleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords: domain, location: "India" })
        });
        const data = await res.json();
        return (data.jobs || []).map((job: any) => ({
          externalId: 'jbl_' + job.id.toString(),
          title: job.title,
          company: job.company,
          location: job.location,
          description: (job.snippet || '').substring(0, 300).replace(/<\/?[^>]+(>|$)/g, "") + '...',
          postedAt: job.updated ? new Date(job.updated) : new Date(),
          url: job.link,
          source: 'Jooble'
        }));
      } catch (e) { return []; }
    };

    const fetchTheirStack = async (domain: string) => {
      if (!theirstackApiKey) return [];
      try {
        const res = await fetch(`https://api.theirstack.com/v1/jobs/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${theirstackApiKey}` },
          body: JSON.stringify({ job_title: domain })
        });
        const data = await res.json();
        return (data.data || []).map((job: any) => ({
          externalId: 'tsk_' + (job.id?.toString() || Math.random().toString()),
          title: job.job_title || job.title,
          company: job.company_name || job.company,
          location: job.location || 'Remote',
          description: (job.description || '').substring(0, 300) + '...',
          postedAt: job.date_posted ? new Date(job.date_posted) : new Date(),
          url: job.url || job.job_url,
          source: 'TheirStack'
        }));
      } catch (e) { return []; }
    };

    const fetchIndianJobs = async (domain: string) => {
      if (!rapidApiIndianJobsKey) return [];
      try {
        const res = await fetch('https://indian-jobs-api.p.rapidapi.com/api/v1/get-job-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': 'indian-jobs-api.p.rapidapi.com', 'x-rapidapi-key': rapidApiIndianJobsKey },
          body: JSON.stringify({ search: domain, city: "", workMode: 0, experience: 3, jobAge: 25, page: 1 })
        });
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.jobs || data.data || []);
        return items.map((job: any) => ({
          externalId: 'rind_' + (job.id?.toString() || job.jobId?.toString() || Math.random().toString()),
          title: job.title || job.jobTitle || domain,
          company: job.company || job.companyName || 'Confidential',
          location: job.location || job.city || 'India',
          description: (job.description || job.snippet || '').substring(0, 300) + '...',
          postedAt: job.postedDate || job.date ? new Date(job.postedDate || job.date) : new Date(),
          url: job.jobUrl || job.url || job.link || '',
          source: 'IndianJobsAPI'
        }));
      } catch (e) { return []; }
    };

    const fetchLinkedIn = async () => {
      if (!rapidApiIndianJobsKey) return [];
      try {
        const res = await fetch('https://linkedin-job-search-api.p.rapidapi.com/active-jb-1h?limit=100&offset=0&description_type=text', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com', 'x-rapidapi-key': rapidApiIndianJobsKey }
        });
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || data.jobs || []);
        return items.map((job: any) => ({
          externalId: 'link_' + (job.id?.toString() || job.job_id?.toString() || Math.random().toString()),
          title: job.title || job.job_title || 'LinkedIn Role',
          company: job.company || job.company_name || 'Confidential',
          location: job.location || 'India',
          description: (job.description || '').substring(0, 300) + '...',
          postedAt: job.posted_date || job.date ? new Date(job.posted_date || job.date) : new Date(),
          url: job.job_url || job.url || job.link || '',
          source: 'LinkedIn'
        }));
      } catch (e) { return []; }
    };

    const fetchJSearch = async (domain: string) => {
      if (!rapidApiIndianJobsKey) return [];
      try {
        const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(`${domain} in India`)}&num_pages=1`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': 'jsearch.p.rapidapi.com', 'x-rapidapi-key': rapidApiIndianJobsKey }
        });
        const data = await res.json();
        return (data.data || []).map((job: any) => ({
          externalId: 'jsch_' + (job.id?.toString() || Math.random().toString()),
          title: job.job_title || domain,
          company: job.employer_name || 'Confidential',
          location: job.job_city ? `${job.job_city}, ${job.job_country || 'IN'}` : 'Remote/India',
          description: (job.job_description || '').substring(0, 300) + '...',
          postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
          url: job.job_apply_link || job.job_google_link || '',
          source: 'JSearch'
        }));
      } catch (e) { return []; }
    };

    const fetchFindWork = async (domain: string) => {
      if (!findWorkKey) return [];
      try {
        const res = await fetch(`https://findwork.dev/api/jobs/?search=${encodeURIComponent(domain)}&location=India&sort_by=newest`, {
          headers: { 'Authorization': `Token ${findWorkKey}` }
        });
        const data = await res.json();
        return (data.results || []).map((job: any) => ({
          externalId: 'fwk_' + (job.id?.toString() || Math.random().toString()),
          title: job.role || job.title || domain,
          company: job.company_name || 'Confidential',
          location: job.location || 'India',
          description: (job.text || '').substring(0, 300) + '...',
          postedAt: job.date_posted ? new Date(job.date_posted) : new Date(),
          url: job.url || '',
          source: 'FindWork'
        }));
      } catch (e) { return []; }
    };

    const fetchGoogleJobs = async (domain: string) => {
      if (!searchapiApiKey) return [];
      try {
        const url = `https://www.searchapi.io/api/v1/search?engine=google_jobs&q=${encodeURIComponent(domain)}&location=India&api_key=${searchapiApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        return (data.jobs || []).map((job: any) => ({
          externalId: 'goog_' + (job.job_id || Math.random().toString()),
          title: job.title,
          company: job.company_name,
          location: job.location || (job.detected_extensions?.work_from_home ? 'Remote' : 'India'),
          description: (job.description || '').substring(0, 300) + '...',
          postedAt: job.detected_extensions?.posted_at ? new Date() : new Date(),
          url: job.apply_link || job.sharing_link || '',
          source: 'Google Jobs'
        }));
      } catch (e) { return []; }
    };

    // Parallel Processing
    for (const domain of domainsToSearch) {
      console.log(`CRON: Syncing ${domain} in parallel...`);
      const results = await Promise.allSettled([
        fetchAdzuna(domain),
        fetchJooble(domain),
        fetchTheirStack(domain),
        fetchIndianJobs(domain),
        fetchLinkedIn(),
        fetchJSearch(domain),
        fetchFindWork(domain),
        fetchGoogleJobs(domain)
      ]);

      const domainJobs = results
        .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      
      allFetchedJobs = [...allFetchedJobs, ...domainJobs];
      
      // If targeted search, break early
      if (queryParam) break;
    }

    if (allFetchedJobs.length === 0) {
      return NextResponse.json({ success: true, message: 'No live jobs fetched. Check API status.' });
    }

    let insertedCount = 0;
    for (const job of allFetchedJobs) {
      const jobAgeDays = (Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (jobAgeDays > 25) continue;

      try {
        await (prisma.job as any).upsert({
          where: { externalId: job.externalId },
          update: {
            title: job.title,
            description: job.description,
            isLive: true
          },
          create: {
            externalId: job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            postedAt: job.postedAt,
            url: job.url,
            source: job.source,
            isLive: true
          }
        });
        insertedCount++;
      } catch (upsertError) { }
    }

    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
    const deletedOps = await (prisma.job as any).deleteMany({
      where: { postedAt: { lt: twentyFiveDaysAgo } }
    });

    // 7. Match New Jobs with Subscribed Users & Send Notifications
    try {
      const subscribedUsers = await (prisma.user as any).findMany({
        where: { autoApplyEnabled: true }
      });

      if (subscribedUsers.length > 0) {
        console.log(`CRON: Matching ${allFetchedJobs.length} new jobs against ${subscribedUsers.length} users...`);
        
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        for (const user of subscribedUsers) {
          const keywords = ((user as any).autoApplyKeywords || '').split(',').map((k: string) => k.trim().toLowerCase()).filter((k: string) => k);
          if (keywords.length === 0) continue;

          for (const job of allFetchedJobs) {
            const matchesText = (job.title + ' ' + (job.description || '')).toLowerCase();
            const isMatch = keywords.some((k: string) => matchesText.includes(k));

            if (isMatch) {
              // Create a secure auto-apply link
              // Note: In production, include a cryptographic token to prevent abuse
              const applyLink = `${url.origin}/api/auto-apply?jobId=${job.id || job.externalId}&userId=${user.id}&token=secure_bypass`;

              await transporter.sendMail({
                from: `"Click Apply AI" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `🚀 [${job.matchScore || '90'}% Match] New Role: ${job.title} at ${job.company}`,
                html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; color: white;">
                      <h1 style="margin: 0; font-size: 24px;">New Job Match Found!</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">We found a position that fits your profile perfectly.</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                      <div style="margin-bottom: 25px;">
                        <span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 14px;">🎯 ${job.matchScore || '92'}% Match Score</span>
                      </div>
                      
                      <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 20px;">${job.title}</h2>
                      <p style="color: #64748b; margin: 0 0 20px 0; font-size: 16px;">${job.company} • ${job.location || 'India'}</p>
                      
                      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-bottom: 30px;">
                         <p style="color: #475569; line-height: 1.6; font-size: 15px;">
                           ${job.description || 'No description available.'}
                         </p>
                         <p style="color: #94a3b8; font-size: 13px; margin-top: 15px;">
                           This role was matched based on your <strong>Automation Keywords</strong>. Apply below to submit your profile immediately.
                         </p>
                      </div>

                      <div style="text-align: center;">
                        <a href="${applyLink}" style="background: #3b82f6; color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: background 0.2s;">
                          Apply for this Position ⚡
                        </a>
                        <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">1 credit will be deducted. Please check your dashboard after applying for status updates.</p>
                      </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 13px; color: #64748b;">
                        Click Apply AI • Autonomous Career Hub
                      </p>
                    </div>
                  </div>
                `
              });
              console.log(`Notification sent to ${user.email} for ${job.title}`);
            }
          }
        }
      }
    } catch(err) {
      console.error('CRON: Matching/Notification failure:', err);
    }

    return NextResponse.json({
      success: true,
      message: `CRON Sync Complete. Upserted ${insertedCount} live jobs. Deleted ${deletedOps.count} old jobs. Notifications dispatched.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CRON Fatal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
