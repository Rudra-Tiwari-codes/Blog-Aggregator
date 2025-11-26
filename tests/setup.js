// Test environment setup
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.MEDIUM_USERNAME = 'testuser';

// Globals
global.console = {
    ...console,
    // Suppress console logs during tests
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);
