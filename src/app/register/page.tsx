"use client";

import { useState, useEffect } from 'react';
import styles from './register.module.css';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Toast from '@/components/Toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'warning'|'info'} | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'send', action: 'register' })
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setResendTimer(30);
        if (data.mockOtp) {
          setToast({ message: `[DEV MODE] Your simulated OTP code is: ${data.mockOtp}`, type: 'info' });
        }
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'verify' })
      });
      const data = await res.json();
      if (data.success) {
        // Finalize registration
        localStorage.setItem('clickapply_user', JSON.stringify({
          name: name,
          email: email,
          avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        }));
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const userEmail = prompt('Enter your Google email address:');
    if (userEmail && userEmail.includes('@')) {
      setEmail(userEmail);
      const generatedName = userEmail.split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setName(generatedName);
      // Trigger OTP send for Google user too
      handleSendOTP();
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.registerBox}>
          <div className={styles.header}>
            <h2>{step === 'otp' ? 'Verify Your Email' : 'Create an Account'}</h2>
            <p>{step === 'otp' ? `We sent a code to ${email}` : 'Sign up now to get 10 Free AI Applications.'}</p>
          </div>

          {error && <div className={styles.error} style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          {step === 'details' ? (
            <>
              <button
                className={styles.googleBtn}
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg height="24" viewBox="0 0 24 24" width="24" style={{ marginRight: '10px', background: 'white', borderRadius: '50%', padding: '2px' }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Sending Code...' : 'Continue with Google'}
              </button>

              <div className={styles.divider}>
                <span>or continue with email</span>
              </div>

              <form className={styles.form} onSubmit={handleSendOTP}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text" id="name" placeholder="John Doe" required
                    className={styles.input}
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email" id="email" placeholder="you@example.com" required
                    className={styles.input}
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password" id="password" required
                    className={styles.input}
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? 'Sending Code...' : 'Sign Up Free'}
                </button>
              </form>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleVerifyOTP}>
              <div className={styles.formGroup}>
                <label htmlFor="otp">Verification Code</label>
                <input
                  type="text" id="otp" placeholder="Enter 6-digit code" required
                  className={styles.input}
                  value={otp} onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button 
                type="button" 
                onClick={() => handleSendOTP()} 
                disabled={loading || resendTimer > 0}
                style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#94a3b8' : 'var(--primary)', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', marginTop: '1rem', width: '100%', fontSize: '14px', fontWeight: 500 }}
              >
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('details')} 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginTop: '0.75rem', width: '100%', fontSize: '14px' }}
              >
                Go Back
              </button>
            </form>
          )}

          <div className={styles.footer}>
            Already have an account? <Link href="/login" className={styles.link}>Log in</Link>
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
