const { getPosts } = require('../backend/postsService');
const logger = require('../utils/logger');
const constants = require('../backend/constants');

/**
 * Vercel Serverless Function for fetching posts
 */
module.exports = async (req, res) => {
  try {
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
    res.setHeader('Cache-Control', `public, max-age=${constants.CACHE_DURATION_MS / 1000}`);
    res.setHeader('Content-Type', 'application/json');

    return res.status(constants.HTTP_OK).json({
      success: true,
      posts: cleanPosts,
      count: cleanPosts.length,
      cached: !forceRefresh,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in /api/posts: ${error.message}`);
    return res.status(constants.HTTP_INTERNAL_ERROR).json({
      success: false,
      error: 'Failed to fetch posts',
      message: error.message,
    });
  }
};
