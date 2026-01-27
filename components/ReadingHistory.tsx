'use client';

import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '@/lib/tracking';

interface HistoryItem {
  link: string;
  title: string;
  timestamp: number;
}

export default function ReadingHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setHistory(getHistory());

    const handleHistoryChanged = (e: Event) => {
      const customEvent = e as CustomEvent<HistoryItem[]>;
      setHistory(customEvent.detail);
    };

    window.addEventListener('historyChanged', handleHistoryChanged);
    return () => window.removeEventListener('historyChanged', handleHistoryChanged);
  }, []);

  function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="history-section" style={{ marginTop: '3rem' }}>
      <div
        className="flex justify-between items-center mb-md"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 style={{ color: 'var(--teal)', fontFamily: 'var(--font-accent)' }}>
          📚 recently viewed
        </h2>
        <div className="flex items-center gap-sm">
          <span className="reaction-btn">{history.length}</span>
          <span style={{ color: 'var(--silver)', fontSize: '0.9rem' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="history-list">
            {history.map((item, idx) => (
              <div key={`history-${idx}`} className="history-item">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="history-link"
                >
                  {item.title}
                </a>
                <span className="history-time">{formatTimeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost"
            style={{ marginTop: '1rem', fontSize: '0.85rem' }}
            onClick={e => {
              e.stopPropagation();
              clearHistory();
            }}
          >
            clear history
          </button>
        </>
      )}
    </section>
  );
}
