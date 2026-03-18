"use client";

import { useState } from 'react';
import styles from './resume.module.css';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first.');
    
    setIsParsing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        setParsedData(result.data);
      } else {
        alert(result.error || 'Parsing failed');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Resume</h1>
        <p>Upload your latest resume to help AI find the best jobs for you.</p>
      </header>

      <section className={styles.uploadSection}>
        <div className={styles.dropzone}>
          <div className={styles.uploadIcon}>📄</div>
          <h3>{file ? file.name : "Drag & Drop your resume here"}</h3>
          <p>Supports PDF, DOCX (Max 5MB)</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <label className={styles.browseBtn}>
              Browse Files
              <input type="file" accept=".pdf,.doc,.docx" hidden onChange={handleFileChange} />
            </label>
            {file && (
              <button 
                className={styles.browseBtn} 
                style={{ background: '#a855f7' }}
                onClick={handleUpload}
                disabled={isParsing}
              >
                {isParsing ? 'Parsing AI...' : 'Upload & Parse'}
              </button>
            )}
          </div>
        </div>
      </section>

      {parsedData && (
        <section className={styles.parsedDataSection}>
          <h2>Extracted Profile</h2>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>{parsedData.name.substring(0, 2).toUpperCase()}</div>
              <div>
                <h3>{parsedData.name}</h3>
                <p className={styles.domain}>{parsedData.domain} • {parsedData.experience} Years Exp</p>
              </div>
            </div>
            
            <div className={styles.skillsSection}>
              <h4>Top Skills</h4>
              <div className={styles.skillsList}>
                {parsedData.skills.map((skill: string, idx: number) => (
                  <span key={idx} className={styles.skillBadge}>{skill}</span>
                ))}
              </div>
            </div>

            <button className={styles.editBtn}>Edit Profile manually</button>
          </div>
        </section>
      )}
    </div>
  );
}
