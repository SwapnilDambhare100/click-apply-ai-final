"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function GuidePage() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>ClickApplyAI 📖 User Guide</h1>
          <p>Master the art of automated job searching with our AI Agent.</p>
        </div>

        <section className={styles.section}>
          <h2>🚀 Quick Start: Your First 5 Minutes</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.stepNum}>1</div>
              <h3>Upload Resume</h3>
              <p>Go to your dashboard and upload your PDF resume. Our AI extracts your skills instantly.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.stepNum}>2</div>
              <h3>Set Your Tags</h3>
              <p>Type keywords like "React Developer" or "Project Manager" in the command center.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.stepNum}>3</div>
              <h3>Launch Agent</h3>
              <p>Click "Start Agent". We'll find matches and send Direct-Hit applications immediately.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>⚡ PRO Tip: Direct-Hit Automation</h2>
          <div className={styles.proBox}>
            <p>Our agent doesn't just fill forms. It identifies the recruiters' email and sends a <strong>personalized pitch</strong> using your profile data. This bypasses 70% of the ATS noise!</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
