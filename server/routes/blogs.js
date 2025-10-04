import express from 'express';
import Blog from '../models/Blog.js';
import { findRelatedBlogs } from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/blogs
 * Get all blogs with filtering, sorting, and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = 'newest',
      category,
      source,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (category) {
      query.categories = category;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishDate: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'newest':
      default:
        sortOption = { publishDate: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select('title author summary link source publishDate categories imageUrl'),
      Blog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

/**
 * GET /api/blogs/:id
 * Get a single blog by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
});

/**
 * GET /api/blogs/:id/related
 * Get related blogs for a specific blog
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const relatedBlogs = await findRelatedBlogs(req.params.id, parseInt(limit));
    
    res.json({
      success: true,
      data: relatedBlogs
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related blogs',
      error: error.message
    });
  }
});

/**
 * GET /api/blogs/categories/list
 * Get all unique categories
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Blog.distinct('categories');
    
    res.json({
      success: true,
      data: categories.filter(cat => cat && cat.trim() !== '')
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

/**
 * GET /api/blogs/stats/overview
 * Get blog statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const [total, mediumCount, bloggerCount, categories] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ source: 'medium' }),
      Blog.countDocuments({ source: 'blogger' }),
      Blog.distinct('categories')
    ]);

    res.json({
      success: true,
      data: {
        total,
        bySource: {
          medium: mediumCount,
          blogger: bloggerCount
        },
        categoriesCount: categories.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;
