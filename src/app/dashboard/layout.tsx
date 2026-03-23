"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './dashboard.module.css';
import { getCredits } from '@/lib/creditsStore';
import { getSession } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState(0);

  const isActive = (path: string) => pathname === path ? styles.navItemActive : styles.navItem;

  useEffect(() => {
    // 1. Intercept NextAuth Google login session if present
    getSession().then((session) => {
      if (session?.user?.email) {
        const existingUser = localStorage.getItem('clickapply_user');
        if (!existingUser) {
          const name = session.user.name || session.user.email.split('@')[0].replace(/[._]/g, ' ');
          localStorage.setItem('clickapply_user', JSON.stringify({
            name,
            email: session.user.email,
            avatar: name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
          }));
          // Trigger a storage event manually to sync other components
          window.dispatchEvent(new Event('storage'));
        }
      }
    });

    // 2. Load live credits
    const updateCredits = () => setCredits(getCredits());
    updateCredits();
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
          <button 
            onClick={() => {
              localStorage.removeItem('clickapply_user');
              window.location.href = '/';
            }} 
            className={styles.logoutBtn}
            style={{ 
              marginTop: '1rem', 
              color: '#ff4444', 
              background: 'rgba(255, 68, 68, 0.05)',
              border: '1px solid rgba(255, 68, 68, 0.2)'
            }}
          >
            Logout 👋
          </button>
        </nav>
        <div className={styles.creditsSection}>
          <div className={styles.creditValue}>{credits}</div>
          <div className={styles.creditLabel}>Credits</div>
          <Link href="/pricing" className={styles.topUpBtn} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
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
