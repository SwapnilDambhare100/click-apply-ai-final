"use client";

import { useState, useEffect } from 'react';
import { getCredits, addCredits } from '@/lib/creditsStore';
import Link from 'next/link';

const CREDIT_PACKS = [
  { id: 'pack_10', credits: 10, price: 49, label: 'Starter', highlight: false },
  { id: 'pack_30', credits: 30, price: 99, label: 'Popular', highlight: true },
  { id: 'pack_100', credits: 100, price: 249, label: 'Pro', highlight: false },
];

declare global {
  interface Window { Razorpay: any; }
}

export default function TopUpPage() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    setCredits(getCredits());
    // Load Razorpay SDK script
    if (!document.getElementById('razorpay-sdk')) {
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
    }
  }, []);

  const handleTopUp = async (pack: typeof CREDIT_PACKS[0]) => {
    setLoading(pack.id);
    try {
      // Create order on backend
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pack.price })
      });
      const { order } = await res.json();

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY || '';

      // If no real Razorpay key, simulate success
      if (!razorpayKey || !window.Razorpay) {
        const updated = addCredits(pack.credits);
        setCredits(updated);
        alert(`✅ ${pack.credits} credits added! (Simulated — add NEXT_PUBLIC_RAZORPAY_KEY for real payments)`);
        setLoading(null);
        return;
      }

      // Open Razorpay with UPI pre-selected using the _[method] override
      const options: any = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'ClickApply AI',
        description: `${pack.credits} Application Credits`,
        image: '/logo.png',
        order_id: order.id,
        handler: (response: any) => {
          const updated = addCredits(pack.credits);
          setCredits(updated);
          alert(`🎉 Payment successful! ${pack.credits} credits added.`);
        },
        prefill: {
          email: 'swapnildambhare100@gmail.com',
          contact: '',
        },
        // Force-enable all payment modes
        method: {
          upi: 1,
          wallet: 1,
          netbanking: 1,
          card: 1,
          emi: 0,
          bank_transfer: 0,
        },
        // Pre-open UPI tab directly (works after UPI is enabled in dashboard)
        '_[method]': 'upi',
        theme: { color: '#4F46E5' },
        modal: { confirm_close: true },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Top Up Credits</h1>
        <p style={{ opacity: 0.7 }}>Each Quick Apply uses 1 credit. You currently have <strong style={{ color: 'var(--primary)' }}>{credits} credits</strong>.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {CREDIT_PACKS.map(pack => (
          <div
            key={pack.id}
            style={{
              padding: '2rem',
              borderRadius: '16px',
              border: pack.highlight ? '2px solid var(--primary)' : '1px solid var(--card-border)',
              background: pack.highlight ? 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(147,51,234,0.1))' : 'var(--card-bg)',
              position: 'relative',
              boxShadow: pack.highlight ? '0 8px 32px rgba(79,70,229,0.2)' : 'none',
            }}
          >
            {pack.highlight && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '2px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{pack.credits}</div>
            <div style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.5rem' }}>Application Credits</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>₹{pack.price}</div>
            <button
              onClick={() => handleTopUp(pack)}
              disabled={loading === pack.id}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: pack.highlight ? 'var(--primary)' : 'var(--card-border)',
                color: pack.highlight ? 'white' : 'var(--foreground)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading === pack.id ? 'not-allowed' : 'pointer',
                opacity: loading === pack.id ? 0.6 : 1,
              }}
            >
              {loading === pack.id ? 'Processing...' : `Buy ${pack.credits} Credits`}
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <strong>🔒 Pay securely via:</strong>
          <span style={{ background: '#5f259f', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>PhonePe</span>
          <span style={{ background: '#1a73e8', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>GPay</span>
          <span style={{ background: '#002970', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Paytm</span>
          <span style={{ background: '#f97316', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>UPI QR</span>
          <span style={{ background: '#16a34a', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Net Banking</span>
          <span style={{ background: '#475569', color: 'white', padding: '3px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Cards</span>
        </div>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>
          Credits added instantly after payment. Powered by Razorpay.
        </p>
        <Link href="/dashboard/jobs" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Jobs</Link>
      </div>
    </div>
  );
}
