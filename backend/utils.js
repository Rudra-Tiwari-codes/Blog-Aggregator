const fetch = require('node-fetch');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const { ExternalAPIError } = require('../utils/errors');
const constants = require('./constants');

// Initialize Gemini
let genAI;

function initializeGemini(apiKey) {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    logger.info('Gemini AI initialized successfully');
    return model;
  }
  return null;
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff(fn, retries = constants.API_RETRY_ATTEMPTS) {
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
}

/**
 * Fetch posts from Blogger RSS feed using xml2js
 */
async function fetchBloggerPosts() {
  try {
    const url = `${constants.BLOGGER_RSS_URL}?max-results=${constants.BLOGGER_MAX_POSTS}`;

    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        headers: {
          'User-Agent': constants.USER_AGENT,
        },
        timeout: constants.API_REQUEST_TIMEOUT_MS,
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
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const posts = [];
    const entries = result.feed?.entry || [];
    const entriesArray = Array.isArray(entries) ? entries : [entries];

    for (const entry of entriesArray) {
      const title = entry.title?._ || entry.title || 'Untitled';
      const link = Array.isArray(entry.link)
        ? entry.link.find(l => l.$.rel === 'alternate')?.$.href
        : entry.link?.$.href || '';
      const published = entry.published || new Date().toISOString();
      const content = entry.content?._ || entry.content || '';

      posts.push({
        title,
        link,
        published,
        content: extractReadableText(content),
        source: constants.BLOG_SOURCE_BLOGSPOT,
      });
    }

    logger.info(`Fetched ${posts.length} Blogspot posts`);
    return posts;
  } catch (error) {
    logger.error(`Error fetching Blogger posts: ${error.message}`);
    throw new ExternalAPIError('Failed to fetch Blogger posts', 'Blogger', error);
  }
}

/**
 * Fetch posts from Medium RSS using xml2js
 */
async function fetchMediumPosts(username) {
  try {
    const rssUrl = `https://medium.com/feed/@${username}`;

    const response = await retryWithBackoff(async () => {
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': constants.USER_AGENT,
        },
        timeout: constants.API_REQUEST_TIMEOUT_MS,
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
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xml);

    const posts = [];
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
        source: constants.BLOG_SOURCE_MEDIUM,
      });
    }

    logger.info(`Fetched ${posts.length} Medium posts (RSS limit: ${constants.MEDIUM_MAX_POSTS})`);
    return posts;
  } catch (error) {
    logger.error(`Error fetching Medium posts: ${error.message}`);
    throw new ExternalAPIError('Failed to fetch Medium posts', 'Medium', error);
  }
}

/**
 * Extract readable text from HTML - IMPROVED VERSION
 * Better handles Medium and Blogspot content with preserved formatting
 */
function extractReadableText(html) {
  if (!html) {
    return '';
  }

  try {
    const $ = cheerio.load(html, {
      decodeEntities: true,
    });

    // Remove script, style, and other non-content elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg').remove();

    // Preserve paragraph and line break structure
    // Convert <p> tags to double newlines (paragraph breaks)
    $('p, div').each(function () {
      const $el = $(this);
      if ($el.text().trim()) {
        $el.replaceWith(`${$el.text()}\n\n`);
      }
    });

    // Convert <br> and <br/> to single newlines
    $('br').replaceWith('\n');

    // Convert headings to newlines with emphasis
    $('h1, h2, h3, h4, h5, h6').each(function () {
      const $el = $(this);
      $el.replaceWith(`\n\n${$el.text().trim()}\n\n`);
    });

    // Convert list items to newlines with bullets
    $('li').each(function () {
      const $el = $(this);
      $el.replaceWith(`• ${$el.text().trim()}\n`);
    });

    // Convert list containers
    $('ul, ol').each(function () {
      const $el = $(this);
      $el.replaceWith(`\n${$el.text()}\n`);
    });

    // Preserve code blocks but simplify
    $('pre, code').each(function () {
      const $el = $(this);
      $el.replaceWith(`\n${$el.text()}\n`);
    });

    // Get main content - try multiple selectors
    const rawText =
      $('article').first().text() ||
      $('.post-content').first().text() ||
      $('.entry-content').first().text() ||
      $('main').first().text() ||
      $('body').text();

    let text = rawText;

    // Clean up excessive whitespace while preserving intentional line breaks
    // Replace 3+ newlines with 2 (paragraph break)
    text = text.replace(/\n{3,}/g, '\n\n');

    // Replace multiple spaces with single space (but preserve newlines)
    text = text.replace(/[ \t]+/g, ' ');

    // Clean up special characters
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Decode any remaining HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, '...')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'");

    // Trim and limit to configured max length
    text = text.trim();

    // If we're truncating, try to cut at a paragraph boundary
    if (text.length > constants.MAX_CONTENT_LENGTH) {
      const truncated = text.substring(0, constants.MAX_CONTENT_LENGTH);
      const lastParagraph = truncated.lastIndexOf('\n\n');
      const MIN_PARAGRAPH_POSITION = 0.8;
      if (lastParagraph > constants.MAX_CONTENT_LENGTH * MIN_PARAGRAPH_POSITION) {
        return `${truncated.substring(0, lastParagraph).trim()}...`;
      }
      return `${truncated.trim()}...`;
    }

    return text;
  } catch (error) {
    logger.error(`Error extracting readable text: ${error.message}`);
    // Fallback: basic HTML stripping with newline preservation
    const text = html
      .replace(/<p[^>]*>/gi, '\n\n')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text.substring(0, constants.MAX_CONTENT_LENGTH);
  }
}

/**
 * Fetch full article HTML
 */
async function fetchArticle(url) {
  try {
    return await retryWithBackoff(async () => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': constants.USER_AGENT,
        },
        timeout: constants.API_REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    });
  } catch (error) {
    logger.error(`Failed to fetch article ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Generate summary using improved content excerpt
 * @param {string} content - The post content to summarize
 * @returns {string} - Generated summary
 */
async function generateSummary(content) {
  if (!content || content.trim().length === 0) {
    return 'Click to read more...';
  }

  let cleaned = content.trim();

  // Remove common prefixes that aren't part of the actual content
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

  // Split into sentences - fixed regex for better compatibility
  const sentences = cleaned
    .split(/[.!?]\s+/)
    .filter(s => s.trim().length > constants.MIN_SENTENCE_LENGTH)
    .map(s => s.trim());

  if (sentences.length === 0) {
    return `${cleaned.substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
  }

  // Take first 2-3 sentences, up to max length
  let summary = '';
  const maxSentences = 3;
  for (let i = 0; i < Math.min(maxSentences, sentences.length); i++) {
    if ((summary + sentences[i]).length > constants.MAX_SUMMARY_LENGTH) {
      break;
    }
    summary += `${sentences[i]} `;
  }

  summary = summary.trim();

  // Ensure it ends with proper punctuation
  if (summary && !summary.match(/[.!?]$/)) {
    summary += '...';
  }

  return summary || `${cleaned.substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
}

/**
 * Generate embeddings for semantic search
 * @deprecated Currently disabled due to API quota limitations
 * @param {string} _text - Text to generate embedding for (unused)
 * @param {string} _apiKey - API key for Gemini (unused)
 * @returns {null} - Always returns null, forcing fallback to keyword search
 *
 * TODO: Re-enable when Gemini embedding API quota is available
 * This function is intentionally disabled to avoid API quota exhaustion.
 * When null is returned, the search system automatically falls back to
 * simple text-based keyword matching (see simpleTextSearch).
 */
async function generateEmbedding(_text, _apiKey) {
  // Disabled - returning null forces fallback to keyword search
  return null;
}

/**
 * Deduplicate posts by canonical URL
 */
function deduplicatePosts(posts) {
  const seen = new Map();

  for (const post of posts) {
    const canonical = normalizeUrl(post.link);

    if (!seen.has(canonical)) {
      seen.set(canonical, post);
    } else {
      // Keep the one with more complete data
      const existing = seen.get(canonical);
      if ((post.summary || '').length > (existing.summary || '').length) {
        seen.set(canonical, post);
      }
    }
  }

  logger.info(`Deduplicated ${posts.length} posts to ${seen.size} unique posts`);
  return Array.from(seen.values());
}

/**
 * Normalize URL for deduplication
 */
function normalizeUrl(url) {
  try {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const parsed = new URL(url);
    // Remove tracking parameters and fragments
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().toLowerCase().replace(/\/$/, '');
  } catch {
    return String(url || '').toLowerCase();
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Perform semantic search
 */
async function semanticSearch(query, posts, apiKey, limit = constants.SEARCH_RESULTS_LIMIT) {
  logger.info(`Starting search for: "${query}" across ${posts.length} posts`);

  try {
    initializeGemini(apiKey);

    const queryEmbedding = await generateEmbedding(query, apiKey);

    if (!queryEmbedding) {
      logger.info('No embedding generated, using text search fallback');
      return simpleTextSearch(query, posts, limit);
    }

    // Calculate similarity scores
    const scored = await Promise.all(
      posts.map(async post => {
        if (!post.embedding) {
          const text = `${post.title} ${post.summary || ''} ${post.content?.substring(0, constants.CONTENT_SUBSTRING_LENGTH) || ''}`;
          post.embedding = await generateEmbedding(text, apiKey);
        }

        const similarity = post.embedding ? cosineSimilarity(queryEmbedding, post.embedding) : 0;

        return { ...post, score: similarity };
      })
    );

    const results = scored
      .filter(post => post.score > constants.SEARCH_MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    logger.info(`Found ${results.length} results with score > ${constants.SEARCH_MIN_SCORE}`);
    return results;
  } catch (error) {
    logger.error(`Semantic search error: ${error.message}`);
    return simpleTextSearch(query, posts, limit);
  }
}

/**
 * Fallback simple text search with improved matching
 * Uses word boundaries and better scoring for accurate results
 */
function simpleTextSearch(query, posts, limit = constants.SEARCH_RESULTS_LIMIT) {
  logger.info(`Text search for: "${query}" across ${posts.length} posts`);

  const queryLower = query.toLowerCase().trim();

  // Handle empty or very short queries
  if (!queryLower || queryLower.length === 0) {
    return [];
  }

  // Split query into terms, allowing 2+ character terms
  // Filter out very short terms but allow 2-character terms like "AI", "ML", "JS"
  const terms = queryLower
    .split(/\s+/)
    .map(t => t.replace(/[^\w]/g, '')) // Remove punctuation
    .filter(t => t.length >= constants.MIN_SEARCH_TERM_LENGTH && t.length > 0);

  // If no valid terms after filtering, return empty results
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

    // Combine all searchable text
    const searchableText = `${titleLower} ${summaryLower} ${contentLower}`;

    let score = 0;
    let matchedTerms = 0;

    for (const term of terms) {
      // Use word boundaries for exact word matching (prevents substring matches)
      // Escape special regex characters in the term
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');

      // Count matches in different sections with different weights
      const titleMatches = (titleLower.match(wordBoundaryRegex) || []).length;
      const summaryMatches = (summaryLower.match(wordBoundaryRegex) || []).length;
      const contentMatches = (contentLower.match(wordBoundaryRegex) || []).length;

      // Weighted scoring: title matches are most important
      score += titleMatches * constants.SEARCH_TITLE_BONUS;
      score += summaryMatches * constants.SEARCH_SUMMARY_WEIGHT; // Summary matches are important
      score += contentMatches; // Content matches are less important

      // Track if this term matched anywhere
      if (titleMatches > 0 || summaryMatches > 0 || contentMatches > 0) {
        matchedTerms++;
      }
    }

    // Bonus for matching all terms (exact phrase or all keywords)
    if (matchedTerms === terms.length && terms.length > 1) {
      score += constants.SEARCH_TITLE_BONUS;
    }

    // Exact query match bonus (if the entire query appears as-is)
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

module.exports = {
  fetchBloggerPosts,
  fetchMediumPosts,
  extractReadableText,
  fetchArticle,
  generateSummary,
  generateEmbedding,
  deduplicatePosts,
  semanticSearch,
  initializeGemini,
  normalizeUrl,
};
