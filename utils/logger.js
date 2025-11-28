const winston = require('winston');
const constants = require('../backend/constants');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || constants.DEV_ENV;
  const isDevelopment = env === constants.DEV_ENV;
  return isDevelopment ? 'debug' : 'info';
};

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define transports
// Define transports
const transports = [new winston.transports.Console()];

// Only add file transports if NOT in Vercel environment and NOT in test environment
// Vercel has a read-only file system (except /tmp)
// Tests should not create log files
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  try {
    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      })
    );
    transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
  } catch (error) {
    // Silently fail if we can't create log files (e.g., in test environment)
    // This is expected in some environments
  }
}

// Create logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = logger;
