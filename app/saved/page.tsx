'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import ReadingHistory from '@/components/ReadingHistory';
import ReadingProgress from '@/components/ReadingProgress';
import type { CleanPost } from '@/lib/types';
import Link from 'next/link';

export default function SavedPage() {
  const [allPosts, setAllPosts] = useState<CleanPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<CleanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts and filter by bookmarks
  useEffect(() => {
    fetchPostsAndFilter();
  }, []);

  // Listen for bookmark changes
  useEffect(() => {
    const handleBookmarksChanged = () => {
      filterSavedPosts(allPosts);
    };

    window.addEventListener('bookmarksChanged', handleBookmarksChanged);
    return () => window.removeEventListener('bookmarksChanged', handleBookmarksChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPosts]);

  // Re-filter when allPosts changes
  useEffect(() => {
    if (allPosts.length > 0) {
      filterSavedPosts(allPosts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPosts]);

  function getBookmarks(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('rudra-blog-bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function filterSavedPosts(posts: CleanPost[]) {
    const bookmarks = getBookmarks();
    const saved = posts.filter(post => bookmarks.includes(post.link));
    setSavedPosts(saved);
  }

  async function fetchPostsAndFilter() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/posts');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setAllPosts(data.posts || []);

      // Minimum loading time
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load posts: ${errorMessage}`);
      setLoading(false);
    }
  }

  const handleSearch = async (query: string) => {
    // Navigate to main page with search
    window.location.href = `/?search=${encodeURIComponent(query)}`;
  };

  const handleClearSearch = () => {
    // Do nothing on saved page
  };

  if (loading) {
    return (
      <>
        <Header onSearch={handleSearch} onClear={handleClearSearch} />
        <main className="main-content">
          <div className="container">
            <div className="loading">loading saved posts</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ReadingProgress />
      <Header onSearch={handleSearch} onClear={handleClearSearch} />

      <main className="main-content">
        <div className="container">
          {error && <div className="message error">{error}</div>}

          <div className="saved-page-header" style={{ marginBottom: '2rem' }}>
            <Link
              href="/"
              style={{
                color: 'var(--silver)',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              ← back to all posts
            </Link>

            <h1
              style={{
                color: 'var(--plum)',
                fontFamily: 'var(--font-accent)',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              saved ★
            </h1>
            <p style={{ color: 'var(--silver)', marginTop: '0.5rem' }}>
              your bookmarked posts are stored locally in your browser
            </p>
          </div>

          {savedPosts.length > 0 ? (
            <>
              <div
                style={{
                  color: 'var(--silver)',
                  marginBottom: '1.5rem',
                  fontFamily: 'var(--font-accent)',
                  fontSize: '0.9rem',
                }}
              >
                {savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}
              </div>

              <div className="blog-grid">
                {savedPosts.map((post, idx) => (
                  <PostCard key={`saved-${idx}`} post={post} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ marginTop: '3rem' }}>
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>
                ☆
              </div>
              <h3 style={{ marginTop: '1rem', color: 'var(--pearl)' }}>no saved posts yet</h3>
              <p style={{ color: 'var(--silver)', marginTop: '0.5rem' }}>
                click the star icon on any post to save it for later
              </p>
              <Link href="/" className="btn btn-ghost" style={{ marginTop: '1.5rem' }}>
                browse posts
              </Link>
            </div>
          )}

          {/* Reading History Section */}
          <ReadingHistory />
        </div>
      </main>

      <Footer />
    </>
  );
}
