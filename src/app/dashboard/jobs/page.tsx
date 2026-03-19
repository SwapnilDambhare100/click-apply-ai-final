"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './jobs.module.css';
import { loadProfile, CandidateProfile } from '@/lib/profileStore';
import { logApplication } from '@/lib/applicationStore';
import { getCredits, deductCredit } from '@/lib/creditsStore';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    setCredits(getCredits()); // Load credits from store
    const fetchJobs = async () => {
      const storedProfile = loadProfile();
      
      if (!storedProfile || (!storedProfile.skills?.length && !storedProfile.targetRoles?.length)) {
        setNoProfile(true);
        setIsLoading(false);
        return;
      }
      
      setProfile(storedProfile);

      try {
        const res = await fetch('/api/match-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: storedProfile })
        });
        const result = await res.json();
        if (result.success) {
          setJobs(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !profile) return;

    // Check credits before applying
    const { success, remaining } = deductCredit();
    if (!success) {
      alert('❌ No credits left! Please top up to continue applying.');
      return;
    }
    setCredits(remaining);
    setApplyingJobId(jobId);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          userId: profile.email || 'user',
          profile,
          jobDetails: {
            title: job.title,
            company: job.company,
            hrEmail: job.hrEmail || '',
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        // Log the application to the tracker
        logApplication({ id: jobId, title: job.title, company: job.company, location: job.location, matchScore: job.matchScore });
        setAppliedIds(prev => new Set(prev).add(jobId));
        alert(`✅ Application sent for ${job.title} at ${job.company}!`);
      } else {
        alert('Application Failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error applying to job');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Recommended Jobs</h1>
        <p>
          {profile 
            ? `Matching jobs for ${profile.name || 'you'} · ${profile.skills?.length || 0} skills detected`
            : 'Based on your latest resume parsing, here are the best matches for you.'}
        </p>
      </header>

      {/* No profile uploaded yet */}
      {noProfile ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No Resume Uploaded Yet</h2>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Please upload your resume first so we can find the best job matches for you.</p>
          <Link href="/dashboard/resume" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Upload Resume →
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.controls}>
            <input type="text" placeholder="Search jobs..." className={styles.searchInput} />
            <select className={styles.filterSelect}>
              <option>Sort by Match %</option>
              <option>Sort by Date</option>
            </select>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>Finding jobs matched to your profile...</div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.7 }}>No jobs found. Try updating your resume with more skills.</div>
          ) : (
            <div className={styles.jobGrid}>
              {jobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobMatch}>{job.matchScore || job.match}% Match</div>
                    <div className={styles.jobPosted}>{job.posted}</div>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobCompany}>{job.company} • {job.location}</p>
                  
                  <div className={styles.jobDetails}>
                    <p>{job.description || 'Looking for an experienced professional to handle this role.'}</p>
                  </div>
                  
                  <div className={styles.jobActions}>
                    <button className={styles.viewBtn}>View Details</button>
                    <button 
                      className={styles.applyBtn}
                      onClick={() => handleApply(job.id)}
                      disabled={applyingJobId === job.id}
                    >
                      {applyingJobId === job.id ? 'Sending...' : 'Quick Apply (1 Credit)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
