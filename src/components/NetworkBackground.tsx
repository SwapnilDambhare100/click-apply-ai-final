"use client";

import { useEffect, useState } from 'react';
import styles from './NetworkBackground.module.css';

export default function NetworkBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.backgroundContainer}>
      {/* Dynamic Grid */}
      <div className={styles.gridOverlay}></div>
      
      {/* Floating Glowing Orbs */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.orb3}></div>

      {/* Floating Job Search Elements */}
      <div className={styles.floatingIcons}>
        <div className={`${styles.icon} ${styles.icon1}`}>💼</div>
        <div className={`${styles.icon} ${styles.icon2}`}>📄</div>
        <div className={`${styles.icon} ${styles.icon3}`}>🎯</div>
        <div className={`${styles.icon} ${styles.icon4}`}>🚀</div>
        <div className={`${styles.icon} ${styles.icon5}`}>✨</div>
      </div>
    </div>
  );
}
