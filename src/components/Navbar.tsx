"use client";

import Link from 'next/link';
import styles from './Navbar.module.css';
import { useState } from 'react';

export default function Navbar() {
  const [showTools, setShowTools] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="ClickApplyAI Logo" className={styles.logoImg} />
        <Link href="/">ClickApplyAI</Link>
      </div>
      <div className={styles.links}>
        <Link href="#how-it-works">How It Works</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/reviews">Reviews</Link>
        <div 
          className={styles.dropdownContainer}
          onMouseEnter={() => setShowTools(true)}
          onMouseLeave={() => setShowTools(false)}
        >
          <button className={styles.dropdownBtn}>
            AI Tools <span className={styles.caret}>▾</span>
          </button>
          
          {showTools && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownSection}>
                <h4>TOOLS FOR LINKEDIN</h4>
                <Link href="/tools/hashtags">Hashtags Generator For LinkedIn</Link>
                <Link href="/tools/summary">Summary Generator For LinkedIn</Link>
                <Link href="/tools/post">Post Generator For LinkedIn</Link>
                <Link href="/tools/headline">Headline Generator For LinkedIn</Link>
                <Link href="/tools/recommendation">Recommendation Generator For LinkedIn</Link>
              </div>
              <div className={styles.dropdownSection}>
                <h4>RESUME & APPLICATION</h4>
                <Link href="/tools/resume-builder">Resume Builder</Link>
                <Link href="/tools/resume-gpt">Resume GPT</Link>
                <Link href="/tools/resume-score">Resume Score</Link>
                <Link href="/tools/resume-tracker">Resume Tracker</Link>
                <Link href="/tools/cover-letter">Cover Letter Generator</Link>
                <Link href="/tools/job-description">Job Description Generator</Link>
              </div>
            </div>
          )}
        </div>
        <Link href="/login" className={styles.loginText}>Login</Link>
        <Link href="/register" className={styles.loginBtn}>Get Started</Link>
      </div>
    </nav>
  );
}
