"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './GlobalWidgets.module.css';

type Message = { role: 'bot' | 'user'; text: string };

export default function GlobalWidgets() {
  const [showChat, setShowChat] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', text: '', time: '' });

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi there! I'm your AI assistant. Ask me anything about auto-applying, resume parsing, or pricing!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "I'm still learning, but I'm here to help! Try exploring the Dashboard or the AI Tools dropdown at the top.";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('plan') || lowerInput.includes('money')) {
        botResponse = "We have a Free Basic plan, a Starter plan at ₹9, a Pro plan at ₹25, and an Unlimited plan at ₹99. You can view all features on the Pricing page!";
      } else if (lowerInput.includes('resume') || lowerInput.includes('cv') || lowerInput.includes('upload') || lowerInput.includes('parse')) {
        botResponse = "You can instantly upload and parse your resume by going to 'My Resume' in your Dashboard! Our AI perfectly extracts your skills and experience.";
      } else if (lowerInput.includes('apply') || lowerInput.includes('job') || lowerInput.includes('work') || lowerInput.includes('interview')) {
        botResponse = "To apply for jobs, head over to the 'Recommended Jobs' section inside the Dashboard. Just click 'Quick Apply' on any matched job! We are legally live-connected to Adzuna's job feed.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        botResponse = "Hello! How can I accelerate your job hunt and career today?";
      } else if (lowerInput.includes('who are you') || lowerInput.includes('what are you')) {
        botResponse = "I am the ClickApplyAI Smart Assistant! I'm here to guide you through automating your job applications with next-gen AI.";
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5s to 2.5s delay
  };

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
            <div className={styles.chatBody} ref={chatBodyRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'bot' ? styles.botMessage : styles.userMessage}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className={styles.botMessage}>
                  <span className={styles.typingDot}>.</span>
                  <span className={styles.typingDot}>.</span>
                  <span className={styles.typingDot}>.</span>
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
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
