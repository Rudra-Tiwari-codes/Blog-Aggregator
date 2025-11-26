const constants = require('../../backend/constants');
const { normalizeUrl, deduplicatePosts } = require('../../backend/utils.js');

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

        test('should handle invalid URLs', () => {
            const result = normalizeUrl('not-a-url');
            expect(result).toBe('not-a-url');
        });

        test('should handle null/undefined', () => {
            expect(normalizeUrl(null)).toBe('');
            expect(normalizeUrl(undefined)).toBe('');
        });
    });

    describe('Post Deduplication', () => {
        test('should remove duplicate posts by URL', () => {
            const posts = [
                { link: 'https://example.com/post', title: 'Post 1', summary: 'Short' },
                { link: 'https://Example.com/post/', title: 'Post 2', summary: 'Longer summary' },
            ];

            const result = deduplicatePosts(posts);
            expect(result).toHaveLength(1);
            expect(result[0].summary).toBe('Longer summary');
        });

        test('should keep posts with different URLs', () => {
            const posts = [
                { link: 'https://example.com/post1', title: 'Post 1' },
                { link: 'https://example.com/post2', title: 'Post 2' },
            ];

            const result = deduplicatePosts(posts);
            expect(result).toHaveLength(2);
        });
    });
});
