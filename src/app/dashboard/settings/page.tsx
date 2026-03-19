"use client";

import { useState } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoApplyEnabled: true,
    emailNotifications: true,
    maxApplicationsPerDay: 10,
    minMatchScore: 80,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

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
                <label>Enable Auto-Apply Agent</label>
                <span>Allow the AI to automatically send applications when a high match is found.</span>
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
            <button type="submit" className={styles.saveBtn}>Save Preferences</button>
          </div>
        </form>
      </div>
    </div>
  );
}
