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

      if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput === 'hi' || lowerInput.includes('hey')) {
        botResponse = "Hi! 👋 How can I help you today? You can ask about our 'Direct-Hit' email automation, check out our Live Simulation, or read the User Guide!";
      } else if (lowerInput.includes('guide') || lowerInput.includes('how to') || lowerInput.includes('help')) {
        botResponse = "To get started, check out our 'User Guide' in the AI Tools dropdown! 📖 It covers everything from setting up your profile to launching your first agent.";
      } else if (lowerInput.includes('simulation') || lowerInput.includes('action') || lowerInput.includes('video')) {
        botResponse = "You can see our AI in action right on the homepage! Look for the 'Live Agent Simulation' section to watch a real-time demo. 🤖📺";
      } else if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('plan')) {
        botResponse = "Our plans start at ₹9! Check the Pricing page for details on our Pro and Unlimited Career Agent packages. 💰";
      } else if (lowerInput.includes('apply') || lowerInput.includes('job') || lowerInput.includes('match')) {
        botResponse = "Our 'Direct-Hit' engine matches you with the best roles and emails recruiters directly. Just head to your Dashboard to start! 🎯🚀";
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
