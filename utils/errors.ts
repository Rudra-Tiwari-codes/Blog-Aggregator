import constants from '../backend/constants';

/**
 * Base application error class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: string;

    constructor(
        message: string,
        statusCode: number = constants.HTTP_INTERNAL_ERROR,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
    public readonly errors: Array<{ field?: string; message: string }>;

    constructor(message: string, errors: Array<{ field?: string; message: string }> = []) {
        super(message, constants.HTTP_BAD_REQUEST);
        this.name = 'ValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, constants.HTTP_UNAUTHORIZED);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Access forbidden') {
        super(message, constants.HTTP_FORBIDDEN);
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, constants.HTTP_NOT_FOUND);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, constants.HTTP_TOO_MANY_REQUESTS);
        this.name = 'RateLimitError';
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * External API error class
 */
export class ExternalAPIError extends AppError {
    public readonly apiName: string;
    public readonly originalError: Error | null;

    constructor(message: string, apiName: string, originalError: Error | null = null) {
        super(message, constants.HTTP_SERVICE_UNAVAILABLE);
        this.name = 'ExternalAPIError';
        this.apiName = apiName;
        this.originalError = originalError;
        Object.setPrototypeOf(this, ExternalAPIError.prototype);
    }
}

// CommonJS compatibility export for migration period
module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    ExternalAPIError,
};
