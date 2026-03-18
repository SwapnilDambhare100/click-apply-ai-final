"use client";

import { useState, useEffect } from 'react';
import styles from './jobs.module.css';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch matched jobs for the current user
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/match-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: {
              name: "John Doe",
              domain: "Procurement",
            }
          })
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
    setApplyingJobId(jobId);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          userId: 'mock-user-123',
          profile: {
            name: "John Doe",
            domain: "Procurement",
            skills: ["Vendor Management"]
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Application Sent Successfully! Check terminal logs for the mocked email.');
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
        <p>Based on your latest resume parsing, here are the best matches for you.</p>
      </header>

      <div className={styles.controls}>
        <input type="text" placeholder="Search jobs..." className={styles.searchInput} />
        <select className={styles.filterSelect}>
          <option>Sort by Match %</option>
          <option>Sort by Date</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading matched jobs...</div>
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
                <p>Looking for an experienced professional to handle vendor relationships and manage end-to-end supply chain operations...</p>
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
          {jobs.length === 0 && <p>No matched jobs found.</p>}
        </div>
      )}
    </div>
  );
}
