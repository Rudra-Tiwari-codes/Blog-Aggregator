const { errorHandler, notFoundHandler, asyncHandler } = require('../../middleware/errorHandler');
const { AppError } = require('../../utils/errors');
const constants = require('../../backend/constants');
const logger = require('../../utils/logger');

jest.mock('../../utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      url: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle ValidationError', () => {
      const error = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: { field: 'Invalid' },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(constants.HTTP_BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        errors: { field: 'Invalid' },
      });
    });

    it('should handle CastError', () => {
      const error = {
        name: 'CastError',
        message: 'Cast failed',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(constants.HTTP_BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid ID format',
      });
    });

    it('should handle unknown errors with 500', () => {
      const error = new Error('Unknown error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(constants.HTTP_INTERNAL_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'An unexpected error occurred',
      });
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = constants.DEV_ENV;
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
          details: 'Test error',
        })
      );
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = constants.PROD_ENV;
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg).not.toHaveProperty('stack');
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 status', () => {
      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(constants.HTTP_NOT_FOUND);
    });

    it('should return error JSON response', () => {
      notFoundHandler(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found',
        path: '/api/test',
      });
    });

    it('should log warning', () => {
      notFoundHandler(req, res);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('404'));
    });
  });

  describe('asyncHandler', () => {
    it('should call the wrapped function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(mockFn);

      await wrapped(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Async error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(mockFn);

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors', async () => {
      const error = new Error('Sync error');
      const mockFn = jest.fn(() => {
        throw error;
      });
      const wrapped = asyncHandler(mockFn);

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
