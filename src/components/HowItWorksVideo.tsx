"use client";

import { useState, useEffect } from 'react';
import styles from './HowItWorksVideo.module.css';

const SIMULATION_STEPS = [
  { 
    url: 'linkedin.com/jobs/search?q=Product+Manager', 
    status: "Scanning 2,450 new job postings for 'Product Manager'...", 
    progress: 10,
    action: "scanning",
    data: { company: "Google", role: "Product Manager", match: 92 }
  },
  { 
    url: 'linkedin.com/jobs/view/98765', 
    status: "Match Found! Senior Product Manager at TechCorp (94% Match).", 
    progress: 35,
    action: "matched",
    data: { company: "TechCorp", role: "Sr. Product Manager", match: 94 }
  },
  { 
    url: 'linkedin.com/jobs/apply/98765', 
    status: "Generating personalized Cover Letter and answering screening questions...", 
    progress: 65,
    action: "applying",
    data: { company: "TechCorp", role: "Sr. Product Manager", match: 94 }
  },
  { 
    url: 'linkedin.com/jobs/apply/98765/submit', 
    status: "Attaching Resume and bypassing reCAPTCHA...", 
    progress: 85,
    action: "submitting",
    data: { company: "TechCorp", role: "Sr. Product Manager", match: 94 }
  },
  { 
    url: 'clickapply.ai/dashboard/tracker', 
    status: "✅ Application 1/50 submitted successfully! Moving to next job...", 
    progress: 100,
    action: "done",
    data: { company: "TechCorp", role: "Sr. Product Manager", match: 94 }
  }
];

export default function HowItWorksVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % SIMULATION_STEPS.length);
      }, 4000);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStep = SIMULATION_STEPS[stepIndex];

  const handleStart = () => {
    setStepIndex(0);
    setIsPlaying(true);
  };

  const handleExit = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  return (
    <section className={styles.videoSection} id="how-it-works">
      <div className={styles.header}>
        <div className={styles.badge}>Live Agent Simulation</div>
        <h2>See AI Automation in Action</h2>
        <p>Watch how our agent applies to 50 jobs across LinkedIn, Adzuna, and Indeed in under 2 minutes.</p>
      </div>

      <div className={styles.videoContainer}>
        {!isPlaying ? (
          <div className={styles.videoThumbnail} onClick={handleStart}>
            <div className={styles.playButton}>
              <div className={styles.playIcon} style={{ fontSize: '2.5rem' }}>▶</div>
            </div>
            <div className={styles.thumbnailOverlay}></div>
            <div className={styles.abstractVisual}>
               <div className={styles.line1}></div>
               <div className={styles.line2}></div>
               <div className={styles.line3}></div>
            </div>
            <div className={styles.previewText} style={{ fontWeight: 800 }}>CLICK TO START LIVE SIMULATOR</div>
          </div>
        ) : (
          <div className={styles.videoPlayerActive}>
            <div className={styles.simulatedScreen}>
              {/* Browser Header */}
              <div className={styles.simTopBar}>
                <div className={styles.windowControls}>
                  <span style={{ background: '#ff5f57' }}></span>
                  <span style={{ background: '#ffbd2e' }}></span>
                  <span style={{ background: '#28c940' }}></span>
                </div>
                <div className={styles.tabs}>
                  <div className={styles.tabActive}>{currentStep.url.split('/')[0]}</div>
                  <div className={styles.tab}>ClickApply AI Agent</div>
                </div>
                <div className={styles.simUrl}>
                  <span className={styles.lockIcon}>🔒 Secure Agent |</span>
                  {currentStep.url}
                </div>
              </div>

              {/* Browser Body */}
              <div className={styles.simBody}>
                <div className={styles.simSidebar}>
                   <div className={styles.skeletonLine} style={{ width: '80%', height: 12 }}></div>
                   <div className={styles.skeletonLine} style={{ width: '60%', height: 12 }}></div>
                   <div className={styles.skeletonLine} style={{ width: '90%', height: 12 }}></div>
                   <div className={styles.skeletonLine} style={{ width: '70%', height: 12, marginTop: 'auto' }}></div>
                </div>
                <div className={styles.simMain}>
                   {/* Search Bar Simulation */}
                   <div className={styles.simSearch}>
                      <div className={styles.simSearchInput}>
                        {currentStep.action === 'scanning' ? "Auto-detecting matching roles..." : "Procurement Manager"}
                      </div>
                      <div className={styles.simSearchBtn}>Search</div>
                   </div>

                   {/* Job Cards Simulation */}
                   <div className={styles.simJobCardsContainer}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`${styles.simJobCard} ${i === 1 && currentStep.action !== 'scanning' ? styles.cardActive : ''}`}>
                          <div className={styles.cardLogo}>
                             {i === 1 ? '🎯' : '🏢'}
                          </div>
                          <div className={styles.cardInfo}>
                             <div className={styles.cardTitle}>{i === 1 ? currentStep.data.company : 'Enterprise Inc'}</div>
                             <div className={styles.cardSubtitle}>{i === 1 ? currentStep.data.role : 'Manager Role'}</div>
                             <div className={styles.cardTags}>
                                <span className={styles.tag}>Full-time</span>
                                <span className={styles.tag}>Remote</span>
                             </div>
                          </div>
                          {i === 1 && currentStep.action !== 'scanning' && (
                             <div className={styles.cardScore} style={{ fontSize: '0.8rem', fontWeight: 800 }}>{currentStep.data.match}% AI SCORE</div>
                          )}
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* AI Agent Avatar */}
              <div className={styles.robotAgent}>
                <div className={styles.robotHead}>
                   <div className={styles.robotEye}></div>
                   <div className={styles.robotEye}></div>
                </div>
                <div className={styles.robotBody}></div>
              </div>

              {/* Floating AI HUD */}
              <div className={styles.aiOverlay}>
                 <div className={styles.hudHeader}>
                    <span className={styles.pulse}></span>
                    AGENT STATUS: {currentStep.action.toUpperCase()}...
                 </div>
                 <div className={styles.aiOverlayText}>
                    <span className={styles.prefix}>{">_"} </span>
                    {currentStep.status}
                 </div>
                 <div className={styles.progressBar}>
                   <div className={styles.progressFillSync} style={{ width: `${currentStep.progress}%`, background: '#10b981' }}></div>
                 </div>
                 {currentStep.action === 'applying' && (
                   <div className={styles.generatingVisual}>
                      <span></span><span></span><span></span>
                   </div>
                 )}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={handleExit} style={{ background: '#f43f5e', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✖ Stop Simulator</button>
          </div>
        )}
      </div>
    </section>
  );
}
