"use client";

import { useState, useEffect } from 'react';
import styles from './GlobalWidgets.module.css';

export default function GlobalWidgets() {
  const [showChat, setShowChat] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', text: '', time: '' });

  // Social Proof Popup Logic
  useEffect(() => {
    const popups = [
      { name: 'Sarah M.', text: 'Purchased Premium Plan', time: 'about 2 hours ago from London' },
      { name: 'David K.', text: 'Secured an interview via Auto-Apply!', time: 'about 5 hours ago from New York' },
      { name: 'Priya R.', text: 'Purchased Premium Plan', time: 'just now from Mumbai' }
    ];

    let index = 0;
    const interval = setInterval(() => {
      setPopupData(popups[index]);
      setShowPopup(true);
      
      setTimeout(() => {
        setShowPopup(false);
      }, 5000); // Hide after 5 seconds

      index = (index + 1) % popups.length;
    }, 15000); // Show every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Social Proof Popup */}
      <div className={`${styles.socialPopup} ${showPopup ? styles.popupVisible : ''}`}>
        <div className={styles.popupAvatar}>{popupData.name.charAt(0)}</div>
        <div className={styles.popupContent}>
          <div className={styles.popupHeader}>
            <span className={styles.popupName}>{popupData.name}</span>
            <span className={styles.popupVerified}>✓ Verified</span>
          </div>
          <div className={styles.popupText}>{popupData.text}</div>
          <div className={styles.popupTime}>{popupData.time}</div>
        </div>
        <button className={styles.closePopup} onClick={() => setShowPopup(false)}>×</button>
      </div>

      {/* Help Bot Widget */}
      <div className={styles.helpBotContainer}>
        {showChat && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <h4>AI Support Assistant</h4>
              <button onClick={() => setShowChat(false)}>✖</button>
            </div>
            <div className={styles.chatBody}>
              <div className={styles.botMessage}>Hi there! I'm your AI assistant. How can I help you automate your job search today?</div>
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Type your message..." />
              <button>Send</button>
            </div>
          </div>
        )}
        
        <div className={styles.botTrigger} onClick={() => setShowChat(!showChat)}>
          {!showChat && <span className={styles.botTooltip}>👋 Hi! How can we help?</span>}
          <div className={styles.botAvatar}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
          </div>
        </div>
      </div>
    </>
  );
}
