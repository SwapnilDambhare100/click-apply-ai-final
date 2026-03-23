"use client";

import { useState, useEffect } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoApplyEnabled: false,
    autoApplyKeywords: "",
    emailNotifications: true,
    maxApplicationsPerDay: 15,
    minMatchScore: 70,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const stored = localStorage.getItem('clickapply_user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user?.email) return setLoading(false);

      try {
        const res = await fetch(`/api/user/settings?email=${user.email}`);
        const data = await res.json();
        if (data.success) {
          setSettings({
            autoApplyEnabled: data.settings.autoApplyEnabled,
            autoApplyKeywords: data.settings.autoApplyKeywords || "",
            emailNotifications: data.settings.emailNotifications ?? true,
            maxApplicationsPerDay: data.settings.maxApplicationsPerDay || 20,
            minMatchScore: data.settings.minMatchScore || 70,
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const stored = localStorage.getItem('clickapply_user');
    const user = stored ? JSON.parse(stored) : null;
    
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          ...settings
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Automation preferences saved successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}><p>Loading settings...</p></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Agent Settings</h1>
        <p>Configure how your Click Apply AI agent operates on your behalf.</p>
      </header>

      <div className={`glass-panel ${styles.settingsCard}`}>
        <form onSubmit={handleSave} className={styles.form}>
          
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Automation Controls</h3>
              <p>Main toggles for your AI job application agent.</p>
            </div>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>Enable 1-Click Email Applications ⚡</label>
                <span>Receive instant job matches in your inbox and apply with a single click.</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.autoApplyEnabled} 
                  onChange={e => setSettings({...settings, autoApplyEnabled: e.target.checked})} 
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <div className={styles.settingInfo}>
                <label>Automation Keywords (Targets)</label>
                <span>The system will only notify you for jobs matching these keywords.</span>
              </div>
              <div style={{ width: '100%' }}>
                <input 
                  type="text" 
                  className={styles.textInput}
                  placeholder="e.g. Procurement, Supply Chain, Logistics"
                  value={settings.autoApplyKeywords}
                  onChange={e => setSettings({...settings, autoApplyKeywords: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>Email Notifications</label>
                <span>Receive a daily summary of all applications sent by the AI.</span>
              </div>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications} 
                  onChange={e => setSettings({...settings, emailNotifications: e.target.checked})} 
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Application Rules</h3>
              <p>Set strict parameters for the jobs your AI is allowed to apply to.</p>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>Minimum Match Score (%)</label>
                <span>The AI will only apply to jobs scoring above this threshold.</span>
              </div>
              <div className={styles.numberInput}>
                <input 
                  type="number" 
                  min="50" max="100" 
                 value={settings.minMatchScore}
                  onChange={e => setSettings({...settings, minMatchScore: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>Max Applications Per Day</label>
                <span>Daily limit to avoid spam filters and maintain high quality.</span>
              </div>
              <div className={styles.numberInput}>
                <input 
                  type="number" 
                  min="1" max="100" 
                  value={settings.maxApplicationsPerDay}
                  onChange={e => setSettings({...settings, maxApplicationsPerDay: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
