// Credits store: persists user credits in localStorage
// 25 free credits on first load, each Quick Apply costs 1 credit

const CREDITS_KEY = 'clickapply_credits';
const DEFAULT_CREDITS = 25;

export function getCredits(): number {
  if (typeof window === 'undefined') return DEFAULT_CREDITS;
  const stored = localStorage.getItem(CREDITS_KEY);
  if (stored === null) {
    localStorage.setItem(CREDITS_KEY, String(DEFAULT_CREDITS));
    return DEFAULT_CREDITS;
  }
  return parseInt(stored, 10) || 0;
}

export function deductCredit(): { success: boolean; remaining: number } {
  const current = getCredits();
  if (current <= 0) return { success: false, remaining: 0 };
  const updated = current - 1;
  localStorage.setItem(CREDITS_KEY, String(updated));
  return { success: true, remaining: updated };
}

export function addCredits(amount: number): number {
  const current = getCredits();
  const updated = current + amount;
  localStorage.setItem(CREDITS_KEY, String(updated));
  return updated;
}
