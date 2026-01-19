import type { CleanPost, SearchResult } from '@/lib/types';

type PostType = CleanPost | SearchResult;

interface PostCardProps {
  post: PostType;
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

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <span className="post-source-badge">{post.source}</span>
        <span className="post-date">{formatDate(post.published)}</span>
      </div>

      <div className="post-title">
        <a href={post.link} target="_blank" rel="noopener noreferrer">
          {post.title || 'Untitled Post'}
        </a>
      </div>

      <div className="post-summary">{cleanAndTruncateSummary(post.summary)}</div>

      <a className="read-more" href={post.link} target="_blank" rel="noopener noreferrer">
        Read More
      </a>
    </article>
  );
}
