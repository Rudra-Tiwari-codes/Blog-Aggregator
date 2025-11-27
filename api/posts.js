const { getPosts } = require('../backend/postsService');
const { validatePostsQuery, checkValidation } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const constants = require('../backend/constants');

/**
 * API Handler for fetching posts
 */
module.exports = [
  apiLimiter,
  validatePostsQuery,
  checkValidation,
  asyncHandler(async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
    const forceRefresh = req.query.refresh === 'true';

    logger.info(`Fetching posts${forceRefresh ? ' (force refresh)' : ' (cached)'}`);

    const posts = await getPosts(apiKey, forceRefresh);

    // Remove embeddings from response (they're large)
    const cleanPosts = posts.map(post => ({
      title: post.title,
      link: post.link,
      published: post.published,
      summary: post.summary,
      source: post.source,
    }));

    // Set cache headers
    res.set('Cache-Control', `public, max-age=${constants.CACHE_DURATION_MS / 1000}`);

    return res.status(constants.HTTP_OK).json({
      success: true,
      posts: cleanPosts,
      count: cleanPosts.length,
      cached: !forceRefresh,
      timestamp: new Date().toISOString(),
    });
  }),
];
