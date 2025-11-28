const { body, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validation middleware for search endpoint
 */
const validateSearch = [
  body('query')
    .exists()
    .withMessage('Query is required')
    .isString()
    .withMessage('Query must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Query must be between 1 and 500 characters')
    .escape(),
];

/**
 * Validation middleware for posts endpoint
 */
const validatePostsQuery = [
  query('refresh')
    .optional()
    .isBoolean()
    .withMessage('Refresh must be a boolean value')
    .toBoolean(),
];

/**
 * Middleware to check validation results
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));

    throw new ValidationError('Validation failed', errorMessages);
  }

  next();
};

module.exports = {
  validateSearch,
  validateSearchQuery: validateSearch, // Alias for backward compatibility
  validatePostsQuery,
  checkValidation,
};
