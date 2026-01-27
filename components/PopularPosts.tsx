'use client';

import { useState, useEffect } from 'react';
import type { CleanPost } from '@/lib/types';
import { getPopularLinks } from '@/lib/tracking';
import PostCard from './PostCard';

interface PopularPostsProps {
  posts: CleanPost[];
}

export default function PopularPosts({ posts }: PopularPostsProps) {
  const [popularPosts, setPopularPosts] = useState<CleanPost[]>([]);

  useEffect(() => {
    updatePopularPosts();

    const handleClicksChanged = () => {
      updatePopularPosts();
    };

    window.addEventListener('clicksChanged', handleClicksChanged);
    return () => window.removeEventListener('clicksChanged', handleClicksChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  function updatePopularPosts() {
    const popularLinks = getPopularLinks(5);
    const popular = posts.filter(post => popularLinks.includes(post.link));
    // Sort by popularity (maintain order from getPopularLinks)
    popular.sort((a, b) => popularLinks.indexOf(a.link) - popularLinks.indexOf(b.link));
    setPopularPosts(popular);
  }

  if (popularPosts.length === 0) {
    return null;
  }

  return (
    <section className="popular-section" style={{ marginBottom: '2rem' }}>
      <div className="flex justify-between items-center mb-md">
        <h2 style={{ color: 'var(--rust)', fontFamily: 'var(--font-accent)' }}>🔥 trending</h2>
        <span className="reaction-btn">{popularPosts.length}</span>
      </div>

      <div className="popular-posts-scroll">
        {popularPosts.map((post, idx) => (
          <div key={`popular-${idx}`} className="popular-post-item">
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
