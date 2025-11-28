require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const expressWinston = require('express-winston');
const logger = require('./utils/logger');
const constants = require('./backend/constants');
const { helmetConfig, generalLimiter, configureCors } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// API handlers
const postsHandler = require('./api/posts');
const searchHandler = require('./api/search');

const app = express();
const PORT = process.env.PORT || constants.DEFAULT_PORT;

// Security middleware
app.use(helmetConfig);
app.use(compression());
app.use(cors(configureCors()));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV !== constants.PROD_ENV) {
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: true,
    })
  );
}

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.get('/api/posts', postsHandler);
app.post('/api/search', searchHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(constants.HTTP_OK).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || constants.DEV_ENV,
  });
});

// Serve frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`
╔════════════════════════════════════════════╗
║   Blog Aggregator Server                   ║
║   Running at http://localhost:${PORT}${PORT === constants.DEFAULT_PORT ? '      ' : '     '}║
╠════════════════════════════════════════════╣
║   API Endpoints:                           ║
║   GET  /api/posts      - Fetch all posts   ║
║   POST /api/search     - Semantic search   ║
║   GET  /health         - Health check      ║
╠════════════════════════════════════════════╣
║   Configuration:                           ║
║   - Add ?refresh=true to force refresh     ║
║   - Environment: ${process.env.NODE_ENV || 'development'}${process.env.NODE_ENV === 'production' ? '          ' : '            '}║
╚════════════════════════════════════════════╝
    `);
  });
}

// Export for Vercel
module.exports = app;
