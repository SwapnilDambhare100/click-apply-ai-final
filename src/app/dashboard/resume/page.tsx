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
  
  // Track all uploaded resumes
  const [resumeHistory, setResumeHistory] = useState<ResumeHistoryItem[]>([]);

  // Load existing profile from store on page mount
  useEffect(() => {
    const stored = loadProfile();
    if (stored) setParsedData(stored);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (uploadFile: File) => {
    if (!uploadFile) return;
    
    setIsParsing(true);
    const formData = new FormData();
    formData.append('resume', uploadFile);

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      // Safely catch Next.js HTML error pages instead of blind JSON crashing
      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (jsonError) {
        console.error("SERVER CRASH RAW HTML:", rawText);
        throw new Error(`Server crashed heavily. Response was not JSON. Status: ${response.status}. Check browser/server console for details!`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Server responded with an error');
      }

      if (result.data) {
        // Save to global profile store (shared across all dashboard pages)
        const savedProfile = saveProfile(result.data);
        setParsedData(savedProfile);
        
        // Add to history
        const newItem: ResumeHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: uploadFile.name,
          date: new Date().toLocaleString(),
          parsedData: savedProfile
        };
        setResumeHistory(prev => [newItem, ...prev]);
        setFile(null); // Clear active file after success
      } else {
        alert('Parsing failed: No data returned.');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Resume</h1>
        <p>Upload your latest resume (PDF or DOCX) to help AI find the best jobs for you.</p>
      </header>

      <section className={styles.uploadSection}>
        <div className={styles.dropzone}>
          <div className={styles.uploadIcon}>📄</div>
          <h3>{file ? file.name : "Drag & Drop your resume here"}</h3>
          <p>Supports PDF, DOCX (Max 5MB)</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <label className={styles.browseBtn} style={{ opacity: isParsing ? 0.6 : 1, pointerEvents: isParsing ? 'none' : 'auto', background: isParsing ? '#a855f7' : '' }}>
              {isParsing ? 'Scanning AI...' : 'Browse Files'}
              <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={handleFileChange} />
            </label>
          </div>
        </div>
      </section>

      {/* Active Parsed Profile (Last Uploaded) */}
      {parsedData && (
        <section className={styles.parsedDataSection}>
          <h2>Extracted Profile Insight ✅</h2>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {(parsedData.personalInfo?.name || parsedData.name || '??').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3>{parsedData.personalInfo?.name || parsedData.name || 'Unknown Name'}</h3>
                <p className={styles.domain}>
                  {parsedData.targetRoles?.[0] || 'Unknown Role'} &bull; {parsedData.totalExperience || 0} Years Exp
                </p>
                {parsedData.personalInfo?.email && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{parsedData.personalInfo.email}</p>
                )}
              </div>
            </div>
            
            <div className={styles.skillsSection}>
              <h4>Top Skills Detected</h4>
              <div className={styles.skillsList}>
                {parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills.map((skill: string, idx: number) => (
                  <span key={idx} className={styles.skillBadge}>{skill}</span>
                )) : <span>No skills detected.</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <Link href="/dashboard/jobs" className={styles.editBtn} style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
                Find Matching Jobs ⚡
              </Link>
              <Link href="/dashboard/profile" className={styles.editBtn} style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                Edit Profile Manually
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Uploaded Resumes History Window */}
      {resumeHistory.length > 0 && (
        <section className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
            Uploaded Resumes History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resumeHistory.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>📄</div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Uploaded: {item.date}</div>
                  </div>
                </div>
                <div>
                  <button 
                    style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => setParsedData(item.parsedData)}
                  >
                    Load Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
