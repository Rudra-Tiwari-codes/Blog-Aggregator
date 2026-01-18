// Custom error classes for the blog aggregator

export class ExternalAPIError extends Error {
    public source: string;
    public originalError: Error | null;

    constructor(message: string, source: string, originalError?: Error) {
        super(message);
        this.name = 'ExternalAPIError';
        this.source = source;
        this.originalError = originalError || null;
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class CacheError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CacheError';
    }
}
