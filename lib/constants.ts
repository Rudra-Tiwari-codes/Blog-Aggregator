// Configuration constants for the application
// Centralizes all magic numbers and configuration values

// Base time constants
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;

// Cache Configuration
export const CACHE_DURATION_MINUTES = 30;
export const CACHE_DURATION_MS =
  CACHE_DURATION_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
export const CACHE_FILE_PATH = 'data/posts.json';

// API Configuration
export const API_REQUEST_TIMEOUT_MS = 10000; // 10 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_BACKOFF_MS = 1000; // Initial backoff

// Content Processing
export const MAX_CONTENT_LENGTH = 3000; // characters
export const MAX_SUMMARY_LENGTH = 300; // characters
export const MIN_SENTENCE_LENGTH = 20; // characters
export const CONTENT_SUBSTRING_LENGTH = 500;
export const EXPONENTIAL_BACKOFF_BASE = 2;
export const JSON_INDENT_SPACES = 2;

// Post Limits
export const BLOGGER_MAX_POSTS = 10;
export const MEDIUM_MAX_POSTS = 10;

// Search Configuration
export const SEARCH_RESULTS_LIMIT = 10;
export const SEARCH_MIN_SCORE = 0.3; // Minimum similarity score
export const SEARCH_TITLE_BONUS = 5; // Bonus points for title matches
export const SEARCH_QUERY_MAX_LENGTH = 500;
export const SEARCH_QUERY_MIN_LENGTH = 1;
export const MIN_SEARCH_TERM_LENGTH = 2; // Minimum length for individual search terms
export const SEARCH_SUMMARY_WEIGHT = 2; // Weight multiplier for summary matches
export const SEARCH_EXACT_MATCH_BONUS_MULTIPLIER = 2; // Multiplier for exact query match bonus

// Frontend Configuration
export const FRONTEND_REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const LOADING_SCREEN_MIN_DURATION_MS = 1200; // Minimum loading time for UX
export const MAX_SUMMARY_DISPLAY_LENGTH = 200; // characters
export const POSTS_PER_PAGE = 6;

// Environment
export const PROD_ENV = 'production';
export const DEV_ENV = 'development';
export const TEST_ENV = 'test';

// HTTP Status Codes
export const HTTP_OK = 200;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_NOT_FOUND = 404;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_INTERNAL_ERROR = 500;
export const HTTP_SERVICE_UNAVAILABLE = 503;

// Blog Sources
export const BLOG_SOURCE_MEDIUM = 'Medium';
export const BLOG_SOURCE_BLOGSPOT = 'Blogspot';

// Blogger Configuration
export const BLOGGER_RSS_URL =
  process.env.BLOGGER_RSS_URL || 'https://rudra-tiwari-blogs.blogspot.com/feeds/posts/default';

// User Agent
export const USER_AGENT = 'Mozilla/5.0 (compatible; BlogAggregator/4.0)';
