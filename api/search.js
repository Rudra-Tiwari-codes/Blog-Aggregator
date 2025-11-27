const { semanticSearch } = require('../backend/utils');
const { getPosts } = require('../backend/postsService');
const { validateSearch, checkValidation } = require('../middleware/validation');
const { searchLimiter } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const constants = require('../backend/constants');

/**
 * API Handler for semantic search
 */
module.exports = [
  searchLimiter,
  validateSearch,
  checkValidation,
  asyncHandler(async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
    const { query } = req.body;

    logger.info(`Search request for: "${query}"`);

    // Load posts from cache
    const posts = await getPosts(apiKey, false);

    if (!posts || posts.length === 0) {
      return res.status(constants.HTTP_OK).json({
        success: true,
        results: [],
        count: 0,
        query,
        message: 'No posts available to search',
      });
    }

    // Perform search
    const results = await semanticSearch(
      query,
      posts,
      apiKey,
      constants.SEARCH_RESULTS_LIMIT
    );

    // Clean results (remove embeddings and raw content)
    const cleanResults = results.map(post => ({
      title: post.title,
      link: post.link,
      published: post.published,
      summary: post.summary,
      source: post.source,
      score: post.score,
    }));

    logger.info(`Search found ${cleanResults.length} results for "${query}"`);

    return res.status(constants.HTTP_OK).json({
      success: true,
      results: cleanResults,
      count: cleanResults.length,
      query,
      timestamp: new Date().toISOString(),
    });
  }),
];
