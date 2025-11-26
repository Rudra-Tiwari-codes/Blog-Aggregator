const fetch = require('node-fetch');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const { ExternalAPIError } = require('../utils/errors');
const constants = require('./constants');

// Initialize Gemini
let genAI;
let model;

function initializeGemini(apiKey) {
  if (!genAI && apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    logger.info('Gemini AI initialized successfully');
  }
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
      const backoff = constants.API_RETRY_BACKOFF_MS * Math.pow(2, i);
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
 * Better handles Medium and Blogspot content
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

    // Remove code blocks that might contain markup
    $('pre, code').each(function () {
      $(this).replaceWith(' ');
    });

    // Get main content - try multiple selectors
    let text =
      $('article').first().text() ||
      $('.post-content').first().text() ||
      $('.entry-content').first().text() ||
      $('main').first().text() ||
      $('body').text();

    // Clean up whitespace and special characters
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\t+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Decode any remaining HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Limit to configured max length
    return text.trim().substring(0, constants.MAX_CONTENT_LENGTH);
  } catch (error) {
    logger.error(`Error extracting readable text: ${error.message}`);
    // Fallback: basic HTML stripping
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, constants.MAX_CONTENT_LENGTH);
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
    return cleaned.substring(0, constants.MAX_SUMMARY_LENGTH) + '...';
  }

  // Take first 2-3 sentences, up to max length
  let summary = '';
  const maxSentences = 3;
  for (let i = 0; i < Math.min(maxSentences, sentences.length); i++) {
    if ((summary + sentences[i]).length > constants.MAX_SUMMARY_LENGTH) {
      break;
    }
    summary += sentences[i] + ' ';
  }

  summary = summary.trim();

  // Ensure it ends with proper punctuation
  if (summary && !summary.match(/[.!?]$/)) {
    summary += '...';
  }

  return summary || cleaned.substring(0, constants.MAX_SUMMARY_LENGTH) + '...';
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
    return parsed
      .toString()
      .toLowerCase()
      .replace(/\/$/, '');
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
          const text = `${post.title} ${post.summary || ''} ${post.content?.substring(0, 500) || ''}`;
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
 * Fallback simple text search
 */
function simpleTextSearch(query, posts, limit = constants.SEARCH_RESULTS_LIMIT) {
  logger.info(`Text search for: "${query}" across ${posts.length} posts`);

  const queryLower = query.toLowerCase();
  const terms = queryLower.split(/\s+/).filter(t => t.length > 2);

  const scored = posts.map(post => {
    const text =
      `${post.title} ${post.summary || ''} ${post.content?.substring(0, 500) || ''}`.toLowerCase();

    let score = 0;
    for (const term of terms) {
      const count = (text.match(new RegExp(term, 'g')) || []).length;
      score += count;

      // Bonus for title matches
      if (post.title.toLowerCase().includes(term)) {
        score += constants.SEARCH_TITLE_BONUS;
      }
    }

    return { ...post, score };
  });

  const results = scored
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  logger.info(`Found ${results.length} matching posts`);
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
};
