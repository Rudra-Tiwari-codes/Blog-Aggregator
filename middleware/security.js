const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const constants = require('../backend/constants');

/**
 * Configure Helmet.js security headers
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API endpoint rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.RATE_LIMIT_API_MAX_REQUESTS,
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search endpoint rate limiter (stricter)
 */
const searchLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_SEARCH_WINDOW_MS,
  max: constants.RATE_LIMIT_SEARCH_MAX_REQUESTS,
  message: 'Too many search requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Configure CORS with whitelist
 */
const configureCors = () => {
  const allowedOrigins = [
    'https://blog-aggregator-finale.vercel.app',
    process.env.FRONTEND_URL,
    process.env.NODE_ENV === constants.DEV_ENV && 'http://localhost:3000',
    process.env.NODE_ENV === constants.DEV_ENV && 'http://127.0.0.1:3000',
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};

module.exports = {
  helmetConfig,
  generalLimiter,
  apiLimiter,
  searchLimiter,
  configureCors,
};
