/**
 * Tests for lib/utils.ts and lib/constants.ts
 * Migrated from legacy backend/utils.js tests
 */

// Import from the new lib/ TypeScript modules
// Jest will use the compiled JS via ts-jest or the source directly
const constants = require('../../lib/constants');
const { normalizeUrl, deduplicatePosts, extractReadableText, generateSummary } = require('../../lib/utils');

describe('Utility Functions', () => {
  describe('Constants', () => {
    test('CACHE_DURATION_MS should be 30 minutes', () => {
      expect(constants.CACHE_DURATION_MS).toBe(30 * 60 * 1000);
    });

    test('HTTP status codes should be correct', () => {
      expect(constants.HTTP_OK).toBe(200);
      expect(constants.HTTP_BAD_REQUEST).toBe(400);
      expect(constants.HTTP_INTERNAL_ERROR).toBe(500);
    });

    test('API timeout should be reasonable', () => {
      expect(constants.API_REQUEST_TIMEOUT_MS).toBeGreaterThan(5000);
      expect(constants.API_REQUEST_TIMEOUT_MS).toBeLessThan(60000);
    });

    test('Search result limits should be defined', () => {
      expect(constants.SEARCH_RESULTS_LIMIT).toBeGreaterThan(0);
      expect(constants.MAX_SUMMARY_LENGTH).toBeGreaterThan(100);
    });
  });

  describe('URL Normalization', () => {
    test('should remove trailing slash', () => {
      const result = normalizeUrl('https://example.com/');
      expect(result).toBe('https://example.com');
    });

    test('should convert to lowercase', () => {
      const result = normalizeUrl('https://Example.COM/Path');
      expect(result).toBe('https://example.com/path');
    });

    test('should handle invalid URLs gracefully', () => {
      const result = normalizeUrl('not-a-url');
      expect(result).toBe('not-a-url');
    });

    test('should handle null/undefined', () => {
      expect(normalizeUrl(null)).toBe('');
      expect(normalizeUrl(undefined)).toBe('');
    });

    test('should strip query parameters', () => {
      const result = normalizeUrl('https://example.com/post?utm_source=test');
      expect(result).toBe('https://example.com/post');
    });
  });

  describe('Post Deduplication', () => {
    test('should remove duplicate posts by URL', () => {
      const posts = [
        { link: 'https://example.com/post', title: 'Post 1', summary: 'Short' },
        { link: 'https://Example.com/post/', title: 'Post 2', summary: 'Longer summary text' },
      ];

      const result = deduplicatePosts(posts);
      expect(result).toHaveLength(1);
      // Should keep the one with longer summary
      expect(result[0].summary).toBe('Longer summary text');
    });

    test('should keep posts with different URLs', () => {
      const posts = [
        { link: 'https://example.com/post1', title: 'Post 1' },
        { link: 'https://example.com/post2', title: 'Post 2' },
      ];

      const result = deduplicatePosts(posts);
      expect(result).toHaveLength(2);
    });

    test('should handle empty array', () => {
      const result = deduplicatePosts([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('Text Extraction', () => {
    test('should extract text from HTML', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const result = extractReadableText(html);
      expect(result).toBe('Hello world');
    });

    test('should remove script and style tags', () => {
      const html = '<script>alert("x")</script><p>Content</p><style>.x{}</style>';
      const result = extractReadableText(html);
      expect(result).toBe('Content');
    });

    test('should handle empty input', () => {
      expect(extractReadableText('')).toBe('');
      expect(extractReadableText(null)).toBe('');
    });
  });

  describe('Summary Generation', () => {
    test('should generate summary from content', () => {
      const content = 'This is the first sentence. This is the second sentence. This is the third.';
      const result = generateSummary(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(500);
    });

    test('should handle empty content', () => {
      const result = generateSummary('');
      expect(result).toBe('Click to read more...');
    });

    test('should end with proper punctuation', () => {
      const content = 'Short content here';
      const result = generateSummary(content);
      expect(result).toMatch(/[.!?]\.{0,3}$/);
    });
  });
});
