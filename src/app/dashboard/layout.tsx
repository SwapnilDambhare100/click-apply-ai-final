"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { getCredits } from '@/lib/creditsStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState(0);

  const isActive = (path: string) => pathname === path ? styles.navItemActive : styles.navItem;

  // Load live credits from store
  useEffect(() => {
    const updateCredits = () => setCredits(getCredits());
    updateCredits();
    // Listen for storage changes (when credits are deducted in another tab/component)
    window.addEventListener('storage', updateCredits);
    return () => window.removeEventListener('storage', updateCredits);
  }, []);

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brandLink}>
          <img src="/logo.png" alt="Logo" className={styles.logoImg} />
          <span className={styles.brandText}>ClickApply</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={isActive("/dashboard")}>Overview</Link>
          <Link href="/dashboard/profile" className={isActive("/dashboard/profile")}>Profile</Link>
          <Link href="/dashboard/resume" className={isActive("/dashboard/resume")}>My Resume</Link>
          <Link href="/dashboard/jobs" className={isActive("/dashboard/jobs")}>Matches</Link>
          <Link href="/dashboard/applications" className={isActive("/dashboard/applications")}>Applications</Link>
          <Link href="/dashboard/settings" className={isActive("/dashboard/settings")}>Settings</Link>
        </nav>
        <div className={styles.creditsSection}>
          <div className={styles.creditValue}>{credits}</div>
          <div className={styles.creditLabel}>Credits</div>
          <Link href="/dashboard/topup" className={styles.topUpBtn} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            {credits === 0 ? '⚠️ Top Up Now' : 'Top Up'}
          </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.dashboardBg}></div>
        <div className={styles.dashboardBgOrb1}></div>
        <div className={styles.dashboardBgOrb2}></div>
        
        {children}
      </main>
    </div>
  );
}
