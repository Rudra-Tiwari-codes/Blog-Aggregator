const request = require('supertest');
const express = require('express');
const postsHandler = require('../../api/posts');
const { getPosts } = require('../../backend/postsService');

jest.mock('../../backend/postsService');
jest.mock('../../utils/logger');

describe('GET /api/posts', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get('/api/posts', ...(Array.isArray(postsHandler) ? postsHandler : [postsHandler]));
    jest.clearAllMocks();
  });

  it('should return posts successfully', async () => {
    const mockPosts = [
      {
        title: 'Test Post 1',
        link: 'https://example.com/1',
        published: '2024-01-01T00:00:00Z',
        summary: 'Test summary',
        source: 'Medium',
        embedding: [0.1, 0.2, 0.3], // Should be removed
      },
      {
        title: 'Test Post 2',
        link: 'https://example.com/2',
        published: '2024-01-02T00:00:00Z',
        summary: 'Another summary',
        source: 'Blogspot',
        embedding: [0.4, 0.5, 0.6], // Should be removed
      },
    ];

    getPosts.mockResolvedValue(mockPosts);

    const response = await request(app).get('/api/posts').expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');
    expect(response.body).toHaveProperty('count', 2);
    expect(response.body).toHaveProperty('cached');
    expect(response.body).toHaveProperty('timestamp');

    // Verify embeddings are removed
    response.body.posts.forEach(post => {
      expect(post).not.toHaveProperty('embedding');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('link');
      expect(post).toHaveProperty('summary');
      expect(post).toHaveProperty('source');
    });
  });

  it('should force refresh when query param is true', async () => {
    const mockPosts = [{ title: 'Fresh Post', link: 'https://example.com/1', source: 'Medium' }];

    getPosts.mockResolvedValue(mockPosts);

    const response = await request(app).get('/api/posts?refresh=true').expect(200);

    expect(getPosts).toHaveBeenCalledWith(expect.any(String), true);
    expect(response.body.cached).toBe(false);
  });

  it('should use cache by default', async () => {
    const mockPosts = [{ title: 'Cached Post', link: 'https://example.com/1', source: 'Medium' }];

    getPosts.mockResolvedValue(mockPosts);

    await request(app).get('/api/posts').expect(200);

    expect(getPosts).toHaveBeenCalledWith(expect.any(String), false);
  });

  it('should handle errors gracefully', async () => {
    getPosts.mockRejectedValue(new Error('Service error'));

    const response = await request(app).get('/api/posts').expect(500);

    expect(response.body).toHaveProperty('success', false);
  });

  it('should set cache control headers', async () => {
    const mockPosts = [{ title: 'Test', link: 'https://example.com/1', source: 'Medium' }];

    getPosts.mockResolvedValue(mockPosts);

    const response = await request(app).get('/api/posts').expect(200);

    expect(response.headers['cache-control']).toMatch(/public/);
    expect(response.headers['cache-control']).toMatch(/max-age/);
  });
});
