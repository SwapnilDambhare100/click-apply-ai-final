"use client";

import { useState } from 'react';
import styles from './HowItWorksVideo.module.css';

export default function HowItWorksVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

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
                <div className={styles.simUrl}>linkedin.com/jobs/search?q=Product+Manager</div>
              </div>
              <div className={styles.simBody}>
                <div className={styles.simSidebar}></div>
                <div className={styles.simMain}>
                   <div className={styles.simJobCard}>
                     <div className={styles.aiCursor}>👆</div>
                     <div className={styles.clickEffect}></div>
                   </div>
                   <div className={styles.simJobCard}></div>
                   <div className={styles.simJobCard}></div>
                </div>
              </div>
              <div className={styles.aiOverlay}>
                 <div className={styles.aiOverlayText}>{"[AI Agent] Analysing profile... Match 94%. Executing Auto-Apply 1/50."}</div>
                 <div className={styles.progressBar}><div className={styles.progressFill}></div></div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsPlaying(false)}>Close Simulator</button>
          </div>
        )}
      </div>
    </section>
  );
}
