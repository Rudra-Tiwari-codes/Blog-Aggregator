const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const constants = require('./constants');
const {
  fetchBloggerPosts,
  fetchMediumPosts,
  generateSummary,
  generateEmbedding,
  deduplicatePosts,
} = require('./utils');

// In-memory cache
let postsCache = null;
let lastFetch = null;

/**
 * Load cached posts from file
 */
async function loadFromFile() {
  // Always try to load from file, but gracefully handle failure
  // This allows it to work on Vercel if /tmp or other writable paths are used in future
  try {
    const cacheFile = process.env.CACHE_FILE || constants.CACHE_FILE_PATH;
    const dataPath = path.join(process.cwd(), cacheFile);

    // Check if file exists first to avoid throwing error
    try {
      await fs.access(dataPath);
    } catch {
      return null; // File doesn't exist, just return null
    }

    const data = await fs.readFile(dataPath, 'utf-8');
    const posts = JSON.parse(data);
    logger.info(`Loaded ${posts.length} posts from file cache`);
    return posts;
  } catch (error) {
    // Log but don't throw - file cache is optional
    logger.warn(`Failed to load cache file: ${error.message}`);
    return null;
  }
}

/**
 * Save posts to cache file
 */
async function saveToFile(posts) {
  try {
    const cacheFile = process.env.CACHE_FILE || constants.CACHE_FILE_PATH;
    const dataPath = path.join(process.cwd(), cacheFile);
    const dir = path.dirname(dataPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(posts, null, constants.JSON_INDENT_SPACES));
    logger.info(`Saved ${posts.length} posts to cache file`);
  } catch (error) {
    // Log error but do not crash the application
    // This is expected on read-only file systems like Vercel
    logger.warn(`Could not save cache file (expected on Vercel): ${error.message}`);
  }
}

/**
 * Fetch all posts from all sources
 */
async function fetchAllPosts(apiKey) {
  logger.info('Starting to fetch posts from all sources...');
  const allPosts = [];

  // Fetch from Blogger RSS
  try {
    logger.info('Fetching Blogspot posts...');
    const bloggerPosts = await fetchBloggerPosts();
    allPosts.push(...bloggerPosts);
  } catch (error) {
    logger.error(`Error fetching Blogger posts: ${error.message}`);
  }

  // Fetch from Medium RSS
  try {
    const mediumUsername = process.env.MEDIUM_USERNAME || 'rudratech';
    logger.info(`Fetching Medium posts for @${mediumUsername}...`);
    const mediumPosts = await fetchMediumPosts(mediumUsername);
    allPosts.push(...mediumPosts);
  } catch (error) {
    logger.error(`Error fetching Medium posts: ${error.message}`);
  }

  // Deduplicate posts
  const uniquePosts = deduplicatePosts(allPosts);

  // Ensure at least one source succeeded
  if (uniquePosts.length === 0) {
    throw new Error('All blog sources are currently unavailable. Please try again later.');
  }

  // Attempt to load existing file cache to keep previously generated summaries
  const existingPosts = await loadFromFile();
  const existingMap = new Map();

  if (existingPosts) {
    existingPosts.forEach(p => existingMap.set(p.link, p));
  }

  // Process posts with summaries and embeddings
  const processed = await Promise.all(
    uniquePosts.map(async post => {
      const existing = existingMap.get(post.link);

      // Reuse existing summary if available
      if (existing && existing.summary) {
        return existing;
      }

      try {
        // Generate summary with fallback
        try {
          post.summary = await generateSummary(post.content);
        } catch (summaryErr) {
          logger.warn(`Summary generation failed for ${post.title}: ${summaryErr.message}`);
          post.summary = `${(post.content || '').substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
        }

        // Generate embedding (currently disabled)
        const embeddingText = `${post.title} ${post.summary} ${post.content?.substring(0, constants.CONTENT_SUBSTRING_LENGTH) || ''}`;
        post.embedding = await generateEmbedding(embeddingText, apiKey);
      } catch (err) {
        logger.error(`Error processing post ${post.title}: ${err.message}`);
        post.summary = `${(post.content || '').substring(0, constants.MAX_SUMMARY_LENGTH)}...`;
        post.embedding = null;
      }

      return post;
    })
  );

  // Sort by date (newest first)
  processed.sort((a, b) => new Date(b.published) - new Date(a.published));

  // Persist to file
  await saveToFile(processed);

  logger.info(`Successfully processed ${processed.length} posts`);
  return processed;
}

/**
 * Get posts with caching
 */
async function getPosts(apiKey, forceRefresh = false) {
  const now = Date.now();

  // Use in-memory cache if available and not expired
  if (!forceRefresh && postsCache && lastFetch && now - lastFetch < constants.CACHE_DURATION_MS) {
    logger.info(`Returning ${postsCache.length} posts from in-memory cache`);
    return postsCache;
  }

  // Try to load from file cache if not forcing refresh
  if (!forceRefresh) {
    const fileCache = await loadFromFile();

    if (fileCache && fileCache.length > 0) {
      postsCache = fileCache;
      lastFetch = now;

      // Background refresh if cache is stale
      if (now - lastFetch > constants.CACHE_DURATION_MS) {
        logger.info('Cache is stale, triggering background refresh...');
        fetchAllPosts(apiKey)
          .then(p => {
            postsCache = p;
            lastFetch = Date.now();
            logger.info('Background refresh completed');
          })
          .catch(err => logger.error(`Background refresh failed: ${err.message}`));
      }

      return postsCache;
    }
  }

  // Fetch fresh posts
  const posts = await fetchAllPosts(apiKey);
  postsCache = posts;
  lastFetch = now;

  return posts;
}

module.exports = { getPosts, fetchAllPosts, loadFromFile, saveToFile };
