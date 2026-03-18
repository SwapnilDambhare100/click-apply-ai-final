import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from './policy.module.css';

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.content}>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: October 2023</p>
          
          <section>
            <h2>1. Introduction</h2>
            <p>Welcome to ClickApplyAI. We are committed to protecting your personal information and your right to privacy.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We automatically collect certain information when you visit, use, or navigate the platform. This includes:</p>
            <ul>
              <li>Personal and contact data (Name, Email)</li>
              <li>Resume data (Experience, Skills, Domain) extracted by our AI</li>
              <li>Job application history and preferences</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <p>We use the information we collect or receive to:</p>
            <ul>
              <li>Provide, operate, and maintain our platform</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our automated job apply agent</li>
              <li>Communicate with you for customer service and updates</li>
            </ul>
          </section>

          <section>
            <h2>4. AI Processing</h2>
            <p>Your resume data is processed by our AI algorithms exclusively to match you with jobs and generate application emails. We do not sell your resume data to third parties.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
