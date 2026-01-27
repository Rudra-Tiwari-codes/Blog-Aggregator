// Reading history and click tracking utilities
// All data stored in localStorage

const HISTORY_KEY = 'rudra-blog-history';
const CLICKS_KEY = 'rudra-blog-clicks';
const MAX_HISTORY_ITEMS = 20;

interface HistoryItem {
  link: string;
  title: string;
  timestamp: number;
}

interface ClickData {
  [link: string]: number;
}

// Reading History
export function addToHistory(link: string, title: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();

    // Remove if already exists (to move to top)
    const filtered = history.filter(item => item.link !== link);

    // Add to beginning
    filtered.unshift({
      link,
      title,
      timestamp: Date.now(),
    });

    // Keep only MAX_HISTORY_ITEMS
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent('historyChanged', { detail: trimmed }));
  } catch {
    // localStorage not available
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('historyChanged', { detail: [] }));
  } catch {
    // localStorage not available
  }
}

// Click Tracking (for Popular Posts)
export function trackClick(link: string): void {
  if (typeof window === 'undefined') return;

  try {
    const clicks = getClicks();
    clicks[link] = (clicks[link] || 0) + 1;
    localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));
    window.dispatchEvent(new CustomEvent('clicksChanged', { detail: clicks }));
  } catch {
    // localStorage not available
  }
}

export function getClicks(): ClickData {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(CLICKS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getPopularLinks(limit: number = 5): string[] {
  const clicks = getClicks();
  return Object.entries(clicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([link]) => link);
}
