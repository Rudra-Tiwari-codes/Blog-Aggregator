'use client';

import { useState, useEffect } from 'react';

interface BookmarkButtonProps {
  postLink: string;
  postTitle: string;
}

export default function BookmarkButton({ postLink, postTitle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.includes(postLink));
  }, [postLink]);

  function getBookmarks(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('rudra-blog-bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function saveBookmarks(bookmarks: string[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('rudra-blog-bookmarks', JSON.stringify(bookmarks));
  }

  function toggleBookmark() {
    const bookmarks = getBookmarks();
    let newBookmarks: string[];

    if (bookmarks.includes(postLink)) {
      newBookmarks = bookmarks.filter(b => b !== postLink);
      setIsBookmarked(false);
    } else {
      newBookmarks = [...bookmarks, postLink];
      setIsBookmarked(true);
    }

    saveBookmarks(newBookmarks);

    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent('bookmarksChanged', { detail: newBookmarks }));
  }

  return (
    <button
      className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
      aria-label={isBookmarked ? `Remove ${postTitle} from bookmarks` : `Bookmark ${postTitle}`}
    >
      {isBookmarked ? '★' : '☆'}
    </button>
  );
}
