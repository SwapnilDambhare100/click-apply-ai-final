// Global profile store: persists parsed resume data in localStorage
// so all dashboard pages can read and use the candidate's real data.

const PROFILE_KEY = 'clickapply_profile';

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  totalExperience: number;
  targetRoles: string[];
  domain: string;
  lastUpdated?: string;
}

export function saveProfile(data: any): CandidateProfile {
  const profile: CandidateProfile = {
    name: data?.personalInfo?.name || data?.name || '',
    email: data?.personalInfo?.email || data?.email || '',
    phone: data?.personalInfo?.phone || data?.phone || '',
    skills: data?.skills || [],
    totalExperience: data?.totalExperience || 0,
    targetRoles: data?.targetRoles || [],
    domain: data?.targetRoles?.[0] || data?.domain || '',
    lastUpdated: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
  return profile;
}

export function loadProfile(): CandidateProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY);
  }
}
