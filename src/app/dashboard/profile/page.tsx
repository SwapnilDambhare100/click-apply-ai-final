"use client";

import { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { loadProfile, saveProfile } from '@/lib/profileStore';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    experience: 0,
    domain: '',
    skills: '',
    targetRoles: ''
  });
  const [saved, setSaved] = useState(false);

  // Auto-populate from parsed resume data on page load
  useEffect(() => {
    const stored = loadProfile();
    if (stored) {
      setProfile({
        name: stored.name || '',
        email: stored.email || '',
        phone: stored.phone || '',
        experience: stored.totalExperience || 0,
        domain: stored.domain || stored.targetRoles?.[0] || '',
        skills: (stored.skills || []).join(', '),
        targetRoles: (stored.targetRoles || []).join(', ')
      });
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Persist updates back to the profile store
    saveProfile({
      personalInfo: { name: profile.name, email: profile.email, phone: profile.phone },
      skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean),
      totalExperience: profile.experience,
      targetRoles: profile.targetRoles.split(',').map(s => s.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Profile</h1>
        <p>Auto-populated from your uploaded resume. Edit and save to update job matching.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSave} className={styles.form}>
          
          <div className={styles.sectionTitle}>Personal Information</div>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Your full name" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} placeholder="your@email.com" />
            </div>
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className={styles.inputGroup}>
              <label>Years of Experience</label>
              <input type="number" value={profile.experience} onChange={e => setProfile({...profile, experience: Number(e.target.value)})} min={0} />
            </div>
          </div>

          <div className={styles.sectionTitle}>Professional Data</div>
          <div className={styles.formGridSingle}>
            <div className={styles.inputGroup}>
              <label>Primary Domain / Industry</label>
              <input type="text" value={profile.domain} onChange={e => setProfile({...profile, domain: e.target.value})} placeholder="e.g. Procurement, Software Engineering" />
            </div>
            <div className={styles.inputGroup}>
              <label>Target Job Titles (comma separated)</label>
              <input type="text" value={profile.targetRoles} onChange={e => setProfile({...profile, targetRoles: e.target.value})} placeholder="e.g. Procurement Manager, Supply Chain Lead" />
            </div>
            <div className={styles.inputGroup}>
              <label>Extracted Skills (comma separated)</label>
              <textarea rows={4} value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="e.g. SAP, Vendor Management, Negotiation..." />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              {saved ? '✅ Profile Saved!' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
