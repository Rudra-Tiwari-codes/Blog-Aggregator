// Test environment setup
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
process.env.MEDIUM_USERNAME = 'testuser';

// Polyfill File API for cheerio/undici compatibility
// Node.js 18+ has File API, but Jest might not expose it properly
if (typeof global.File === 'undefined') {
  // Simple File polyfill for test environment
  global.File = class File {
    constructor(bits, name, options = {}) {
      this.name = name;
      this.size = bits.length || 0;
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
      this._bits = bits;
    }

    stream() {
      return new ReadableStream({
        start(controller) {
          for (const chunk of this._bits) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
    }

    text() {
      return Promise.resolve(
        this._bits.map(bit => (typeof bit === 'string' ? bit : String(bit))).join('')
      );
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(this.size));
    }
  };
}

// Polyfill FileList if needed
if (typeof global.FileList === 'undefined') {
  global.FileList = class FileList extends Array {
    item(index) {
      return this[index] || null;
    }
  };
}

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
