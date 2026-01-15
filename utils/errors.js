const constants = require('../backend/constants');

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = constants.HTTP_INTERNAL_ERROR, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, constants.HTTP_BAD_REQUEST);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * External API error class
 */
class ExternalAPIError extends AppError {
  constructor(message, apiName, originalError = null) {
    super(message, constants.HTTP_SERVICE_UNAVAILABLE);
    this.name = 'ExternalAPIError';
    this.apiName = apiName;
    this.originalError = originalError;
  }
}

module.exports = {
  AppError,
  ValidationError,
  ExternalAPIError,
};
