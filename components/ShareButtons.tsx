'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="share-buttons">
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-twitter"
        title="Share on Twitter"
        onClick={e => e.stopPropagation()}
      >
        𝕏
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn share-linkedin"
        title="Share on LinkedIn"
        onClick={e => e.stopPropagation()}
      >
        in
      </a>
      <button
        className={`share-btn share-copy ${copied ? 'copied' : ''}`}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          copyToClipboard();
        }}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? '✓' : '🔗'}
      </button>
    </div>
  );
}
