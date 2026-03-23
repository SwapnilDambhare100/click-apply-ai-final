"use client";

import { useState, useEffect } from 'react';
import styles from './SearchAgent.module.css';

export default function SearchAgent() {
  const [jobTitle, setJobTitle] = useState('');
  const [tags, setTags] = useState(['Procurement']);
  const [targetJobs, setTargetJobs] = useState('Target 50 jobs');
  
  // Live Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter States
  const [location, setLocation] = useState('Location ▾');

  const handleAddTag = () => {
    if (jobTitle.trim() && !tags.includes(jobTitle.trim())) {
      setTags([...tags, jobTitle.trim()]);
      setJobTitle('');
    }
  };

  const handleLiveSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const query = tags.length > 0 ? tags.join(' ') : 'Software Engineer';
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { domain: query } })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSearchResults(data.data.slice(0, 3)); // Only show top 3 on landing page as a teaser
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('clickapply_user');
    if (stored) {
      setIsLoggedIn(true);
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleStartAgent = async (job?: any) => {
    if (!isLoggedIn) {
      window.open('/login', '_blank');
      return;
    }

    if (job) {
      // If a specific job is provided (from the Auto Apply button)
      setIsSearching(true);
      try {
        const res = await fetch('/api/send-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: user?.email || 'swapnildambhare100@gmail.com', // Dynamic first, fallback second
            jobTitle: job.title,
            company: job.company,
            applicantName: user?.name || 'Puja',
            applicantEmail: user?.email || '',
            matchScore: job.matchScore || 90,
            jobId: job.id
          })
        });
        const data = await res.json();
        if (data.success) {
          alert(`Application sent for ${job.title}! 🚀`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Redirect to dashboard if general "Start Agent" is clicked while logged in
      window.location.href = '/dashboard';
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Apply Jobs Across Platforms</h2>
        <p>Find and apply to jobs from LinkedIn, Indeed, and more all in one place, with a single search.</p>
      </div>

      <div className={styles.searchCard}>
        <div className={styles.searchMain}>          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className={styles.inputWrapper} style={{ borderBottom: 'none' }}>
              <span className={styles.searchIcon} onClick={handleLiveSearch} style={{cursor: 'pointer'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <span className={styles.forText}>For</span>
              
              <div className={styles.tags}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag} 
                    <button onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
                  </span>
                ))}
              </div>
              
              <input 
                type="text" 
                placeholder={tags.length === 0 ? "Enter job title & hit enter..." : "Add another title..."}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag();
                    handleLiveSearch();
                  }
                }}
              />
              {jobTitle.trim() && <button className={styles.addBtn} onClick={handleAddTag}>+ ADD</button>}
            </div>
            {/* Smart Tags Array */}
            <div style={{ padding: '0px 20px 12px 40px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>Smart Tags:</span>
              <button onClick={() => setTags(['Procurement'])} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }}>Procurement</button>
              <button onClick={() => setTags(['Software'])} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }}>Software</button>
              <button onClick={() => setTags(['Data Science'])} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }}>Data Science</button>
              <button onClick={() => setTags(['Marketing'])} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' }}>Marketing</button>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.targetWrapper}>
            <span className={styles.listIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </span>
            <select value={targetJobs} onChange={(e) => setTargetJobs(e.target.value)}>
              <option>Target 10 jobs</option>
              <option>Target 50 jobs</option>
              <option>Target 100 jobs</option>
            </select>
          </div>

          <button className={styles.startBtn} onClick={handleLiveSearch}>
            <span className={styles.robotIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            </span> 
            Start Agent
          </button>
        </div>
      </div>

      <div className={styles.filters} style={{ margin: '12px 0 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={styles.filterPillDark} onClick={handleLiveSearch}>All Platforms ▾</button>
        <button className={styles.filterPillOutline} onClick={() => { setLocation('Remote ▾'); handleLiveSearch(); }}>
          {location}
        </button>
        <button className={styles.clearBtn} onClick={() => { setTags([]); setSearchResults([]); setHasSearched(false); }} style={{ marginLeft: 'auto' }}>✕ Clear all</button>
      </div>
      {hasSearched && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>
            {isSearching ? 'Scanning live job boards...' : `Found latest roles for ${tags.length ? tags.join(', ') : 'Software Engineer'}...`}
          </h3>
          
          {isSearching ? (
             <div className={styles.loadingSpinner}></div>
          ) : (
             <div className={styles.jobsGrid}>
               {searchResults.map((job) => (
                 <div key={job.id} className={styles.jobCard}>
                   <div className={styles.jobHeader}>
                     <h4>{job.title}</h4>
                     <span className={styles.matchBadge}>{job.matchScore || '90'}% Match</span>
                   </div>
                   <div className={styles.jobCompany}>{job.company} • {job.location}</div>
                   <p className={styles.jobDesc}>{job.description || 'Excellent opportunity to join a fast growing team and make an immediate impact on global operations.'}</p>
                   <div className={styles.jobFooter}>
                     <span className={styles.posted}>{job.posted || 'Just now'}</span>
                     <button className={styles.applyBtn} onClick={() => handleStartAgent(job)}>Auto Apply ⚡</button>
                   </div>
                 </div>
               ))}
               {searchResults.length > 0 && (
                 <div className={styles.viewMoreBox}>
                    <p>+ {targetJobs.replace('Target ', '')} more jobs found matching this query.</p>
                    <button className={styles.viewMoreBtn} onClick={handleStartAgent}>Sign in to apply to all</button>
                 </div>
               )}
             </div>
          )}
        </div>
      )}
    </section>
  );
}
