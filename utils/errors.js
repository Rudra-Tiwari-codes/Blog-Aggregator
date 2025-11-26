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
 * Authentication error class
 */
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, constants.HTTP_UNAUTHORIZED);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization error class
 */
class AuthorizationError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, constants.HTTP_FORBIDDEN);
        this.name = 'AuthorizationError';
    }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, constants.HTTP_NOT_FOUND);
        this.name = 'NotFoundError';
    }
}

/**
 * Rate limit error class
 */
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, constants.HTTP_TOO_MANY_REQUESTS);
        this.name = 'RateLimitError';
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
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    ExternalAPIError,
};
