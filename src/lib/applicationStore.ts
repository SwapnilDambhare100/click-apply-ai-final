// Application tracker store: persists job applications to localStorage

const APPS_KEY = 'clickapply_applications';

export interface ApplicationRecord {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  matchScore: number;
  appliedAt: string;
  status: 'sent' | 'pending' | 'viewed' | 'rejected' | 'interview';
}

export function logApplication(job: {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore?: number;
}): ApplicationRecord {
  const record: ApplicationRecord = {
    id: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    matchScore: job.matchScore || 0,
    appliedAt: new Date().toISOString(),
    status: 'sent',
  };

  if (typeof window !== 'undefined') {
    const existing = loadApplications();
    // Avoid duplicates
    const filtered = existing.filter(a => a.id !== job.id);
    localStorage.setItem(APPS_KEY, JSON.stringify([record, ...filtered]));
  }
  return record;
}

export function loadApplications(): ApplicationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(APPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
