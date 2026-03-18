import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from '../privacy/policy.module.css';

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.content}>
          <h1>Terms of Service</h1>
          <p className={styles.lastUpdated}>Last updated: October 2023</p>
          
          <section>
            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using ClickApplyAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>ClickApplyAI provides an AI-powered agent to automate the job application process. You acknowledge that we cannot guarantee interviews or job placements.</p>
          </section>

          <section>
            <h2>3. Credits & Purchasing</h2>
            <p>The platform operates on a credit basis. One credit equals one job application. Free credits are provided upon registration but hold no monetary value. Purchased credits are non-refundable.</p>
          </section>

          <section>
            <h2>4. User Responsibilities</h2>
            <p>You agree to provide accurate and truthful information in your resume. You are responsible for safeguarding the password that you use to access the Service.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
