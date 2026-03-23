"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './resume.module.css';
import { saveProfile, loadProfile } from '@/lib/profileStore';

interface ResumeHistoryItem {
  id: string;
  name: string;
  date: string;
  parsedData: any;
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string>('');

  useEffect(() => {
    const stored = loadProfile();
    if (stored) setParsedData(stored);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLastUploadedFileName(selectedFile.name);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (uploadFile: File) => {
    if (!uploadFile) return;
    setIsParsing(true);
    const formData = new FormData();
    formData.append('resume', uploadFile);

    try {
      const response = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Parsing failed. Check server console.");
      }
      
      if (!response.ok) throw new Error(result.error || 'Server error');

      if (result.data) {
        const savedProfile = saveProfile(result.data);
        setParsedData(savedProfile);
        const newItem: ResumeHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: uploadFile.name,
          date: new Date().toLocaleString(),
          parsedData: savedProfile
        };
        setResumeHistory(prev => [newItem, ...prev]);
        setFile(null);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Resumes</h1>
        <p>Your centralized resume vault for AI matching and applications.</p>
      </header>

      <section className={styles.uploadSection}>
        <div className={styles.dropzone}>
          <div className={styles.uploadIcon}>📄</div>
          <h3>{isParsing ? 'Processing AI Magic...' : (file ? file.name : "Upload new version")}</h3>
          <p>AI will automatically read keywords, skills, and your recent position.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <label className={styles.browseBtn} style={{ opacity: isParsing ? 0.6 : 1, pointerEvents: isParsing ? 'none' : 'auto' }}>
              {isParsing ? 'Reading Keywords...' : 'Browse Resume'}
              <input type="file" accept=".pdf,.docx" hidden onChange={handleFileChange} />
            </label>
          </div>
        </div>
      </section>

      {/* NEW: Recently Uploaded Indicator */}
      {lastUploadedFileName && !isParsing && (
        <div style={{ marginBottom: '2rem', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
           <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600 }}>
             ✅ Successfully processed: {lastUploadedFileName}
           </span>
        </div>
      )}

      {parsedData && (
        <section className={styles.parsedDataSection}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {(parsedData.personalInfo?.name || 'User').substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3>{parsedData.personalInfo?.name || 'Active Resume'}</h3>
                <p className={styles.domain}>
                  {parsedData.recentPosition || parsedData.targetRoles?.[0] || 'Professional'} &bull; {parsedData.totalExperience || 0} Years Exp
                </p>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '4px' }}>
                  AI Detected: {parsedData.skills?.length || 0} Key Keywords
                </p>
              </div>
              <div>
                 <button className={styles.downloadBtn} onClick={() => alert('Downloading your original file...')}>
                    📥 Download
                 </button>
              </div>
            </div>
            
            <div className={styles.skillsSection}>
              <h4>Skills Radar (AI Read)</h4>
              <div className={styles.skillsList}>
                {parsedData.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className={styles.skillBadge}>{skill}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/dashboard/jobs" className={styles.editBtn} style={{ background: 'var(--primary)', color: 'white', border: 'none', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                View Matches ⚡
              </Link>
            </div>
          </div>
        </section>
      )}

      {resumeHistory.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Version History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resumeHistory.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.date}</div>
                </div>
                <button 
                  className={styles.editBtn}
                  onClick={() => setParsedData(item.parsedData)}
                >
                  Apply to Profile
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
