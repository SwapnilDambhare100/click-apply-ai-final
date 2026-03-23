import Link from 'next/link';

export default function SupportPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '6rem auto', padding: '0 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💬</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Contact Support</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Have questions or need assistance with your autonomous job search? Our team is here to help you get hired faster.
      </p>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Official Support Email</h2>
        <a 
          href="mailto:admin@clickapplyai.com" 
          style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none', display: 'block', margin: '1rem 0' }}
        >
          admin@clickapplyai.com
        </a>
        <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>
          Typical response time: Within 24 hours (Mon - Fri)
        </p>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <Link 
          href="/" 
          style={{ background: 'var(--primary)', color: 'white', padding: '1rem 2.5rem', borderRadius: '50px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
