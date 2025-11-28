const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('GET /api/posts', () => {
    test('should return posts array', async () => {
      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    test('should accept refresh query parameter', async () => {
      const response = await request(app).get('/api/posts?refresh=true');

      expect(response.status).toBe(200);
      expect(response.body.cached).toBe(false);
    });
  });

  describe('POST /api/search', () => {
    test('should require query parameter', async () => {
      const response = await request(app).post('/api/search').send({});

      expect(response.status).toBe(400);
    });

    test('should search posts with valid query', async () => {
      const response = await request(app).post('/api/search').send({ query: 'javascript' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    test('should sanitize malicious input', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ query: '<script>alert("xss")</script>' });

      expect(response.status).toBe(200);
      // Should not throw error, should sanitize
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
