import Parser from 'rss-parser';
import Blog from '../models/Blog.js';

const parser = new Parser({
  customFields: {
    item: [
      ['category', 'categories', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
      ['media:thumbnail', 'mediaThumbnail'],
    ]
  }
});

/**
 * Fetch blogs from Medium RSS feed
 * @param {string} username - Medium username
 * @returns {Promise<Array>} Array of blog objects
 */
export const fetchMediumBlogs = async (username) => {
  try {
    const feedUrl = `https://medium.com/feed/@${username}`;
    const feed = await parser.parseURL(feedUrl);
    
    const blogs = feed.items.map(item => ({
      title: item.title,
      author: item.creator || username,
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
      link: item.link,
      source: 'medium',
      publishDate: new Date(item.pubDate || item.isoDate),
      categories: item.categories || [],
      tags: item.categories || [],
      imageUrl: extractImageFromContent(item['content:encoded'] || item.content || ''),
    }));

    return blogs;
  } catch (error) {
    console.error('Error fetching Medium blogs:', error.message);
    return [];
  }
};

/**
 * Fetch blogs from Blogger RSS feed
 * @param {string} blogUrl - Blogger blog URL
 * @returns {Promise<Array>} Array of blog objects
 */
export const fetchBloggerBlogs = async (blogUrl) => {
  try {
    const feedUrl = `${blogUrl}/feeds/posts/default?alt=rss`;
    const feed = await parser.parseURL(feedUrl);
    
    const blogs = feed.items.map(item => ({
      title: item.title,
      author: item.creator || feed.title || 'Unknown',
      content: item['content:encoded'] || item.content || item.contentSnippet || '',
      link: item.link,
      source: 'blogger',
      publishDate: new Date(item.pubDate || item.isoDate),
      categories: item.categories || [],
      tags: item.categories || [],
      imageUrl: item.mediaThumbnail?.['$']?.url || extractImageFromContent(item['content:encoded'] || item.content || ''),
    }));

    return blogs;
  } catch (error) {
    console.error('Error fetching Blogger blogs:', error.message);
    return [];
  }
};

/**
 * Extract first image URL from HTML content
 * @param {string} content - HTML content
 * @returns {string} Image URL or empty string
 */
const extractImageFromContent = (content) => {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  return match ? match[1] : '';
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
export const stripHtmlTags = (html) => {
  return html.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Save or update blogs in database
 * @param {Array} blogs - Array of blog objects
 * @returns {Promise<Object>} Statistics of saved/updated blogs
 */
export const saveBlogsToDatabase = async (blogs) => {
  let saved = 0;
  let updated = 0;
  let skipped = 0;

  for (const blogData of blogs) {
    try {
      const existingBlog = await Blog.findOne({ link: blogData.link });
      
      if (existingBlog) {
        // Update existing blog if content changed
        if (existingBlog.content !== blogData.content) {
          await Blog.findByIdAndUpdate(existingBlog._id, blogData);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new blog
        await Blog.create(blogData);
        saved++;
      }
    } catch (error) {
      console.error(`Error saving blog "${blogData.title}":`, error.message);
      skipped++;
    }
  }

  return { saved, updated, skipped, total: blogs.length };
};

/**
 * Fetch all blogs from all sources
 * @returns {Promise<Object>} Statistics and fetched blogs
 */
export const fetchAllBlogs = async () => {
  const mediumUsername = process.env.MEDIUM_USERNAME;
  const bloggerUrl = process.env.BLOGGER_URL;

  const [mediumBlogs, bloggerBlogs] = await Promise.all([
    fetchMediumBlogs(mediumUsername),
    fetchBloggerBlogs(bloggerUrl)
  ]);

  const allBlogs = [...mediumBlogs, ...bloggerBlogs];
  const stats = await saveBlogsToDatabase(allBlogs);

  return {
    stats,
    blogs: allBlogs
  };
};
