const { validatePostsQuery, validateSearchQuery, checkValidation } = require('../../middleware/validation');
const { validationResult } = require('express-validator');

jest.mock('express-validator', () => ({
    query: jest.fn(() => ({
        optional: jest.fn().mockReturnThis(),
        isBoolean: jest.fn().mockReturnThis(),
    })),
    body: jest.fn(() => ({
        trim: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        notEmpty: jest.fn().mockReturnThis(),
    })),
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

        it('should return 400 if validation errors exist', () => {
            const errors = [{ msg: 'Invalid field', param: 'query' }];
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => errors,
            });

            checkValidation(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                errors,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
