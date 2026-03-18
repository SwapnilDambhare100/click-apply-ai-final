"use client";

import { useState, useEffect } from 'react';
import styles from './HowItWorksVideo.module.css';

const SIMULATION_STEPS = [
  { url: 'linkedin.com/jobs/search?q=Product+Manager', status: "[AI Agent] Scanning 2,450 new job postings for 'Product Manager'...", progress: 10 },
  { url: 'linkedin.com/jobs/view/98765', status: "[AI Agent] Match Found! Senior Product Manager at TechCorp (94% Match).", progress: 30 },
  { url: 'linkedin.com/jobs/apply/98765', status: "[AI Agent] Generating personalized Cover Letter and answering screening questions...", progress: 60 },
  { url: 'linkedin.com/jobs/apply/98765/submit', status: "[AI Agent] Attaching John_Doe_Resume.pdf and bypassing reCAPTCHA...", progress: 85 },
  { url: 'clickapply.ai/dashboard/tracker', status: "[AI Agent] ✅ Application 1/50 submitted successfully! Moving to next job...", progress: 100 }
];

export default function HowItWorksVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % SIMULATION_STEPS.length);
      }, 3500); // Change step every 3.5 seconds
    } else {
      setStepIndex(0); // Reset when closed
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStep = SIMULATION_STEPS[stepIndex];

  return (
    <section className={styles.videoSection} id="how-it-works">
      <div className={styles.header}>
        <h2>See AI Automation in Action</h2>
        <p>Watch how our agent applies to 50 jobs in under 2 minutes.</p>
      </div>

      <div className={styles.videoContainer}>
        {!isPlaying ? (
          <div className={styles.videoThumbnail} onClick={() => setIsPlaying(true)}>
            <div className={styles.playButton}>
              <div className={styles.playIcon}>▶</div>
            </div>
            <div className={styles.thumbnailOverlay}></div>
            <div className={styles.abstractVisual}>
               <div className={styles.line1}></div>
               <div className={styles.line2}></div>
               <div className={styles.line3}></div>
            </div>
          </div>
        ) : (
          <div className={styles.videoPlayerActive}>
            <div className={styles.simulatedScreen}>
              <div className={styles.simTopBar}>
                <span></span><span></span><span></span>
                <div className={styles.simUrl}>{currentStep.url}</div>
              </div>
              <div className={styles.simBody}>
                <div className={styles.simSidebar}></div>
                <div className={styles.simMain}>
                   <div className={styles.simJobCard}>
                     <div className={styles.aiCursor}>👆</div>
                     <div className={styles.clickEffect}></div>
                   </div>
                   <div className={styles.simJobCard} style={{ opacity: stepIndex > 1 ? 0.3 : 1 }}></div>
                   <div className={styles.simJobCard} style={{ opacity: stepIndex > 2 ? 0.3 : 1 }}></div>
                </div>
              </div>
              <div className={styles.aiOverlay}>
                 <div className={styles.aiOverlayText}>{currentStep.status}</div>
                 <div className={styles.progressBar}>
                   <div className={styles.progressFillSync} style={{ width: `${currentStep.progress}%` }}></div>
                 </div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsPlaying(false)}>Close Simulator</button>
          </div>
        )}
      </div>
    </section>
  );
}
