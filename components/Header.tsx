'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

interface HeaderProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export default function Header({ onSearch, onClear }: HeaderProps) {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    updateSavedCount();

    const handleBookmarksChanged = () => {
      updateSavedCount();
    };

    window.addEventListener('bookmarksChanged', handleBookmarksChanged);
    return () => window.removeEventListener('bookmarksChanged', handleBookmarksChanged);
  }, []);

  function updateSavedCount() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('rudra-blog-bookmarks');
      const bookmarks = stored ? JSON.parse(stored) : [];
      setSavedCount(bookmarks.length);
    } catch {
      setSavedCount(0);
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
              rudra&apos;s corner
            </Link>
            <ThemeToggle />
          </div>

          <div className="header-center">
            <SearchBar onSearch={onSearch} onClear={onClear} />
          </div>

          <nav className="header-nav">
            <Link
              href="/saved"
              className="nav-link saved-link"
              title="View saved posts"
            >
              ★ {savedCount > 0 && <span className="saved-count">{savedCount}</span>}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
