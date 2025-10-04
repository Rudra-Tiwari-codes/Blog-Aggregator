import express from 'express';
import { fetchAllBlogs } from '../services/rssFetcher.js';
import { generateSummariesForAllBlogs, generateEmbeddingsForAllBlogs } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/admin/fetch-blogs
 * Manually trigger blog fetching from RSS feeds
 */
router.post('/fetch-blogs', async (req, res) => {
  try {
    const result = await fetchAllBlogs();
    
    res.json({
      success: true,
      message: 'Blogs fetched successfully',
      data: result.stats
    });
  } catch (error) {
    console.error('Error in fetch-blogs route:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/generate-summaries
 * Generate AI summaries for blogs without summaries
 */
router.post('/generate-summaries', async (req, res) => {
  try {
    const result = await generateSummariesForAllBlogs();
    
    res.json({
      success: true,
      message: 'Summaries generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in generate-summaries route:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating summaries',
      error: error.message
    });
  }
});

/**
 * POST /api/admin/generate-embeddings
 * Generate AI embeddings for blogs without embeddings
 */
router.post('/generate-embeddings', async (req, res) => {
  try {
    const result = await generateEmbeddingsForAllBlogs();
    
    res.json({
      success: true,
      message: 'Embeddings generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in generate-embeddings route:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating embeddings',
      error: error.message
    });
  }
});

export default router;
