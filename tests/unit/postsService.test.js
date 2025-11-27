const { getPosts, fetchAllPosts, loadFromFile, saveToFile } = require('../../backend/postsService');
const fs = require('fs').promises;
const logger = require('../../utils/logger');

// Mock dependencies
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn(),
    },
}));

jest.mock('../../utils/logger');
jest.mock('../../backend/utils');

const { fetchBloggerPosts, fetchMediumPosts, deduplicatePosts } = require('../../backend/utils');

describe('Posts Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset module cache to clear in-memory cache
        jest.resetModules();
    });

    describe('loadFromFile', () => {
        it('should load posts from cache file', async () => {
            const mockPosts = [
                { title: 'Post 1', link: 'https://example.com/1', source: 'Medium' },
                { title: 'Post 2', link: 'https://example.com/2', source: 'Blogspot' },
            ];

            process.env.VERCEL = undefined;
            fs.readFile.mockResolvedValue(JSON.stringify(mockPosts));

            const posts = await loadFromFile();

            expect(posts).toEqual(mockPosts);
            expect(fs.readFile).toHaveBeenCalled();
        });
    });

    describe('saveToFile', () => {
        it('should save posts to cache file', async () => {
            const mockPosts = [{ title: 'Post 1', link: 'https://example.com/1' }];

            process.env.VERCEL = undefined;
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            await saveToFile(mockPosts);

            expect(fs.mkdir).toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('posts.json'),
                JSON.stringify(mockPosts, null, 2)
            );
        });

        it('should not save on Vercel platform', async () => {
            process.env.VERCEL = '1';
            const mockPosts = [{ title: 'Post 1' }];

            await saveToFile(mockPosts);

            expect(fs.writeFile).not.toHaveBeenCalled();
        });
    });

    describe('fetchAllPosts', () => {
        it('should fetch and merge posts from both sources', async () => {
            const bloggerPosts = [{ title: 'Blogspot Post', source: 'Blogspot', link: 'https://blog.com/1' }];
            const mediumPosts = [{ title: 'Medium Post', source: 'Medium', link: 'https://medium.com/1' }];

            fetchBloggerPosts.mockResolvedValue(bloggerPosts);
            fetchMediumPosts.mockResolvedValue(mediumPosts);
            deduplicatePosts.mockImplementation(posts => posts);

            process.env.VERCEL = undefined;
            fs.readFile.mockRejectedValue(new Error('No cache'));
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            const posts = await fetchAllPosts('test-api-key');

            expect(posts.length).toBeGreaterThan(0);
            expect(fetchBloggerPosts).toHaveBeenCalled();
            expect(fetchMediumPosts).toHaveBeenCalled();
        });

        it('should continue if one source fails', async () => {
            const mediumPosts = [{ title: 'Medium Post', source: 'Medium', link: 'https://medium.com/1' }];

            fetchBloggerPosts.mockRejectedValue(new Error('Blogger failed'));
            fetchMediumPosts.mockResolvedValue(mediumPosts);
            deduplicatePosts.mockImplementation(posts => posts);

            process.env.VERCEL = undefined;
            fs.readFile.mockRejectedValue(new Error('No cache'));
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            const posts = await fetchAllPosts('test-api-key');

            expect(posts.length).toBeGreaterThan(0);
            expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Blogger'));
        });

        it('should deduplicate posts', async () => {
            const bloggerPosts = [{ title: 'Post 1', link: 'https://example.com/1', source: 'Blogspot' }];
            const mediumPosts = [{ title: 'Post 1 Duplicate', link: 'https://example.com/1', source: 'Medium' }];

            fetchBloggerPosts.mockResolvedValue(bloggerPosts);
            fetchMediumPosts.mockResolvedValue(mediumPosts);
            deduplicatePosts.mockImplementation(posts => posts.slice(0, 1)); // Simulate dedup

            process.env.VERCEL = undefined;
            fs.readFile.mockRejectedValue(new Error('No cache'));
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            const posts = await fetchAllPosts('test-api-key');

            expect(deduplicatePosts).toHaveBeenCalled();
        });
    });

    describe('getPosts', () => {
        it('should return cached posts if cache is fresh', async () => {
            // This test requires accessing module-level cache
            // For now, we'll test the file cache path
            const mockPosts = [{ title: 'Cached Post', link: 'https://example.com/1' }];

            process.env.VERCEL = undefined;
            fs.readFile.mockResolvedValue(JSON.stringify(mockPosts));

            const posts = await getPosts('test-api-key', false);

            expect(posts).toEqual(mockPosts);
            expect(fetchBloggerPosts).not.toHaveBeenCalled();
        });

        it('should fetch fresh posts when forced refresh', async () => {
            const mockPosts = [{ title: 'Fresh Post', source: 'Medium', link: 'https://example.com/1' }];

            fetchBloggerPosts.mockResolvedValue([]);
            fetchMediumPosts.mockResolvedValue(mockPosts);
            deduplicatePosts.mockImplementation(posts => posts);

            process.env.VERCEL = undefined;
            fs.readFile.mockRejectedValue(new Error('No cache'));
            fs.mkdir.mockResolvedValue();
            fs.writeFile.mockResolvedValue();

            const posts = await getPosts('test-api-key', true);

            expect(fetchMediumPosts).toHaveBeenCalled();
            expect(posts.length).toBeGreaterThan(0);
        });
    });
});
