const {
  validatePostsQuery,
  validateSearchQuery,
  checkValidation,
} = require('../../middleware/validation');
const { validationResult } = require('express-validator');

// Create a chainable mock object
const createChainableMock = () => {
  const chain = {
    exists: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isBoolean: jest.fn().mockReturnThis(),
    toBoolean: jest.fn().mockReturnThis(),
  };
  return chain;
};

jest.mock('express-validator', () => ({
  query: jest.fn(() => createChainableMock()),
  body: jest.fn(() => createChainableMock()),
  validationResult: jest.fn(),
}));

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validatePostsQuery', () => {
    it('should be an array of validation middleware', () => {
      expect(Array.isArray(validatePostsQuery)).toBe(true);
      expect(validatePostsQuery.length).toBeGreaterThan(0);
    });
  });

  describe('validateSearchQuery', () => {
    it('should be an array of validation middleware', () => {
      expect(Array.isArray(validateSearchQuery)).toBe(true);
      expect(validateSearchQuery.length).toBeGreaterThan(0);
    });
  });

  describe('checkValidation', () => {
    it('should call next() if no validation errors', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      checkValidation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if validation errors exist', () => {
      const errors = [{ msg: 'Invalid field', path: 'query' }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors.map(e => ({ ...e, field: e.path || e.param })),
      });

      expect(() => {
        checkValidation(req, res, next);
      }).toThrow('Validation failed');

      expect(next).not.toHaveBeenCalled();
    });
  });
});
