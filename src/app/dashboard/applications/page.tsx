"use client";

import { useState, useEffect } from 'react';
import styles from './applications.module.css';
import { loadApplications, ApplicationRecord } from '@/lib/applicationStore';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  sent: '#4F46E5',
  pending: '#F59E0B',
  viewed: '#06B6D4',
  rejected: '#EF4444',
  interview: '#10B981',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);

  useEffect(() => {
    setApplications(loadApplications());
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Applications</h1>
        <p>Track all job applications sent by the AI agent on your behalf.</p>
      </header>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No Applications Yet</h2>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
            Upload your resume, find matching jobs, and click "Quick Apply" to get started!
          </p>
          <Link href="/dashboard/jobs" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Find Jobs →
          </Link>
        </div>
      ) : (
        <div className={styles.appGrid}>
          {applications.map(app => (
            <div key={app.id} className={styles.appCard}>
              <div className={styles.appHeader}>
                <div className={styles.appStatus} style={{ background: STATUS_COLORS[app.status] || '#4F46E5' }}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </div>
                <div className={styles.appMatch}>{app.matchScore}% Match</div>
              </div>

              <h3 className={styles.appTitle}>{app.jobTitle}</h3>
              <p className={styles.appCompany}>{app.company} • {app.location}</p>
              <p className={styles.appDate}>
                Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
