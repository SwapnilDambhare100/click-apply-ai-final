import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '6rem auto', padding: '0 2rem', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Terms and Conditions</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Last Updated: March 24, 2026</p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
        <p>By accessing or using ClickApplyAI, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use our services.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Purpose of Service</h2>
        <p>ClickApplyAI provides an AI-powered platform to assist users in searching for jobs and automating applications. Our service is a tool for career development and job seeking efficiency.</p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. User Responsibility</h2>
        <p>Users are responsible for the accuracy of the information provided in their resumes and profile. ClickApplyAI is not liable for any discrepancies in data provided by the user to recruiters or job boards.</p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Subscription & Credits</h2>
        <p>Access to certain automated features may require credits or a subscription plan. Credits are non-transferable and are consumed upon execution of AI-driven application tasks.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Limitation of Liability</h2>
        <p>ClickApplyAI does not guarantee employment or specific hiring outcomes. We provide the technology to automate your search, but the final hiring decision rests with the prospective employer.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>6. Support Contact</h2>
        <p>For any legal inquiries or account support, please reach out to <a href="mailto:admin@clickapplyai.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>admin@clickapplyai.com</a>.</p>
      </section>

      <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>← Back to Home</Link>
    </div>
  );
}
