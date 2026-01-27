'use client';

import type { CleanPost, SearchResult } from '@/lib/types';
import BookmarkButton from './BookmarkButton';
import ShareButtons from './ShareButtons';
import { addToHistory, trackClick } from '@/lib/tracking';

type PostType = CleanPost | SearchResult;

interface PostCardProps {
  post: PostType;
  isFocused?: boolean;
  onFocus?: () => void;
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return 'Invalid date';
  }
}

function cleanAndTruncateSummary(rawContent: string | undefined, maxLength = 200): string {
  if (!rawContent) return 'No summary available.';

  let cleaned = rawContent.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();

  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
  }

  return cleaned;
}

/**
 * Calculate estimated reading time based on summary length
 * Average reading speed is ~200-250 words per minute
 * Since we have summaries (not full content), we estimate based on typical blog post length
 */
function calculateReadingTime(summary: string | undefined): string {
  if (!summary) return '2 min read';

  // Count words in summary
  const wordCount = summary.split(/\s+/).filter(w => w.length > 0).length;

  // Estimate full post length: summaries are typically 10-15% of full content
  // If summary is ~50 words, full post is likely ~400-500 words
  const estimatedFullWords = Math.max(wordCount * 8, 200);

  // Calculate reading time (200 words per minute average)
  const readingMinutes = Math.ceil(estimatedFullWords / 200);

  return `${readingMinutes} min read`;
}

export default function PostCard({ post, isFocused = false, onFocus }: PostCardProps) {
  const readingTime = calculateReadingTime(post.summary);

  const handleClick = () => {
    // Track the click for popular posts
    trackClick(post.link);
    // Add to reading history
    addToHistory(post.link, post.title);
  };

  return (
    <article
      className={`post-card ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onFocus={onFocus}
      data-post-link={post.link}
    >
      <div className="post-meta">
        <span className="post-source-badge">{post.source}</span>
        <span className="post-date">{formatDate(post.published)}</span>
        <span className="post-reading-time">{readingTime}</span>
        <BookmarkButton postLink={post.link} postTitle={post.title} />
      </div>

      <div className="post-title">
        <a href={post.link} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
          {post.title || 'Untitled Post'}
        </a>
      </div>

      <div className="post-summary">{cleanAndTruncateSummary(post.summary)}</div>

      <div className="post-actions">
        <a
          className="read-more"
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          Read More
        </a>
        <ShareButtons url={post.link} title={post.title} />
      </div>
    </article>
  );
}
