import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h3>ClickApplyAI</h3>
          <p>Automating your job search with intelligence.</p>
        </div>
        <div className={styles.links}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} ClickApplyAI. All rights reserved.
      </div>
    </footer>
  );
}
