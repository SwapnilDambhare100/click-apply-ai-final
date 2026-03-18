"use client";

import { useState } from 'react';
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

  const handleStartAgent = () => {
    // If not authenticated, open login in new tab
    window.open('/login', '_blank');
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>Apply Jobs Across Platforms</h2>
        <p>Find and apply to jobs from LinkedIn, Indeed, and more all in one place, with a single search.</p>
      </div>

      <div className={styles.searchCard}>
        <div className={styles.searchMain}>
          <div className={styles.inputWrapper}>
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

          <button className={styles.startBtn} onClick={handleStartAgent}>
            <span className={styles.robotIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
            </span> 
            Start Agent
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <button className={styles.filterPillDark} onClick={handleLiveSearch}>All Platforms ▾</button>
        <button className={styles.filterPillOutline} onClick={handleLiveSearch}>
          Select Profile <span style={{color: '#ef4444', marginLeft: '2px'}}>*</span> ▾
        </button>
        <button className={styles.filterPillOutline} onClick={() => { setLocation('Remote ▾'); handleLiveSearch(); }}>
          {location}
        </button>
        <button className={styles.filterPillDark} onClick={handleLiveSearch}>
          Past week <span className={styles.newBadge}>NEW</span> ▾
        </button>
        <button className={styles.filterPillOutline} onClick={handleLiveSearch}>Additional Filters ▾</button>
        <button className={styles.clearBtn} onClick={() => { setTags([]); setSearchResults([]); setHasSearched(false); }}>✕ Clear all</button>
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
                     <button className={styles.applyBtn} onClick={handleStartAgent}>Auto Apply ⚡</button>
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
