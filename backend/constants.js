// Configuration constants for the application
// Centralizes all magic numbers and configuration values

module.exports = {
    // Cache Configuration
    CACHE_DURATION_MS: 30 * 60 * 1000, // 30 minutes
    CACHE_FILE_PATH: 'data/posts.json',

    // API Configuration
    API_REQUEST_TIMEOUT_MS: 10000, // 10 seconds
    API_RETRY_ATTEMPTS: 3,
    API_RETRY_BACKOFF_MS: 1000, // Initial backoff

    // Content Processing
    MAX_CONTENT_LENGTH: 3000, // characters
    MAX_SUMMARY_LENGTH: 300, // characters
    MIN_SENTENCE_LENGTH: 20, // characters

    // Post Limits
    BLOGGER_MAX_POSTS: 10,
    MEDIUM_MAX_POSTS: 10,

    // Search Configuration
    SEARCH_RESULTS_LIMIT: 10,
    SEARCH_MIN_SCORE: 0.3, // Minimum similarity score
    SEARCH_TITLE_BONUS: 5, // Bonus points for title matches

    // Frontend Configuration
    FRONTEND_REQUEST_TIMEOUT_MS: 30000, // 30 seconds
    LOADING_SCREEN_MIN_DURATION_MS: 1200, // Minimum loading time for UX
    MAX_SUMMARY_DISPLAY_LENGTH: 200, // characters

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    RATE_LIMIT_API_MAX_REQUESTS: 50,
    RATE_LIMIT_SEARCH_WINDOW_MS: 60 * 1000, // 1 minute
    RATE_LIMIT_SEARCH_MAX_REQUESTS: 10,

    // Server Configuration
    DEFAULT_PORT: 3000,

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
