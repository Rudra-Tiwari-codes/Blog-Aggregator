import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import { logger } from './logger';
import { ExternalAPIError } from './errors';
import * as constants from './constants';
import type { Post, SearchResult } from './types';

/**
 * Create an AbortSignal that times out after the specified duration
 * Compatible with all Node.js 18+ versions (AbortSignal.timeout requires 18.14.1+)
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = constants.API_RETRY_ATTEMPTS
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      const backoff =
        constants.API_RETRY_BACKOFF_MS * Math.pow(constants.EXPONENTIAL_BACKOFF_BASE, i);
      logger.warn(`Retry attempt ${i + 1}/${retries} after ${backoff}ms`);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  throw new Error('All retries exhausted');
}

/**
 * Fetch posts from Blogger RSS feed using xml2js
 */
export async function fetchBloggerPosts(): Promise<Post[]> {
  try {
    const url = `${constants.BLOGGER_RSS_URL}?max-results=${constants.BLOGGER_MAX_POSTS}`;

    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        headers: {
          'User-Agent': constants.USER_AGENT,
        },
        signal: createTimeoutSignal(constants.API_REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new ExternalAPIError(
          `Blogger RSS error: ${res.status}`,
          'Blogger',
          new Error(res.statusText)
        );
      }

      return res;
    });

    const xml = await response.text();

    // Parse XML using xml2js
    const result = await parseStringPromise(xml, { explicitArray: false });

    const posts: Post[] = [];
    const entries = result.feed?.entry || [];
    const entriesArray = Array.isArray(entries) ? entries : [entries];

    for (const entry of entriesArray) {
      const title = entry.title?._ || entry.title || 'Untitled';
      const link = Array.isArray(entry.link)
        ? entry.link.find((l: { $: { rel: string; href: string } }) => l.$.rel === 'alternate')?.$
          .href
        : entry.link?.$.href || '';
      const published = entry.published || new Date().toISOString();
      const content = entry.content?._ || entry.content || '';

      posts.push({
        title,
        link,
        published,
        content: extractReadableText(content),
        source: constants.BLOG_SOURCE_BLOGSPOT as 'Blogspot',
      });
    }

    logger.info(`Fetched ${posts.length} Blogspot posts`);
    return posts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching Blogger posts: ${errorMessage}`);
    throw new ExternalAPIError('Failed to fetch Blogger posts', 'Blogger', error as Error);
  }
}

/**
 * Fetch posts from Medium RSS using xml2js
 */
export async function fetchMediumPosts(username: string): Promise<Post[]> {
  try {
    const rssUrl = `https://medium.com/feed/@${username}`;

    const response = await retryWithBackoff(async () => {
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': constants.USER_AGENT,
        },
        signal: createTimeoutSignal(constants.API_REQUEST_TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new ExternalAPIError(
          `Medium RSS error: ${res.status}`,
          'Medium',
          new Error(res.statusText)
        );
      }

      return res;
    });

    const xml = await response.text();

    // Parse XML using xml2js
    const result = await parseStringPromise(xml, { explicitArray: false });

    const posts: Post[] = [];
    const items = result.rss?.channel?.item || [];
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      const title = item.title || 'Untitled';
      const link = item.link || '';
      const pubDate = item.pubDate || new Date().toISOString();
      const content = item['content:encoded'] || item.description || '';

      posts.push({
        title,
        link,
        published: new Date(pubDate).toISOString(),
        content: extractReadableText(content),
        source: constants.BLOG_SOURCE_MEDIUM as 'Medium',
      });
    }

    logger.info(`Fetched ${posts.length} Medium posts`);
    return posts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error fetching Medium posts: ${errorMessage}`);
    throw new ExternalAPIError('Failed to fetch Medium posts', 'Medium', error as Error);
  }
}

/**
 * Extract readable text from HTML
 */
export function extractReadableText(html: string): string {
  if (!html) {
    return '';
  }

  try {
    const $ = cheerio.load(html);

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg').remove();

    // Get text content
    let text = $.root().text();

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();

    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Truncate if needed
    if (text.length > constants.MAX_CONTENT_LENGTH) {
      const truncated = text.substring(0, constants.MAX_CONTENT_LENGTH);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
    }

    return text;
  } catch (error) {
    logger.error(`Error extracting readable text: ${error}`);
    // Fallback: basic HTML stripping
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, constants.MAX_CONTENT_LENGTH);
  }
}

/**
 * Generate summary from content
 */
export function generateSummary(content: string): string {
  if (!content || content.trim().length === 0) {
    return 'Click to read more...';
  }

  let cleaned = content.trim();

  // Remove common prefixes
  const prefixesToRemove = [
    'Continue reading on Medium',
    'Read more',
    'Click here',
    'Source:',
    'Originally published',
  ];

  for (const prefix of prefixesToRemove) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.substring(prefix.length).trim();
    }
  }

  // Split into sentences
  const sentences = cleaned
    .split(/[.!?]\s+/)
    .filter(s => s.trim().length > constants.MIN_SENTENCE_LENGTH)
    .map(s => s.trim());

  if (sentences.length === 0) {
    return `${cleaned.substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
  }

  // Take first 2-3 sentences
  let summary = '';
  const maxSentences = 3;
  for (let i = 0; i < Math.min(maxSentences, sentences.length); i++) {
    if ((summary + sentences[i]).length > constants.MAX_SUMMARY_LENGTH) {
      break;
    }
    summary += `${sentences[i]}. `;
  }

  summary = summary.trim();

  if (summary && !summary.match(/[.!?]$/)) {
    summary += '...';
  }

  return summary || `${cleaned.substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
}

/**
 * Normalize URL for deduplication
 */
export function normalizeUrl(url: string): string {
  try {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().toLowerCase().replace(/\/$/, '');
  } catch {
    return String(url || '').toLowerCase();
  }
}

/**
 * Deduplicate posts by canonical URL
 */
export function deduplicatePosts(posts: Post[]): Post[] {
  const seen = new Map<string, Post>();

  for (const post of posts) {
    const canonical = normalizeUrl(post.link);

    if (!seen.has(canonical)) {
      seen.set(canonical, post);
    } else {
      const existing = seen.get(canonical)!;
      if ((post.summary || '').length > (existing.summary || '').length) {
        seen.set(canonical, post);
      }
    }
  }

  logger.info(`Deduplicated ${posts.length} posts to ${seen.size} unique posts`);
  return Array.from(seen.values());
}

/**
 * Simple text-based search with scoring
 */
export function simpleTextSearch(
  query: string,
  posts: Post[],
  limit: number = constants.SEARCH_RESULTS_LIMIT
): SearchResult[] {
  logger.info(`Text search for: "${query}" across ${posts.length} posts`);

  const queryLower = query.toLowerCase().trim();

  if (!queryLower || queryLower.length === 0) {
    return [];
  }

  // Split query into terms
  const terms = queryLower
    .split(/\s+/)
    .map(t => t.replace(/[^\w]/g, ''))
    .filter(t => t.length >= constants.MIN_SEARCH_TERM_LENGTH);

  if (terms.length === 0) {
    logger.warn(`No valid search terms extracted from query: "${query}"`);
    return [];
  }

  const scored = posts.map(post => {
    const titleLower = (post.title || '').toLowerCase();
    const summaryLower = (post.summary || '').toLowerCase();
    const contentLower = (
      post.content?.substring(0, constants.CONTENT_SUBSTRING_LENGTH) || ''
    ).toLowerCase();

    const searchableText = `${titleLower} ${summaryLower} ${contentLower}`;

    let score = 0;
    let matchedTerms = 0;

    for (const term of terms) {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

      const titleMatches = (titleLower.match(wordBoundaryRegex) || []).length;
      const summaryMatches = (summaryLower.match(wordBoundaryRegex) || []).length;
      const contentMatches = (contentLower.match(wordBoundaryRegex) || []).length;

      score += titleMatches * constants.SEARCH_TITLE_BONUS;
      score += summaryMatches * constants.SEARCH_SUMMARY_WEIGHT;
      score += contentMatches;

      if (titleMatches > 0 || summaryMatches > 0 || contentMatches > 0) {
        matchedTerms++;
      }
    }

    // Bonus for matching all terms
    if (matchedTerms === terms.length && terms.length > 1) {
      score += constants.SEARCH_TITLE_BONUS;
    }

    // Exact query match bonus
    const exactQueryRegex = new RegExp(
      `\\b${queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'gi'
    );
    if (exactQueryRegex.test(searchableText)) {
      score += constants.SEARCH_TITLE_BONUS * constants.SEARCH_EXACT_MATCH_BONUS_MULTIPLIER;
    }

    return { ...post, score };
  });

  const results = scored
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  logger.info(`Found ${results.length} matching posts for query: "${query}"`);
  return results;
}

/**
 * Perform semantic search (falls back to text search)
 */
export async function semanticSearch(
  query: string,
  posts: Post[],
  _apiKey?: string,
  limit: number = constants.SEARCH_RESULTS_LIMIT
): Promise<SearchResult[]> {
  logger.info(`Starting search for: "${query}" across ${posts.length} posts`);

  // Currently using text search fallback
  // Semantic search with embeddings can be re-enabled when API quota is available
  return simpleTextSearch(query, posts, limit);
}
