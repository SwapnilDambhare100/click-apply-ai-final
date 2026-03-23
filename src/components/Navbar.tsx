"use client";

import Link from 'next/link';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [showTools, setShowTools] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check initial state
    const stored = localStorage.getItem('clickapply_user');
    if (stored) {
      const user = JSON.parse(stored);
      setIsLoggedIn(true);
      setUserName(user.name || 'User');
    }
    
    // Listen for storage changes in case of logout/login in other tabs
    const handleStorageChange = () => {
      const s = localStorage.getItem('clickapply_user');
      if (s) {
        const u = JSON.parse(s);
        setIsLoggedIn(true);
        setUserName(u.name || 'User');
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="ClickApplyAI Logo" className={styles.logoImg} />
        <Link href="/">ClickApplyAI</Link>
      </div>
      <div className={styles.links}>
        <Link href="/#how-it-works">How It Works</Link>
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
                <Link href="/tools/cover-letter">Cover Letter Generator</Link>
                <Link href="/tools/job-description">Job Description Generator</Link>
                <Link href="/dashboard" style={{ color: '#10b981', fontWeight: 800 }}>✨ Auto Job-Matching</Link>
                <Link href="/guide" style={{ fontWeight: 700, marginTop: '5px', borderTop: '1px solid #eee', paddingTop: '5px' }}>📖 User Guide</Link>
              </div>
            </div>
          )}
        </div>
        <ThemeToggle />
        {isLoggedIn ? (
          <Link href="/dashboard" className={styles.loginBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className={styles.navAvatar}>{userName.charAt(0).toUpperCase()}</div>
            <span>{userName}</span>
          </Link>
        ) : (
          <>
            <Link href="/login" className={styles.loginText}>Login</Link>
            <Link href="/register" className={styles.loginBtn}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
