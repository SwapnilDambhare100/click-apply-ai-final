import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '6rem auto', padding: '0 2rem', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Privacy Policy</h1>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Last Updated: March 24, 2026</p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>1. Introduction</h2>
        <p>Welcome to ClickApplyAI. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our autonomous job application platform.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>2. Information We Collect</h2>
        <p>To provide our AI-driven services, we may collect:</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Personal Details:</strong> Name, email, phone number, and location.</li>
          <li><strong>Resume Data:</strong> Professional experience, education, skills, and contact information extracted from your uploaded documents.</li>
          <li><strong>Job Preferences:</strong> Search keywords, target roles, and application history.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>3. How We Use Your Information</h2>
        <p>Your data is used strictly for:</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Matching your profile with relevant job opportunities.</li>
          <li>Automating job applications to recruiters on your behalf.</li>
          <li>Improving our AI algorithms for better results.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. We do not sell your personal information to third parties.</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:admin@clickapplyai.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>admin@clickapplyai.com</a>.</p>
      </section>

      <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>← Back to Home</Link>
    </div>
  );
}
