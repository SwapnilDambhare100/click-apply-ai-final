"use client";

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from './pricing.module.css';
import { useState } from 'react';
import { addCredits } from '@/lib/creditsStore';

import { load } from '@cashfreepayments/cashfree-js';

export default function Pricing() {
  const [loading, setLoading] = useState<number | null>(null);

  const handleCheckout = async (amount: number) => {
    setLoading(amount);
    try {
      // Create Cashfree session
      const res = await fetch('/api/cashfree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }) // Dynamic amount based on plan
      });
      const data = await res.json();

      if (data.success) {
        // If no credentials, trigger Mock Simulator
        if (data.payment_session_id.startsWith('mock_session_')) {
          let creditsToAdd = 0;
          if (amount === 9) creditsToAdd = 50;
          if (amount === 25) creditsToAdd = 100;
          if (amount === 99) creditsToAdd = 99999; // Represents Unlimited

          alert(`Cashfree Gateway Simulator!\nOrder ID: ${data.order_guid}\nAmount: ₹${amount}.00\n\nSuccessfully simulated payment. Added ${creditsToAdd === 99999 ? 'Unlimited' : creditsToAdd} credits!`);
          
          addCredits(creditsToAdd);
          window.dispatchEvent(new Event('storage'));
          window.location.href = '/dashboard';
          return;
        }

        // Live Cashfree Checkout
        const cashfree = await load({ mode: data.environment }); 
        const checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self"
        };
        
        cashfree.checkout(checkoutOptions);
      } else {
        alert(`Checkout failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Checkout error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Simple, Transparent Pricing</h1>
          <p>Get started for free. Upgrade when you need more automated applications.</p>
        </div>
        
        <div className={styles.cards}>
          {/* Free Plan */}
          <div className={styles.card}>
            <h3>Basic</h3>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>0
            </div>
            <ul className={styles.features}>
              <li>✓ 25 Free Applications</li>
              <li>✓ Basic Resume Parsing</li>
              <li>✓ Manual Application Testing</li>
            </ul>
            <button className={styles.btnSecondary} disabled>Current Plan</button>
          </div>

          {/* Growth Plan */}
          <div className={styles.card}>
            <h3>Growth</h3>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>9
            </div>
            <p className={styles.subtitle}>Supercharge your job hunt</p>
            <ul className={styles.features}>
              <li>✓ <b>50 Auto-Applications</b></li>
              <li>✓ Priority AI Job Matching</li>
              <li>✓ Instant Email Dispatch</li>
            </ul>
            <button 
              className={styles.btnPrimary} 
              onClick={() => handleCheckout(9)} 
              disabled={loading === 9}
            >
              {loading === 9 ? 'Processing...' : 'Buy Now'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.card} ${styles.popular}`}>
            <div className={styles.badge}>Most Popular</div>
            <h3>Pro</h3>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>25
            </div>
            <p className={styles.subtitle}>Valid for 1 Month</p>
            <ul className={styles.features}>
              <li>✓ <b>100 Auto-Applications</b></li>
              <li>✓ Advanced Resume Scoring</li>
              <li>✓ Cover Letter Generator</li>
            </ul>
            <button 
              className={styles.btnPrimary} 
              onClick={() => handleCheckout(25)} 
              disabled={loading === 25}
            >
              {loading === 25 ? 'Processing...' : 'Buy Now'}
            </button>
          </div>

          {/* Full Access Plan */}
          <div className={styles.card}>
            <h3>Unlimited</h3>
            <div className={styles.price}>
              <span className={styles.currency}>₹</span>99
            </div>
            <p className={styles.subtitle}>Valid for 30 Days</p>
            <ul className={styles.features}>
              <li>✓ <b>Unlimited Auto-Applies</b></li>
              <li>✓ Dedicated Support Agent</li>
              <li>✓ Auto-Apply to LinkedIn</li>
            </ul>
            <button 
              className={styles.btnPrimary} 
              onClick={() => handleCheckout(99)} 
              disabled={loading === 99}
            >
              {loading === 99 ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
