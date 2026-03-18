import styles from './login.module.css';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function Login() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Welcome Back</h2>
            <p>Log in to access your automated applications.</p>
          </div>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="you@example.com" required className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" required className={styles.input} />
            </div>
            <button type="submit" className={styles.submitBtn}>Log In</button>
          </form>
          <div className={styles.footer}>
            Don't have an account? <Link href="/register" className={styles.link}>Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
}
