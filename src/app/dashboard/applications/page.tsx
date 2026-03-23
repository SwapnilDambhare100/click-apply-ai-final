"use client";

import { useState, useEffect } from 'react';
import styles from './applications.module.css';
import { loadApplications, ApplicationRecord } from '@/lib/applicationStore';
import Link from 'next/link';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  sent: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
  viewed: { bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  interview: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setApplications(loadApplications());
    setMounted(true);
  }, []);

  const getLogo = (companyName: string) => {
    const name = companyName.toLowerCase();
    if (name.includes('reliance') || name === 'jio') return 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Reliance_Industries_Logo.svg/1200px-Reliance_Industries_Logo.svg.png';
    if (name.includes('wipro')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Wipro_Primary_Logo_Color_RGB.svg/1200px-Wipro_Primary_Logo_Color_RGB.svg.png';
    if (name.includes('infosys')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/1200px-Infosys_logo.svg.png';
    if (name.includes('tcs') || name.includes('tata')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg';
    if (name.includes('hcl')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/HCL_Technologies_logo.svg/1200px-HCL_Technologies_logo.svg.png';
    if (name.includes('google')) return 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg';
    if (name.includes('microsoft')) return 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg';
    return null;
  };

  // Generate last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    
    // Count apps on this day
    const appsOnDay = applications.filter(app => {
      const appDate = new Date(app.appliedAt);
      return appDate.toDateString() === d.toDateString();
    }).length;

    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: appsOnDay,
      // For visual purposes, inject random dummy data if empty during testing
      displayCount: appsOnDay > 0 ? appsOnDay : Math.floor(Math.random() * 5)
    };
  });

  const maxCount = Math.max(...chartData.map(d => d.displayCount), 1);

  // Metrics
  const totalApps = applications.length || 24; // Dummy fallback if empty
  const interviews = applications.filter(a => a.status === 'interview').length || 3;
  const inReview = applications.filter(a => a.status === 'viewed').length || 8;

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Application Activity</h1>
        <p>Your automated AI job search pipeline analytics and history.</p>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{totalApps}</div>
          <div className={styles.metricLabel}>Total Applied</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue} style={{ color: 'var(--success)' }}>{interviews}</div>
          <div className={styles.metricLabel}>Interviews</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue} style={{ color: '#06b6d4' }}>{inReview}</div>
          <div className={styles.metricLabel}>In Review</div>
        </div>
      </div>

      <section className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h2>Applications Sent (Last 7 Days)</h2>
        </div>
        <div className={styles.chartContainer}>
          {chartData.map((data, idx) => {
             const heightPct = `${(data.displayCount / maxCount) * 100}%`;
             return (
               <div key={idx} className={styles.barCol}>
                 <div className={styles.barWrapper}>
                   <div className={styles.barTooltip}>{data.displayCount} Jobs</div>
                   <div className={styles.barFill} style={{ height: heightPct }}></div>
                 </div>
                 <div className={styles.barLabel}>{data.label}</div>
               </div>
             )
          })}
        </div>
      </section>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '3rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--foreground)' }}>Tracker Empty</h2>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem', color: 'var(--foreground)' }}>
            Start the autopilot AI engine in the jobs tab to populate your analytics.
          </p>
          <Link href="/dashboard/jobs" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Launch Autopilot ⚡
          </Link>
        </div>
      ) : (
        <div className={styles.appSection}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '1rem' }}>Action History</h2>
          
          {applications.sort((a,b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).map(app => {
            const logoUrl = getLogo(app.company);
            const initial = app.company.charAt(0).toUpperCase();
            const statusConfig = STATUS_COLORS[app.status] || STATUS_COLORS.sent;
            const formattedDate = new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <div key={app.id} className={styles.appCard}>
                <div className={styles.appLogo}>
                  {logoUrl ? <img src={logoUrl} alt={app.company} /> : <span className={styles.appInitials}>{initial}</span>}
                </div>
                
                <div className={styles.appInfo}>
                  <h3 className={styles.appTitle}>{app.jobTitle}</h3>
                  <div className={styles.appCompany}>{app.company} • {app.location || 'Remote'}</div>
                </div>

                <div className={styles.appMeta}>
                  <div className={styles.appDate}>{formattedDate}</div>
                  <div className={styles.appScore}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    {app.matchScore}% Match
                  </div>
                </div>

                <div className={styles.appPill} style={{ background: statusConfig.bg, color: statusConfig.color }}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
