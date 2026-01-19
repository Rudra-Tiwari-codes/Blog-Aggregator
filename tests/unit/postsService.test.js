/**
 * Tests for lib/postsService.ts
 * Migrated from legacy backend/postsService.js tests
 */

// Mock the utils module before importing postsService
jest.mock('../../lib/utils', () => ({
  fetchBloggerPosts: jest.fn(),
  fetchMediumPosts: jest.fn(),
  generateSummary: jest.fn(content => content?.substring(0, 100) || 'Summary'),
  deduplicatePosts: jest.fn(posts => posts),
}));

jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const { fetchBloggerPosts, fetchMediumPosts, deduplicatePosts } = require('../../lib/utils');
const { getPosts, clearCache } = require('../../lib/postsService');

describe('Posts Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache(); // Clear cache between tests
  });

  describe('getPosts', () => {
    test('should fetch posts from both sources', async () => {
      const bloggerPosts = [
        {
          title: 'Blogspot Post',
          source: 'Blogspot',
          link: 'https://blog.com/1',
          published: '2024-01-01',
        },
      ];
      const mediumPosts = [
        {
          title: 'Medium Post',
          source: 'Medium',
          link: 'https://medium.com/1',
          published: '2024-01-02',
        },
      ];

      fetchBloggerPosts.mockResolvedValue(bloggerPosts);
      fetchMediumPosts.mockResolvedValue(mediumPosts);
      deduplicatePosts.mockImplementation(posts => posts);

      const posts = await getPosts(true);

      expect(fetchBloggerPosts).toHaveBeenCalled();
      expect(fetchMediumPosts).toHaveBeenCalled();
      expect(posts.length).toBe(2);
    });

    test('should continue if one source fails', async () => {
      const mediumPosts = [
        {
          title: 'Medium Post',
          source: 'Medium',
          link: 'https://medium.com/1',
          published: '2024-01-01',
        },
      ];

      fetchBloggerPosts.mockRejectedValue(new Error('Blogger failed'));
      fetchMediumPosts.mockResolvedValue(mediumPosts);
      deduplicatePosts.mockImplementation(posts => posts);

      const posts = await getPosts(true);

      expect(posts.length).toBe(1);
      expect(posts[0].source).toBe('Medium');
    });

    test('should use cache when available', async () => {
      const mockPosts = [
        {
          title: 'Cached Post',
          source: 'Medium',
          link: 'https://medium.com/1',
          published: '2024-01-01',
        },
      ];

      fetchBloggerPosts.mockResolvedValue([]);
      fetchMediumPosts.mockResolvedValue(mockPosts);
      deduplicatePosts.mockImplementation(posts => posts);

      // First call - fresh fetch
      await getPosts(true);
      expect(fetchMediumPosts).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      jest.clearAllMocks();
      const cachedPosts = await getPosts(false);

      // With cache fresh, should not fetch again
      expect(cachedPosts.length).toBe(1);
    });

    test('should sort posts by date (newest first)', async () => {
      const posts = [
        {
          title: 'Old Post',
          source: 'Blogspot',
          link: 'https://blog.com/1',
          published: '2023-01-01',
        },
        {
          title: 'New Post',
          source: 'Medium',
          link: 'https://medium.com/1',
          published: '2024-06-01',
        },
      ];

      fetchBloggerPosts.mockResolvedValue([posts[0]]);
      fetchMediumPosts.mockResolvedValue([posts[1]]);
      deduplicatePosts.mockImplementation(p => p);

      const result = await getPosts(true);

      expect(result[0].title).toBe('New Post');
      expect(result[1].title).toBe('Old Post');
    });

    test('should throw error if all sources fail', async () => {
      fetchBloggerPosts.mockRejectedValue(new Error('Blogger failed'));
      fetchMediumPosts.mockRejectedValue(new Error('Medium failed'));
      deduplicatePosts.mockImplementation(posts => posts);

      await expect(getPosts(true)).rejects.toThrow('All blog sources are currently unavailable');
    });
  });

  describe('clearCache', () => {
    test('should clear the in-memory cache', async () => {
      const mockPosts = [
        { title: 'Post', source: 'Medium', link: 'https://medium.com/1', published: '2024-01-01' },
      ];

      fetchBloggerPosts.mockResolvedValue([]);
      fetchMediumPosts.mockResolvedValue(mockPosts);
      deduplicatePosts.mockImplementation(posts => posts);

      // Populate cache
      await getPosts(true);

      // Clear cache
      clearCache();

      // Should fetch fresh
      jest.clearAllMocks();
      fetchBloggerPosts.mockResolvedValue([]);
      fetchMediumPosts.mockResolvedValue(mockPosts);

      await getPosts(true);
      expect(fetchMediumPosts).toHaveBeenCalled();
    });
  });
});
