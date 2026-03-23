"use client";

import { useEffect } from 'react';
import styles from './Toast.module.css';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
};

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toastWrapper} ${styles[type]}`}>
      <div className={styles.toastContent}>
        {type === 'success' && <span className={styles.icon}>✅</span>}
        {type === 'error' && <span className={styles.icon}>❌</span>}
        {type === 'warning' && <span className={styles.icon}>⚠️</span>}
        {type === 'info' && <span className={styles.icon}>ℹ️</span>}
        <p>{message}</p>
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
}
