'use client';

import type { CleanPost } from '@/lib/types';

interface CategoryFilterProps {
  posts: CleanPost[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

// Keywords to look for in post titles and summaries
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Machine Learning': [
    'machine learning',
    'ml',
    'ai',
    'artificial intelligence',
    'neural',
    'deep learning',
    'training',
    'model',
  ],
  DevOps: [
    'docker',
    'kubernetes',
    'k8s',
    'containerization',
    'deployment',
    'ci/cd',
    'devops',
    'pipeline',
  ],
  Data: ['data', 'etl', 'pipeline', 'analytics', 'database', 'sql', 'warehouse'],
  Backend: ['api', 'backend', 'server', 'node', 'python', 'java', 'microservice'],
  Frontend: ['react', 'frontend', 'javascript', 'typescript', 'css', 'ui', 'ux'],
  Cloud: ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda'],
};

function extractCategories(posts: CleanPost[]): Map<string, number> {
  const categoryCounts = new Map<string, number>();

  for (const post of posts) {
    const text = `${post.title} ${post.summary || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      }
    }
  }

  return categoryCounts;
}

export function filterPostsByCategory(posts: CleanPost[], category: string | null): CleanPost[] {
  if (!category) return posts;

  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return posts;

  return posts.filter(post => {
    const text = `${post.title} ${post.summary || ''}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  });
}

export default function CategoryFilter({
  posts,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const categoryCounts = extractCategories(posts);

  // Only show categories that have at least 1 post
  const activeCategories = Array.from(categoryCounts.entries())
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]); // Sort by count descending

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <div className="category-filter">
      <button
        className={`category-btn ${!selectedCategory ? 'active' : ''}`}
        onClick={() => onCategoryChange(null)}
      >
        All
      </button>
      {activeCategories.map(([category, count]) => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
        >
          {category} <span className="category-count">{count}</span>
        </button>
      ))}
    </div>
  );
}
