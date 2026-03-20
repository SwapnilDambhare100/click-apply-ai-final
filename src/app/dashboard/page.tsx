"use client";

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [user, setUser] = useState({ name: 'User', email: '', avatar: 'U' });

  useEffect(() => {
    const stored = localStorage.getItem('clickapply_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleAutoApply = async (job: any) => {
    if (job.matchScore < 80) {
      alert("Match score is below 80%. Manual review recommended before applying.");
      return;
    }
    setApplyingTo(job.id);
    try {
      const res = await fetch('/api/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: 'unitedofficial100@gmail.com',
          jobTitle: job.title,
          company: job.company,
          applicantName: 'ClickApplyAI Trial User',
          applicantEmail: 'john.doe@example.com',
          matchScore: job.matchScore
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(job.id);
          return newSet;
        });
        if (!data.messageId) {
            alert('Application Draft Generated! But EMAIL NOT SENT! You must configure EMAIL_USER and a Google App Password for EMAIL_PASS in your .env.local file first.');
        } else {
            alert(`Application sent successfully to unitedofficial100@gmail.com for ${job.company}!`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
    } finally {
      setApplyingTo(null);
    }
  };

  useEffect(() => {
    // Fetch live jobs from our new robust Multi-Platform API
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/match-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: { domain: 'Product Manager' } })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setJobs(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <>
      <header className={styles.candidateHeader}>
          <div className={styles.candidateAvatarLarge}>{user.avatar}</div>
          <div className={styles.candidateInfo}>
            <h1>Welcome back, {user.name}! 👋</h1>
            <p className={styles.candidateRole}>{user.email || 'Complete your profile to get started'}</p>
            <div className={styles.candidateTags}>
              <span className={styles.profileTag}>AI Job Matching</span>
              <span className={styles.profileTag}>Auto Apply</span>
              <span className={styles.profileTag}>Resume Parsing</span>
            </div>
          </div>
          <div className={styles.topRightActions}>
            <Link href="/dashboard/profile" className={styles.editProfileBtn} style={{textDecoration: 'none'}}>Edit Profile</Link>
            <div className={styles.userProfileSmall}>{user.avatar}</div>
          </div>
        </header>

        <section className={styles.section} style={{ marginBottom: '4rem', background: 'rgba(99, 102, 241, 0.05)', padding: '2rem', borderRadius: '20px', border: '1px dashed var(--primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>📧 Automated Job Matching: Trial</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.6 }}>
            Based on the AI analysis, the platform will automatically send stunning HTML job application emails directly to recruiters, attaching your resume. <br/>
            <strong>Click below to generate and instantly view the exact professional draft targeting {user.email || 'your email'}!</strong>
          </p>
          <button 
            className={styles.applyBtn} 
            onClick={async () => {
              const res = await fetch('/api/send-application', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  toEmail: user.email || 'swapnildambhare100@gmail.com',
                  jobTitle: 'Software Engineer',
                  company: 'Top Company',
                  applicantName: user.name,
                  applicantEmail: user.email,
                  matchScore: 92
                })
              });
              const data = await res.json();
              if (data.draft) {
                const w = window.open('', '_blank');
                if (w) {
                  w.document.write(data.draft);
                  w.document.title = "Application Draft Preview";
                  w.document.close();
                }
              }
            }}
          >
            Generate & View Draft for {user.email || 'your email'}
          </button>
        </section>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📨</div>
            <div>
              <div className={styles.statLabel}>Total Applications Sent</div>
              <div className={styles.statValue}>15</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div>
              <div className={styles.statLabel}>Average Match Score</div>
              <div className={styles.statValue}>92%</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚡</div>
            <div>
              <div className={styles.statLabel}>Profile Status</div>
              <div className={styles.statValueActive}>Active</div>
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Active Job Matches <span className={styles.matchCountBadge}>{jobs.length > 0 ? `${jobs.length} Ready` : 'Scanning...'}</span></h2>
            <button className={styles.viewAllBtn}>View All 50+ Matches ➔</button>
          </div>

          {loading ? (
             <div className={styles.loadingContainer}>
               <div className={styles.loadingSpinner}></div>
               <p>AI is scanning LinkedIn, Indeed, and Jooble for your perfect matches...</p>
             </div>
          ) : (
             <div className={styles.jobList}>
               {jobs.map((job) => (
                 <div key={job.id} className={styles.jobCard}>
                    <div className={styles.jobMain}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobCompany}>{job.company} • {job.location}</p>
                      <p className={styles.jobDesc}>{job.description}</p>
                      <div className={styles.jobTags}>
                         <span className={styles.jobTag}>{job.posted}</span>
                      </div>
                    </div>
                    <div className={styles.jobRight}>
                      <div className={styles.jobMatch}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        {job.matchScore}% Match
                      </div>
                      <button 
                         className={styles.applyBtn}
                         onClick={() => handleAutoApply(job)}
                         disabled={appliedJobs.has(job.id) || applyingTo === job.id || job.matchScore < 80}
                         style={{ 
                            ...((appliedJobs.has(job.id) || applyingTo === job.id) ? { background: 'var(--success)', opacity: 0.8, cursor: 'not-allowed' } : {}),
                            ...(job.matchScore < 80 ? { background: 'transparent', border: '1px solid var(--foreground)', opacity: 0.5, cursor: 'not-allowed' } : {})
                         }}
                      >
                         {job.matchScore < 80 ? 'Low Match' : (appliedJobs.has(job.id) ? 'Applied ✓' : (applyingTo === job.id ? 'Sending... ⏳' : 'Auto Apply ⚡'))}
                      </button>
                    </div>
                 </div>
               ))}
               {jobs.length === 0 && <p style={{color: 'var(--foreground)'}}>No matches found at the moment. Update your resume to trigger a new search.</p>}
             </div>
          )}
      </section>
    </>
  );
}
