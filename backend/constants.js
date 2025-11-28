// Configuration constants for the application
// Centralizes all magic numbers and configuration values

// Base time constants
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

// Cache Configuration
const CACHE_DURATION_MINUTES = 30;

// Rate Limiting
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_SEARCH_WINDOW_MINUTES = 1;

// Server Configuration
const DEFAULT_PORT = 3000;

module.exports = {
  // Cache Configuration
  CACHE_DURATION_MINUTES,
  CACHE_DURATION_MS: CACHE_DURATION_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
  CACHE_FILE_PATH: 'data/posts.json',
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,

  // API Configuration
  API_REQUEST_TIMEOUT_MS: 10000, // 10 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_BACKOFF_MS: 1000, // Initial backoff

  // Content Processing
  MAX_CONTENT_LENGTH: 3000, // characters
  MAX_SUMMARY_LENGTH: 300, // characters
  MIN_SENTENCE_LENGTH: 20, // characters
  CONTENT_SUBSTRING_LENGTH: 500,
  EXPONENTIAL_BACKOFF_BASE: 2,
  JSON_INDENT_SPACES: 2,

  // Post Limits
  BLOGGER_MAX_POSTS: 10,
  MEDIUM_MAX_POSTS: 10,

  // Search Configuration
  SEARCH_RESULTS_LIMIT: 10,
  SEARCH_MIN_SCORE: 0.3, // Minimum similarity score
  SEARCH_TITLE_BONUS: 5, // Bonus points for title matches
    SEARCH_QUERY_MAX_LENGTH: 500,
    SEARCH_QUERY_MIN_LENGTH: 1,
    MIN_SEARCH_TERM_LENGTH: 2, // Minimum length for individual search terms (allows 2-char terms like "AI", "ML")
    SEARCH_SUMMARY_WEIGHT: 2, // Weight multiplier for summary matches
    SEARCH_EXACT_MATCH_BONUS_MULTIPLIER: 2, // Multiplier for exact query match bonus

  // Frontend Configuration
  FRONTEND_REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  LOADING_SCREEN_MIN_DURATION_MS: 1200, // Minimum loading time for UX
  MAX_SUMMARY_DISPLAY_LENGTH: 200, // characters

  // Rate Limiting
  RATE_LIMIT_WINDOW_MINUTES,
  RATE_LIMIT_WINDOW_MS: RATE_LIMIT_WINDOW_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_API_MAX_REQUESTS: 50,
  RATE_LIMIT_SEARCH_WINDOW_MINUTES,
  RATE_LIMIT_SEARCH_WINDOW_MS:
    RATE_LIMIT_SEARCH_WINDOW_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND,
  RATE_LIMIT_SEARCH_MAX_REQUESTS: 10,

  // Server Configuration
  DEFAULT_PORT,
  PORT_DEFAULT: DEFAULT_PORT,

  // Environment
  PROD_ENV: 'production',
  DEV_ENV: 'development',
  TEST_ENV: 'test',

  // HTTP Status Codes
  HTTP_OK: 200,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_METHOD_NOT_ALLOWED: 405,
  HTTP_TOO_MANY_REQUESTS: 429,
  HTTP_INTERNAL_ERROR: 500,
  HTTP_SERVICE_UNAVAILABLE: 503,

  // Blog Sources
  BLOG_SOURCE_MEDIUM: 'Medium',
  BLOG_SOURCE_BLOGSPOT: 'Blogspot',

  // Blogger Configuration
  BLOGGER_RSS_URL: 'https://rudra-tiwari-blogs.blogspot.com/feeds/posts/default',

  // User Agent
  USER_AGENT: 'Mozilla/5.0 (compatible; BlogAggregator/3.0)',
};
