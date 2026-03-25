"use client";

import { useState } from 'react';
import styles from './JobCard.module.css';
import { deductCredit } from '@/lib/creditsStore';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  posted: string;
  matchScore: number;
  description: string;
  aiVerified?: boolean;
}


interface User {
  name: string;
  email: string;
  avatar: string;
}

interface JobCardProps {
  job: Job;
  user: User;
  onApplySuccess: (jobId: string) => void;
  onToast: (msg: string, type: 'success' | 'info' | 'error' | 'warning') => void;
  appliedJobs: Set<string>;
}

export default function JobCard({ job, user, onApplySuccess, onToast, appliedJobs }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);

  // Parse Logo mapping explicitly
  const getLogo = (companyName: string) => {
    const name = companyName.toLowerCase();
    if (name.includes('reliance') || name === 'jio') return 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Reliance_Industries_Logo.svg/1200px-Reliance_Industries_Logo.svg.png';
    if (name.includes('wipro')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/1200px-Wipro_Primary_Logo_Color_RGB.svg.png';
    if (name.includes('infosys')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/1200px-Infosys_logo.svg.png';
    if (name.includes('tcs') || name.includes('tata')) return 'https://www.tata.com/content/dam/tata/images/logos/tata_logo.png';
    if (name.includes('hcl')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/HCL_Technologies_logo.svg/1200px-HCL_Technologies_logo.svg.png';
    if (name.includes('google')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg';
    if (name.includes('microsoft')) return 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg';
    return null;
  };

  const [logoError, setLogoError] = useState(false);
  const logoUrl = getLogo(job.company);
  const initial = job.company.charAt(0).toUpperCase();

  const handleApply = async () => {
    setApplying(true);
    
    // Deduct Credit
    const creditRes = deductCredit();
    if (!creditRes.success) {
      onToast("No credits left! Please top up to continue applying.", "warning");
      setApplying(false);
      return;
    }
    
    try {
      const res = await fetch('/api/send-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: user.email || 'swapnildambhare100@gmail.com',
          jobTitle: job.title,
          company: job.company,
          applicantName: user.name || 'Trial User',
          applicantEmail: user.email || 'john.doe@example.com',
          matchScore: job.matchScore,
          jobId: job.id
        })
      });
      const data = await res.json();
      if (data.success) {
        onApplySuccess(job.id);
        if (!data.messageId) {
            onToast('Application generated! (DEV MODE bypass)', 'info');
        } else {
            onToast(`Application sent to ${job.company}!`, 'success');
        }
      } else {
          onToast(data.error || "Failed to submit application", "error");
      }
    } catch (err) {
      console.error(err);
      onToast("Network error submitting application.", "error");
    } finally {
      setApplying(false);
    }
  };

  const isApplied = appliedJobs.has(job.id);
  const isLowMatch = job.matchScore < 80;

  return (
    <div className={styles.jobCard} style={{ flexDirection: expanded ? 'column' : 'row' }}>
      <div className={styles.jobCardHeader}>
        <div className={styles.jobMain}>
          <div className={styles.companyLogoContainer}>
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt={job.company} 
                className={styles.companyLogo} 
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className={styles.companyInitial}>{initial}</span>
            )}
          </div>
          <div className={styles.jobInfo}>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.jobCompany}>{job.company} • {job.location}</p>
            <div className={styles.jobTags}>
              <span className={styles.jobTag}>📅 {job.posted}</span>
              <span className={styles.jobTag}>🏢 Full-Time</span>
              {job.location.toLowerCase().includes('remote') && <span className={styles.jobTag}>🌍 Remote</span>}
            </div>
            {!expanded && (
               <button className={styles.seeMoreBtn} onClick={() => setExpanded(true)} style={{ paddingLeft: '0', marginTop: '0.8rem' }}>
                 See More <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </button>
            )}
          </div>
        </div>
        
        <div className={styles.jobRight}>
          <div className={styles.jobMatch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {job.matchScore}% Match
            {job.aiVerified && (
              <span className={styles.aiBadge} title="Semantic analysis verified by AI">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                AI
              </span>
            )}
          </div>

          <button 
            className={`${styles.applyBtn} ${isApplied ? styles.applied : ''}`}
            onClick={handleApply}
            disabled={isApplied || applying}
          >
            {isApplied ? 'Already Applied ✓' : (applying ? 'Sending... ⏳' : 'Auto Apply (1 Credit) ⚡')}
          </button>
        </div>
      </div>

      {expanded && (
        <div className={styles.jobExpandedContent}>
          <div className={styles.jobDetailGrid}>
            <div className={styles.jobDetailSection}>
              <h4>Full Job Description</h4>
              <p>{job.description} This is an extended section showcasing the full responsibilities and day-to-day requirements for this role. We are looking for highly motivated individuals who can hit the ground running to help build our core infrastructure and expand our product reach.</p>
              <h4>Required Skills</h4>
              <ul>
                <li>Proficiency in the required tech stack and tooling.</li>
                <li>Experience with scalable architecture and rapid deployment.</li>
                <li>Strong communication and teamwork abilities.</li>
              </ul>
            </div>
            <div className={styles.jobDetailSidebar}>
              <div className={styles.jobDetailSidebarItem}>
                <div className={styles.jobDetailSidebarLabel}>Experience Required</div>
                <div className={styles.jobDetailSidebarValue}>3-5 Years</div>
              </div>
              <div className={styles.jobDetailSidebarItem}>
                <div className={styles.jobDetailSidebarLabel}>Estimated Salary</div>
                <div className={styles.jobDetailSidebarValue}>Competitive / Equity</div>
              </div>
              <div className={styles.jobDetailSidebarItem}>
                <div className={styles.jobDetailSidebarLabel}>Tech Stack</div>
                <div className={styles.jobDetailSidebarValue}>Agile, Product, SaaS</div>
              </div>
            </div>
          </div>
          <div className={styles.jobActions}>
            <button className={styles.applyBtn} onClick={handleApply} disabled={isApplied || applying}>
              {applying ? 'Sending...' : (isApplied ? 'Applied ✓' : 'Apply Now ⚡')}
            </button>
            <button className={styles.btnSecondaryAction} onClick={() => onToast('Job saved to your profile!', 'success')}>Save Job</button>
            <button className={styles.btnSecondaryAction} onClick={() => onToast(`Checking ${job.company} company profile...`, 'info')}>View Company Profile</button>
            <button className={styles.seeMoreBtn} onClick={() => setExpanded(false)} style={{marginLeft: 'auto', marginTop: 0}}>
              Show Less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
