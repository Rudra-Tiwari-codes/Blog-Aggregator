const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');
const constants = require('../backend/constants');

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, _next) => {
    // Log the error
    logger.error(`Error: ${err.message}`, {
        error: err,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });

    // Default error values
    let statusCode = constants.HTTP_INTERNAL_ERROR;
    let message = 'An unexpected error occurred';
    let errors = null;

    // Handle known error types
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;

        if (err.errors) {
            errors = err.errors;
        }
    } else if (err.name === 'ValidationError') {
        statusCode = constants.HTTP_BAD_REQUEST;
        message = 'Validation failed';
        errors = err.errors;
    } else if (err.name === 'CastError') {
        statusCode = constants.HTTP_BAD_REQUEST;
        message = 'Invalid ID format';
    }

    // Send error response
    const errorResponse = {
        success: false,
        error: message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === constants.DEV_ENV && {
            stack: err.stack,
            details: err.message,
        }),
    };

    res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(constants.HTTP_NOT_FOUND).json({
        success: false,
        error: 'Resource not found',
        path: req.url,
    });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
