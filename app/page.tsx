'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { POSTS_PER_PAGE } from '@/lib/constants';
import type { CleanPost, SearchResult } from '@/lib/types';

export default function Home() {
  const [posts, setPosts] = useState<CleanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediumPage, setMediumPage] = useState(1);
  const [blogspotPage, setBlogspotPage] = useState(1);

  // Separate posts by source
  const mediumPosts = posts.filter(p => p.source === 'Medium');
  const blogspotPosts = posts.filter(p => p.source === 'Blogspot');

  // Get latest post
  const latestPost =
    posts.length > 0
      ? posts.reduce((latest, current) =>
        new Date(current.published) > new Date(latest.published) ? current : latest
      )
      : null;

  // Pagination calculations
  const mediumTotalPages = Math.ceil(mediumPosts.length / POSTS_PER_PAGE);
  const blogspotTotalPages = Math.ceil(blogspotPosts.length / POSTS_PER_PAGE);

  const paginatedMedium = mediumPosts.slice(
    (mediumPage - 1) * POSTS_PER_PAGE,
    mediumPage * POSTS_PER_PAGE
  );
  const paginatedBlogspot = blogspotPosts.slice(
    (blogspotPage - 1) * POSTS_PER_PAGE,
    blogspotPage * POSTS_PER_PAGE
  );

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/posts');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.posts || data.posts.length === 0) {
        throw new Error('No posts found - the vault is empty');
      }

      setPosts(data.posts);

      // Minimum loading time for smooth UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load blogs: ${errorMessage}. Please try refreshing the page.`);
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSearchResults([]);
      setError(`Search failed: ${errorMessage}`);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setError(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header onSearch={handleSearch} onClear={handleClearSearch} />

      <main className="main-content">
        <div className="container">
          {error && !searchResults && <ErrorMessage message={error} />}

          {/* Search Results */}
          {searchResults !== null && (
            <section className="search-results">
              <div className="flex justify-between items-center mb-lg">
                <h2 style={{ color: 'var(--teal)' }}>
                  {searchResults.length > 0
                    ? `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                    : `No matches found for "${searchQuery}"`}
                </h2>
              </div>

              {searchResults.length > 0 ? (
                <div className="blog-grid">
                  {searchResults.map((post, idx) => (
                    <PostCard key={`search-${idx}`} post={post} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3>no matches found</h3>
                  <p>couldn&apos;t find anything for &quot;{searchQuery}&quot;</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                    try different keywords or browse all posts
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Main Content (hidden during search) */}
          {searchResults === null && (
            <>
              {/* Featured/Latest Post */}
              {latestPost && (
                <div className="latest-post-container" style={{ marginBottom: '2rem' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-accent)',
                      fontSize: '0.8rem',
                      color: 'var(--rust)',
                      marginBottom: '1rem',
                    }}
                  >
                    latest drop
                  </div>
                  <PostCard post={latestPost} />
                </div>
              )}

              {/* Posts Grid */}
              <div className="posts-container">
                {/* Medium Posts */}
                <section className="column">
                  <div className="flex justify-between items-center mb-md">
                    <h2 style={{ color: 'var(--gold)', fontFamily: 'var(--font-accent)' }}>
                      medium musings
                    </h2>
                    <span className="reaction-btn">{mediumPosts.length}</span>
                  </div>

                  {paginatedMedium.length > 0 ? (
                    <div className="blog-grid">
                      {paginatedMedium.map((post, idx) => (
                        <PostCard key={`medium-${idx}`} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">∅</div>
                      <div className="empty-state-text">nothing here yet</div>
                    </div>
                  )}

                  <Pagination
                    currentPage={mediumPage}
                    totalPages={mediumTotalPages}
                    onPageChange={setMediumPage}
                  />

                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <a
                      href="https://medium.com/@rudratech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                    >
                      more on medium
                    </a>
                  </div>
                </section>

                {/* Blogspot Posts */}
                <section className="column" style={{ marginTop: '3rem' }}>
                  <div className="flex justify-between items-center mb-md">
                    <h2 style={{ color: 'var(--sage)', fontFamily: 'var(--font-accent)' }}>
                      blogspot bits
                    </h2>
                    <span className="reaction-btn">{blogspotPosts.length}</span>
                  </div>

                  {paginatedBlogspot.length > 0 ? (
                    <div className="blog-grid">
                      {paginatedBlogspot.map((post, idx) => (
                        <PostCard key={`blogspot-${idx}`} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">∅</div>
                      <div className="empty-state-text">nothing here yet</div>
                    </div>
                  )}

                  <Pagination
                    currentPage={blogspotPage}
                    totalPages={blogspotTotalPages}
                    onPageChange={setBlogspotPage}
                  />

                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <a
                      href="https://rudra-tiwari-blogs.blogspot.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost"
                    >
                      more on blogspot
                    </a>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
