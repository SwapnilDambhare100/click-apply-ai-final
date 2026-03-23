import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>Powered by AI ✨</div>
        <h1 className={styles.title}>
          Land your dream job on <span className={styles.highlight}>autopilot</span>
        </h1>
        <p className={styles.description}>
          Upload your resume once. Our AI matches your profile with the best opportunities and sends <strong>Direct-Hit</strong> personalized applications to recruiters on your behalf—automated from search to submission.
        </p>
        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryBtn}>Get 25 Free Applications</Link>
          <Link href="#how-it-works" className={styles.secondaryBtn}>See how it works</Link>
        </div>
      </div>
      <div className={styles.visual}>
        <div className={styles.mockup}>
          <div className={styles.scanLine}></div>
          <div className={styles.mockupContent}>
            <div className={styles.mockupHeader}>AI Resume Parser</div>
            
            <div className={styles.candidateProfile}>
              <div className={styles.candidateAvatar}>PU</div>
              <div className={styles.candidateDetails}>
                <div className={styles.candidateName}>Puja</div>
                <div className={styles.candidateRole}>Cosmetologist Professional</div>
                <div className={styles.candidateExp}>Pro Stylist & Aesthetician</div>
              </div>
            </div>

            <div className={styles.matchStatus}>Match Found: Bridal Styling Specialist (98%)</div>
            <div className={styles.sendingEmail}>Sending Application... ✓</div>
          </div>
        </div>
      </div>
    </section>
  );
}
