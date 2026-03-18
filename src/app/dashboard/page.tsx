import styles from './dashboard.module.css';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>ClickApplyAI</div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navItemActive}>Overview</Link>
          <Link href="/dashboard/resume" className={styles.navItem}>My Resume</Link>
          <Link href="/dashboard/jobs" className={styles.navItem}>Recommended Jobs</Link>
          <Link href="/dashboard/applications" className={styles.navItem}>Applications</Link>
          <Link href="/dashboard/settings" className={styles.navItem}>Settings</Link>
        </nav>
        <div className={styles.creditsSection}>
          <div className={styles.creditValue}>10</div>
          <div className={styles.creditLabel}>Credits Remaining</div>
          <button className={styles.topUpBtn}>Buy Credits</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <div className={styles.userProfile}>JD</div>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Applications Sent</div>
            <div className={styles.statValue}>15</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Resume Match Score</div>
            <div className={styles.statValue}>85%</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Profile Status</div>
            <div className={styles.statValueActive}>Active</div>
          </div>
        </div>

        <section className={styles.section}>
          <h2>Recent Job Matches</h2>
          <div className={styles.jobList}>
            <div className={styles.jobCard}>
              <div className={styles.jobInfo}>
                <h3 className={styles.jobTitle}>Procurement Manager</h3>
                <p className={styles.jobCompany}>Tata Motors • Pune</p>
              </div>
              <div className={styles.jobMatch}>92% Match</div>
              <button className={styles.applyBtn}>Quick Apply (1 Credit)</button>
            </div>
            
            <div className={styles.jobCard}>
              <div className={styles.jobInfo}>
                <h3 className={styles.jobTitle}>Supply Chain Analyst</h3>
                <p className={styles.jobCompany}>Amazon • Remote</p>
              </div>
              <div className={styles.jobMatch}>88% Match</div>
              <button className={styles.applyBtn}>Quick Apply (1 Credit)</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
