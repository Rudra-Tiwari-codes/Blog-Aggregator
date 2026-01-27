'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CleanPost } from '@/lib/types';
import PostCard from './PostCard';

interface SavedPostsProps {
  posts: CleanPost[];
}

export default function SavedPosts({ posts }: SavedPostsProps) {
  const [savedPosts, setSavedPosts] = useState<CleanPost[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const getBookmarks = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('rudra-blog-bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const updateSavedPosts = useCallback(() => {
    const bookmarks = getBookmarks();
    const saved = posts.filter(post => bookmarks.includes(post.link));
    setSavedPosts(saved);
  }, [posts, getBookmarks]);

  // Get bookmarks from localStorage and filter posts
  useEffect(() => {
    updateSavedPosts();

    // Listen for bookmark changes
    const handleBookmarksChanged = () => {
      updateSavedPosts();
    };

    window.addEventListener('bookmarksChanged', handleBookmarksChanged);
    return () => window.removeEventListener('bookmarksChanged', handleBookmarksChanged);
  }, [updateSavedPosts]);

  // Don't render if no saved posts
  if (savedPosts.length === 0) {
    return null;
  }

  return (
    <section className="saved-section" style={{ marginBottom: '3rem' }}>
      <div
        className="flex justify-between items-center mb-md"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 style={{ color: 'var(--plum)', fontFamily: 'var(--font-accent)' }}>saved ★</h2>
        <div className="flex items-center gap-sm">
          <span className="reaction-btn">{savedPosts.length}</span>
          <span style={{ color: 'var(--silver)', fontSize: '0.9rem' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="blog-grid">
          {savedPosts.map((post, idx) => (
            <PostCard key={`saved-${idx}`} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
