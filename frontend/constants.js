// Frontend constants and configuration
// Centralized configuration for the blog aggregator frontend

const FRONTEND_CONFIG = {
  // API Configuration
  PRODUCTION_URL: 'https://rudra-blog-aggregator.vercel.app',
  API_BASE: window.location.origin,

  // Display Lengths
  MAX_SUMMARY_LENGTH: 200,

  // Pagination
  POSTS_PER_PAGE: 6,

  // Timeouts
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  LOADING_MIN_DURATION_MS: 1200, // 1.2 seconds for UX

  // UI Messages
  MESSAGES: {
    NO_POSTS: 'No posts found - the vault is empty',
    NO_SUMMARY: 'No summary available.',
    NO_RESULTS: 'No matches found',
    SEARCH_ERROR: 'Search failed',
    FETCH_ERROR: 'Failed to load blogs',
    TIMEOUT_ERROR: 'Request timed out - the server is taking too long',
  },

  // Month names for date formatting
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Make it globally available
window.FRONTEND_CONFIG = FRONTEND_CONFIG;
