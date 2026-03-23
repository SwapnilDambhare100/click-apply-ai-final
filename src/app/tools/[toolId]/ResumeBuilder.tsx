"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './resume-builder.module.css';

const TEMPLATES = [
  { id: 'modern', name: 'Modern Professional', img: '/images/templates/modern.png', recommended: true },
  { id: 'minimal', name: 'Minimalist Clean', img: '/images/templates/minimal.png', recommended: true },
  { id: 'creative', name: 'Creative Designer', img: '/images/templates/creative.png', recommended: false },
  { id: 'executive', name: 'Executive Corporate', img: '/images/templates/executive.png', recommended: false },
  { id: 'tech', name: 'Tech Specialist', img: '/images/templates/tech.png', recommended: false },
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsParsing(true);
    // Simulate parsing for the tool
    setTimeout(() => {
      setIsParsing(false);
      setStep(2);
    }, 2000);
  };

  const handleChooseTemplate = (id: string) => {
    setSelectedTemplate(id);
    setIsBuilding(true);
    setStep(4);
    
    // Simulate AI Building Sequence
    setTimeout(() => {
      setIsBuilding(false);
    }, 4000);
  };

  if (step === 1) {
    return (
      <div className={styles.stepOneHero}>
        <h1>Create your professional resume in minutes</h1>
        <p>Use our AI-powered templates and step-by-step guidance to create a new resume or optimize your existing one.</p>
        <div className={styles.heroActions}>
          <label className={styles.primaryBtn}>
            {isParsing ? 'Processing AI...' : 'Create New Resume'}
            <input type="file" hidden onChange={handleUpload} disabled={isParsing} />
          </label>
          <button className={styles.secondaryBtn} onClick={() => setStep(2)}>
            Explore How It Works
          </button>
        </div>
        <div className={styles.previewImage}>
           <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800" alt="Resume Preview" />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className={styles.howItWorksContainer}>
        <div className={styles.howItWorksHeader}>
          <div className={styles.logoRow}>📄 ResumeNow.</div>
          <h1>Here's how we get you hired</h1>
        </div>
        
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
             <div className={styles.stepIcon}>📑</div>
             <h3>Pick a template</h3>
             <ul>
               <li>✓ ATS friendly</li>
               <li>✓ Flexible layouts</li>
               <li>✓ Job and industry match</li>
             </ul>
          </div>
          <div className={styles.stepCard}>
             <div className={styles.stepIcon}>✍️</div>
             <h3>Add content with AI</h3>
             <ul>
               <li>✓ Words that match what you do</li>
               <li>✓ Edit & enhance with AI</li>
               <li>✓ Quickly tailor for every application</li>
             </ul>
          </div>
          <div className={styles.stepCard}>
             <div className={styles.stepIcon}>📥</div>
             <h3>Download & send</h3>
             <ul>
               <li>✓ Popular file formats</li>
               <li>✓ Instant digital profile</li>
               <li>✓ Unlimited versions</li>
             </ul>
          </div>
        </div>

        <div className={styles.continueRow}>
          <button className={styles.continueBtn} onClick={() => setStep(3)}>Continue</button>
          <p className={styles.termsLine}>By clicking above, you agree to our Terms of Use and Privacy Policy.</p>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className={styles.templateContainer}>
        <div className={styles.templateHeader}>
          <h1>Templates we recommend for you</h1>
          <p>You can always change your template later.</p>
        </div>

        <div className={styles.templateGrid}>
          {TEMPLATES.map(t => (
            <div key={t.id} className={styles.templateCard}>
               <div className={styles.templatePreview}>
                  <img src={t.img} alt={t.name} />
                  {t.recommended && <span className={styles.recommendedBadgeInside}>Recommended</span>}
                  <div className={styles.templateOverlay}>
                     <button 
                        className={styles.chooseTemplateBtn} 
                        onClick={() => handleChooseTemplate(t.id)}
                     >
                        Choose template
                     </button>
                  </div>
               </div>
               <h3>{t.name}</h3>
            </div>
          ))}
        </div>

        <div className={styles.floatingSupport}>
           <span className={styles.supportIcon}>👋</span>
           <span className={styles.supportText}>Hi! How can we help?</span>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
           <button onClick={() => setStep(2)} className={styles.secondaryBtn}>Back</button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    if (isBuilding) {
      return (
        <div className={styles.aiBuildLoader}>
           <div className={styles.aiGlow}></div>
           <div className={styles.loaderContent}>
              <div className={styles.aiIcon}>🤖</div>
              <h2>AI is assembling your {TEMPLATES.find(t => t.id === selectedTemplate)?.name}...</h2>
              <div className={styles.progressBar}>
                 <div className={styles.progressFill}></div>
              </div>
              <p>Tailoring keywords, optimizing layout, and ensuring ATS compatibility.</p>
           </div>
        </div>
      );
    }

    return (
      <div className={styles.finalPreviewContainer}>
         <div className={styles.previewSidebar}>
            <h2>Customizer</h2>
            <div className={styles.sidebarAction}>
               <label>Accent Color</label>
               <div className={styles.colorRow}>
                  <span style={{ background: '#2563eb' }}></span>
                  <span style={{ background: '#059669' }}></span>
                  <span style={{ background: '#7c3aed' }}></span>
                  <span style={{ background: '#db2777' }}></span>
               </div>
            </div>
            <div className={styles.sidebarAction}>
               <button className={styles.primaryBtn} style={{ width: '100%' }}>Download PDF</button>
            </div>
            <div className={styles.sidebarAction}>
               <Link href="/dashboard" className={styles.secondaryBtn} style={{ display: 'block', textAlign: 'center' }}>
                  Back to Dashboard
               </Link>
            </div>
         </div>

         <div className={styles.resumePaper}>
            <div className={styles.paperHeader} style={{ borderColor: '#2563eb' }}>
               <h1>Your Name</h1>
               <p>Professional Title • City, Country</p>
            </div>
            <div className={styles.paperBody}>
               <section>
                  <h3>Professional Summary</h3>
                  <p>A highly accomplished professional with extensive experience in the field. Proven track record of delivering high-quality results and leading complex projects to success.</p>
               </section>
               <section>
                  <h3>Key Experience</h3>
                  <div className={styles.expItem}>
                     <strong>Senior Specialist</strong>
                     <span>2020 - Present</span>
                     <p>Spearheaded major initiatives that resulted in a 25% increase in efficiency across the department.</p>
                  </div>
               </section>
            </div>
            <div className={styles.watermark}>Built with ClickApplyAI</div>
         </div>
      </div>
    );
  }

  return null;
}
