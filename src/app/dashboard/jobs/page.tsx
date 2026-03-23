"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './jobs.module.css';
import dashStyles from '../dashboard.module.css';
import { loadProfile, CandidateProfile } from '@/lib/profileStore';
import { logApplication } from '@/lib/applicationStore';
import { getCredits } from '@/lib/creditsStore';
import Toast from '@/components/Toast';
import JobCard from '@/components/JobCard';
import AdvancedSearchBar from '@/components/AdvancedSearchBar';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>(['Procurement']);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [noProfile, setNoProfile] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'warning'|'info'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  const fetchJobs = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
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
        body: JSON.stringify({ 
          profile: storedProfile,
          tags: ['Procurement'] // Default fallback
        })
      });
      const result = await res.json();
      if (result.success) {
        setJobs(result.data);
        setFilteredJobs(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setToast({ message: 'Refreshing Job API for your roles... 🚀', type: 'info' });
    try {
      // Pass the user's current searchTags to the sync API for a targeted (fast) refresh
      const query = searchTags.length > 0 ? searchTags[0] : 'Procurement';
      const res = await fetch(`/api/cron/sync-jobs?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setToast({ message: `Success! Synchronized ${data.count} new roles for you.`, type: 'success' });
        await fetchJobs(false); // Silent re-fetch
      } else {
        setToast({ message: 'Refresh failed. Please try again.', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error during refresh.', type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async (tags: string[], target: number, loc: string) => {
    setIsLoading(true);
    setSearchTags(tags);
    try {
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, limit: target, profile })
      });
      const result = await res.json();
      if (result.success) {
        setFilteredJobs(result.data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setCurrentPage(1);
      setIsLoading(false);
    }
  };

  const handleApplySuccess = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      logApplication({ id: jobId, title: job.title, company: job.company, location: job.location, matchScore: job.matchScore });
    }
    setAppliedIds(prev => new Set(prev).add(jobId));
    window.dispatchEvent(new Event('storage'));
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Job Matches</h1>
            <p>
              {profile 
                ? `We found ${filteredJobs.length} potential matches for your profile.`
                : 'Based on your resume, these are the best roles for you right now.'}
            </p>
          </div>
          <button 
            className={styles.refreshBtn} 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '✨ Syncing...' : '🔄 Refresh Live Jobs'}
          </button>
        </div>
      </header>

      {noProfile ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h2>No Resume Found</h2>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Upload your resume to see personalized matches.</p>
          <Link href="/dashboard/resume" className={styles.uploadBtn}>Upload Resume →</Link>
        </div>
      ) : (
        <>
          <div className={styles.searchSection}>
            <AdvancedSearchBar 
              onSearch={handleSearch} 
            />
          </div>

          <div className={styles.resultsHeader}>
            <span>Showing {filteredJobs.length} match{filteredJobs.length !== 1 ? 'es' : ''}</span>
            <div className={styles.filters}>
              <select className={styles.sortSelect}>
                <option>Most Relevant</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loader}>Searching our database for the best live roles...</div>
          ) : filteredJobs.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No direct matches found.</h3>
              <p>Try broadening your search or updating your profile skills.</p>
            </div>
          ) : (
            <div className={dashStyles.jobList}>
              {currentJobs.map(job => (
                <JobCard 
                  key={job.id}
                  job={job}
                  user={{ name: profile?.name || 'User', email: profile?.email || '', avatar: 'U' }}
                  appliedJobs={appliedIds}
                  onApplySuccess={handleApplySuccess}
                  onToast={(msg, type) => setToast({message: msg, type})}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
