"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './AdvancedSearchBar.module.css';

const SKILL_SUGGESTIONS = [
  // Tech & Engineering
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile App Developer",
  "DevOps Engineer", "Data Scientist", "Data Analyst", "Machine Learning Engineer", "Cloud Architect",
  "Security Analyst", "Database Administrator", "QA Engineer", "Embedded Systems Engineer", "Hardware Engineer",
  
  // Design & Creative
  "UI/UX Designer", "Product Designer", "Graphic Designer", "Motion Designer", "Art Director", "Video Editor",
  "Creative Director", "Interior Designer", "Fashion Designer",
  
  // Management & Business
  "Product Manager", "Project Manager", "Operations Manager", "General Manager", "Business Analyst",
  "Chief Executive Officer", "Chief Technology Officer", "Program Manager", "Supply Chain Manager",
  "Procurement Manager", "Vendor Management Specialist", "Supply Chain Coordinator", "Logistics Manager",
  "Inventory Controller", "Sourcing Manager", "Contracts Administrator", "Warehouse Manager",
  "Procurement Associate", "Supply Chain Logistics Analyst",
  
  // Marketing & Sales
  "Marketing Manager", "Digital Marketing Specialist", "Content Writer", "SEO Specialist", "Social Media Manager",
  "Sales Representative", "Account Manager", "Business Development Manager", "Sales Manager", "PR Manager",
  
  // Finance & Legal
  "Accountant", "Financial Analyst", "Investment Banker", "Auditor", "Legal Counsel", "Lawyer", "Paralegal",
  "Tax Consultant", "Finance Manager",
  
  // HR & Education
  "HR Manager", "Recruiter", "Talent Acquisition Specialist", "Teacher", "Professor", "Corporate Trainer",
  "Academic Coordinator",
  
  // Healthcare & Science
  "Doctor", "Nurse", "Pharmacist", "Medical Lab Technician", "Research Scientist", "Biotechnologist",
  "Physiotherapist", "Psychologist",
  
  // Others & Professional Services
  "Customer Support Executive", "Virtual Assistant", "Administrative Assistant", "Data Entry Operator",
  "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Architect",
  "Cosmetologist", "Esthetician", "Makeup Artist", "Beauty Professional", "Spa Manager"
];

const LOCATION_SUGGESTIONS = [
  "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Delhi", "Chennai", "Noida", "Gurgaon",
  "Ahmedabad", "Kolkata", "Remote", "Lucknow", "Jaipur", "Chandigarh"
];

const EXPERIENCE_OPTIONS = [
  "Fresher", "1-3 Years", "3-5 Years", "5-10 Years", "Lead / Senior"
];

export default function AdvancedSearchBar({ 
  onSearch 
}: {
  onSearch?: (tags: string[], target: number, location: string) => void;
}) {
  const [tags, setTags] = useState<string[]>(['Procurement']);
  const [inputValue, setInputValue] = useState('');
  const [location, setLocation] = useState('India');
  const [locationInput, setLocationInput] = useState('');
  const [targetCount, setTargetCount] = useState(50);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  ).slice(0, 8);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchPill}>
        <div className={styles.inputArea} ref={dropdownRef}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 22, height: 22 }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          
          <span className={styles.labelFor}>For</span>
          
          <div className={styles.tagsWrapper}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <span className={styles.removeTag} onClick={() => removeTag(tag)}>✕</span>
              </span>
            ))}
            <input 
              type="text" 
              className={styles.input} 
              placeholder={tags.length === 0 ? "Add roles..." : "Add another title..."}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue) addTag(inputValue);
                if (e.key === 'Backspace' && !inputValue && tags.length > 0) removeTag(tags[tags.length - 1]);
              }}
            />
          </div>

          {showSuggestions && inputValue && (
            <div className={styles.suggestionsDropdown}>
              {filteredSuggestions.map(s => (
                <div key={s} className={styles.suggestionItem} onClick={() => addTag(s)}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className={styles.addRoleBtn}
          onClick={() => inputValue && addTag(inputValue)}
          title="Add role to search"
        >
          <span>+</span>
          ADD
        </button>

        <div className={styles.divider}></div>

        <div className={styles.targetSection}>
          <svg className={styles.targetIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <select 
            className={styles.input} 
            value={targetCount} 
            onChange={(e) => setTargetCount(Number(e.target.value))}
            style={{ width: 'auto', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value={10}>Target 10 jobs</option>
            <option value={20}>Target 20 jobs</option>
            <option value={50}>Target 50 jobs</option>
            <option value={100}>Target 100 jobs</option>
          </select>
        </div>

        <button 
          className={styles.agentBtn}
          onClick={() => onSearch && onSearch(tags, targetCount, location)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 22, height: 22 }}>
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
          Start Agent
        </button>
      </div>

      <div className={styles.smartTagsRow}>
        <span className={styles.smartLabel}>Smart Tags:</span>
        {["Procurement", "Beauty", "Software", "Data Science", "Marketing"].map(st => (
          <span 
            key={st} 
            className={styles.smartChip}
            onClick={() => addTag(st)}
          >
            {st}
          </span>
        ))}
      </div>

      <div className={styles.filterRow}>
        <div className={styles.chipGroup}>
          <div className={`${styles.filterChip} ${styles.darkChip}`}>
            All Platforms <svg style={{ width: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          
          <div className={styles.locationContainer}>
            <div 
              className={styles.filterChip}
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              {location} <svg style={{ width: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            {showLocationDropdown && (
              <div className={styles.locationDropdown}>
                <div className={styles.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search city..." 
                    autoFocus
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                </div>
                <div className={styles.locationList}>
                  {["All India", ...LOCATION_SUGGESTIONS].filter(l => l.toLowerCase().includes(locationInput.toLowerCase())).map(loc => (
                    <div 
                      key={loc} 
                      className={styles.locationItem}
                      onClick={() => {
                        setLocation(loc);
                        setShowLocationDropdown(false);
                        if (onSearch) onSearch(tags, targetCount, loc);
                      }}
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.clearAll} onClick={() => {
          setTags(['Procurement']);
          setLocation('India');
          if (onSearch) onSearch(['Procurement'], targetCount, 'India');
        }}>
          ✕ Clear all
        </div>
      </div>
    </div>
  );
}
