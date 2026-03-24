'use client';

import { useState } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    console.log('[FEEDBACK SUBMITTED]:', feedback);
    setSubmitted(true);
    setFeedback('');
    
    // Auto-reset after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h3>ClickApplyAI</h3>
          <p>Automating your job search with intelligence.</p>
        </div>

        <div className={styles.feedback}>
          <h4>Help us improve</h4>
          <form onSubmit={handleSubmit} className={styles.feedbackForm}>
            <input
              type="text"
              placeholder={submitted ? "Thank you! ❤️" : "Share your feedback..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={submitted}
              className={styles.input}
            />
            <button type="submit" className={styles.submitBtn} disabled={submitted}>
              {submitted ? "✓" : "🚀"}
            </button>
          </form>
        </div>

        <div className={styles.links}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/support">Contact Support</a>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} ClickApplyAI. All rights reserved.
      </div>
    </footer>
  );
}
