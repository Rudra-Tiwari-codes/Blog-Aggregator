const request = require('supertest');
const express = require('express');
const searchHandler = require('../../api/search');
const { getPosts } = require('../../backend/postsService');
const { semanticSearch } = require('../../backend/utils');

jest.mock('../../backend/postsService');
jest.mock('../../backend/utils');
jest.mock('../../utils/logger');

describe('POST /api/search', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.post('/api/search', ...(Array.isArray(searchHandler) ? searchHandler : [searchHandler]));
        jest.clearAllMocks();
    });

    it('should return search results successfully', async () => {
        const mockPosts = [
            { title: 'JavaScript Basics', link: 'https://example.com/1', source: 'Medium' },
            { title: 'Advanced JavaScript', link: 'https://example.com/2', source: 'Blogspot' },
        ];

        const mockResults = [mockPosts[0]];

        getPosts.mockResolvedValue(mockPosts);
        semanticSearch.mockResolvedValue(mockResults);

        const response = await request(app)
            .post('/api/search')
            .send({ query: 'JavaScript' })
            .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('count', 1);
        expect(response.body).toHaveProperty('query', 'JavaScript');
        expect(response.body.results).toHaveLength(1);
    });

    it('should reject empty query', async () => {
        const response = await request(app)
            .post('/api/search')
            .send({ query: '' })
            .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
    });

    it('should reject missing query', async () => {
        const response = await request(app)
            .post('/api/search')
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty('success', false);
    });

    it('should handle search with no results', async () => {
        const mockPosts = [
            { title: 'JavaScript Basics', link: 'https://example.com/1', source: 'Medium' },
        ];

        getPosts.mockResolvedValue(mockPosts);
        semanticSearch.mockResolvedValue([]);

        const response = await request(app)
            .post('/api/search')
            .send({ query: 'Python' })
            .expect(200);

        expect(response.body.count).toBe(0);
        expect(response.body.results).toHaveLength(0);
    });

    it('should handle service errors gracefully', async () => {
        getPosts.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/search')
            .send({ query: 'JavaScript' })
            .expect(500);

        expect(response.body).toHaveProperty('success', false);
    });

    it('should trim whitespace from query', async () => {
        const mockPosts = [{ title: 'Test', link: 'https://example.com/1', source: 'Medium' }];

        getPosts.mockResolvedValue(mockPosts);
        semanticSearch.mockResolvedValue([mockPosts[0]]);

        await request(app)
            .post('/api/search')
            .send({ query: '  JavaScript  ' })
            .expect(200);

        expect(semanticSearch).toHaveBeenCalledWith(
            'JavaScript',
            mockPosts,
            expect.any(String)
        );
    });

    it('should respect query length limits', async () => {
        const longQuery = 'a'.repeat(1000);

        const response = await request(app)
            .post('/api/search')
            .send({ query: longQuery })
            .expect(400);

        expect(response.body).toHaveProperty('success', false);
    });
});
