import styles from './register.module.css';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function Register() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Create an Account</h2>
            <p>Get 10 free AI job applications on signup.</p>
          </div>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" placeholder="John Doe" required className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" placeholder="you@example.com" required className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" required className={styles.input} />
            </div>
            <button type="submit" className={styles.submitBtn}>Sign Up</button>
          </form>
          <div className={styles.footer}>
            Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
