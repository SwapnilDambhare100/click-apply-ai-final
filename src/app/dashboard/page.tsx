"use client";

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { loadProfile, CandidateProfile } from '@/lib/profileStore';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';
import Toast from '@/components/Toast';
import JobCard from '@/components/JobCard';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [user, setUser] = useState({ name: 'User', email: '', avatar: 'U' });
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'warning'|'info'} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('clickapply_user');
    let currentUser: any = null;
    if (stored) {
      currentUser = JSON.parse(stored);
      setUser(currentUser);
    }
    const loadedProfile = loadProfile();
    if (loadedProfile) setProfile(loadedProfile);

    // Fetch Applied History
    if (currentUser?.email) {
      fetch(`/api/user/applications?email=${currentUser.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.appliedJobIds) {
            setAppliedJobs(new Set(data.appliedJobIds));
          }
        })
        .catch(err => console.error("Failed to fetch applications history", err));
    }
  }, []);

  const getAtsScore = () => {
    if (!profile || (!profile.skills?.length && !profile.targetRoles?.length)) {
      return { score: 0, status: 'No Profile', message: 'Please upload your resume to get your ATS score.', missing: ['Missing Resume data'] };
    }
    let score = 40;
    if (profile.skills?.length > 5) score += 20;
    if (profile.skills?.length > 10) score += 15;
    if (profile.totalExperience > 2) score += 15;
    if (profile.targetRoles?.length > 0) score += 10;
    if (score > 98) score = 98;
    
    let status = 'Excellent';
    if (score < 60) status = 'Needs Improvement';
    else if (score < 80) status = 'Good';

    let message = 'Your resume matches well with generic roles, but could use more specifics.';
    if (score >= 80) message = 'Your resume is highly optimized for ATS parsing and keyword extraction.';

    const missing = [];
    if (!profile.skills || profile.skills.length < 5) missing.push('Add more targeted skills');
    if (!profile.targetRoles || profile.targetRoles.length === 0) missing.push('Specify target roles explicitly');
    if (profile.totalExperience === 0) missing.push('Add comprehensive work experience details');

    return { score, status, message, missing };
  };

  const atsData = getAtsScore();
  const strokeDashoffset = 283 - (283 * Math.max(0, atsData.score) / 100);

  const toggleExpandJob = (id: string) => {
    setExpandedJobId(prev => prev === id ? null : id);
  };

  const handleApplySuccess = (jobId: string) => {
    setAppliedJobs(prev => {
      const newSet = new Set(prev);
      newSet.add(jobId);
      return newSet;
    });
    // Trigger global storage event to update layout header nav credits
    window.dispatchEvent(new Event('storage'));
  };

  const fetchJobs = async (tags: string[] = ['Procurement'], target = 10) => {
    setLoading(true);
    try {
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile,
          tags,
          limit: target 
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setJobs(data.data);
      } else if (data.data && data.data.length === 0) {
        setJobs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchJobs(['Procurement']);
    }
  }, [profile]);

  const handleSearch = (tags: string[], target: number, location: string) => {
    fetchJobs(tags, target);
  };

  return (
    <>
      <div className={styles.topSearchWrapper}>
        <AdvancedSearchBar onSearch={handleSearch} />
      </div>

      <div className={styles.dashboardGrid}>
        {/* MIDDLE COLUMN */}
        <div className={styles.middleColumn}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Active Job Matches <span className={styles.matchCountBadge}>{jobs.length > 0 ? `${jobs.length} Ready` : 'Scanning...'}</span></h2>
              <Link href="/dashboard/jobs" style={{textDecoration: 'none'}}>
                <button className={styles.viewAllBtn}>View All 50+ Matches ➔</button>
              </Link>
            </div>

            {loading ? (
               <div className={styles.loadingContainer}>
                 <div className={styles.loadingSpinner}></div>
                 <p>AI is scanning LinkedIn, Indeed, and Jooble for your perfect matches...</p>
               </div>
            ) : (
               <div className={styles.jobList}>
                 {jobs.map((job) => (
                   <JobCard 
                     key={job.id}
                     job={job}
                     user={user}
                     appliedJobs={appliedJobs}
                     onApplySuccess={handleApplySuccess}
                     onToast={(msg, type) => setToast({message: msg, type})}
                   />
                 ))}
                 {jobs.length === 0 && <p style={{color: 'var(--foreground)'}}>No matches found at the moment. Update your resume to trigger a new search.</p>}
               </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <header className={styles.sidebarHeader}>
            <div className={styles.candidateAvatarSmall}>{user.avatar}</div>
            <div className={styles.candidateInfoMini}>
              <h2 style={{fontSize: '1rem', fontWeight: 800, margin: 0}}>{user.name}</h2>
              <p style={{fontSize: '0.75rem', opacity: 0.6, margin: 0}}>{user.email}</p>
            </div>
            <Link href="/dashboard/profile" className={styles.editProfileIcon} title="Edit Profile">⚙️</Link>
          </header>

          <div className={styles.sidebarStats}>
            <div className={styles.statCardMini}>
              <span className={styles.statIconLine}>📨</span>
              <div className={styles.statRow}>
                <span className={styles.statLabelMini}>Applications</span>
                <span className={styles.statValueMini}>{appliedJobs.size}</span>
              </div>
            </div>
            <div className={styles.statCardMini}>
              <span className={styles.statIconLine}>🎯</span>
              <div className={styles.statRow}>
                <span className={styles.statLabelMini}>Match Score</span>
                <span className={styles.statValueMini}>{atsData.score}%</span>
              </div>
            </div>
            <div className={styles.statCardMini}>
              <span className={styles.statIconLine}>⚡</span>
              <div className={styles.statRow}>
                <span className={styles.statLabelMini}>Status</span>
                <span className={styles.statStatusMini}>{atsData.status === 'No Profile' ? 'Offline' : 'Active'}</span>
              </div>
            </div>
          </div>

          {/* ATS SCORE WIDGET */}
          <section className={styles.atsSection}>
            <div className={styles.atsLeft}>
              <div className={styles.atsCircleContainer}>
                <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
                  <circle cx="50" cy="50" r="45" className={styles.atsCircleBg} />
                  <circle cx="50" cy="50" r="45" className={styles.atsCircleProgress} style={{strokeDasharray: '283', strokeDashoffset: strokeDashoffset.toString()}} />
                </svg>
                <div className={styles.atsScoreText}>
                  <span className={styles.atsScoreValue}>{atsData.score}</span>
                  <span className={styles.atsScoreLabel}>/ 100</span>
                </div>
              </div>
              <div className={styles.atsStatus}>{atsData.status}</div>
            </div>
            <div className={styles.atsRight}>
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 800}}>Your Resume Strength</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '1.5rem', lineHeight: 1.5}}>{atsData.message}</p>
              {atsData.missing.length > 0 && (
                <ul className={styles.atsImprovements}>
                  {atsData.missing.map((msg, i) => (
                    <li key={i}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      {msg}
                    </li>
                  ))}
                </ul>
              )}
              <button className={styles.improveBtn} onClick={() => window.location.href='/dashboard/resume'}>Improve Resume with AI</button>
            </div>
          </section>

          <section className={styles.section} style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '2rem', borderRadius: '20px', border: '1px dashed var(--primary)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>📧 Background Apply</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.6 }}>
              Test exact professional draft targeting {user.email || 'your email'}!
            </p>
            <button 
              className={styles.applyBtn} 
              style={{ width: '100%', padding: '0.875rem' }}
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
              Generate Draft
            </button>
          </section>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
