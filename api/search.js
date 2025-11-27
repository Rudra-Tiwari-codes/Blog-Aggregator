const { semanticSearch } = require('../backend/utils');
const { getPosts } = require('../backend/postsService');
const logger = require('../utils/logger');
const constants = require('../backend/constants');

/**
 * Vercel Serverless Function for semantic search
 */
module.exports = async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return res.status(constants.HTTP_METHOD_NOT_ALLOWED).json({
        success: false,
        error: 'Method not allowed',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(constants.HTTP_BAD_REQUEST).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

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

    res.setHeader('Content-Type', 'application/json');
    return res.status(constants.HTTP_OK).json({
      success: true,
      results: cleanResults,
      count: cleanResults.length,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in /api/search: ${error.message}`);
    return res.status(constants.HTTP_INTERNAL_ERROR).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
};
