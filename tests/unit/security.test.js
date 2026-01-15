const { helmetConfig, generalLimiter, configureCors } = require('../../middleware/security');
const constants = require('../../backend/constants');

describe('Security Middleware', () => {
  describe('Rate Limiters', () => {
    it('should have general limiter configured', () => {
      expect(generalLimiter).toBeDefined();
      expect(typeof generalLimiter).toBe('function');
    });
  });

  describe('Helmet Configuration', () => {
    it('should have helmet middleware configured', () => {
      expect(helmetConfig).toBeDefined();
      expect(typeof helmetConfig).toBe('function');
    });
  });

  describe('CORS Configuration', () => {
    it('should return CORS configuration object', () => {
      const corsConfig = configureCors();

      expect(corsConfig).toBeDefined();
      expect(corsConfig).toHaveProperty('origin');
      expect(corsConfig).toHaveProperty('credentials');
      expect(corsConfig).toHaveProperty('methods');
      expect(corsConfig).toHaveProperty('allowedHeaders');
    });

    it('should allow configured origins in development', () => {
      process.env.NODE_ENV = constants.DEV_ENV;
      const corsConfig = configureCors();

      const callback = jest.fn();
      corsConfig.origin('http://localhost:3000', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow production origin', () => {
      process.env.NODE_ENV = constants.PROD_ENV;
      const corsConfig = configureCors();

      const callback = jest.fn();
      corsConfig.origin('https://rudra-blog-aggregator.vercel.app', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow requests with no origin', () => {
      const corsConfig = configureCors();

      const callback = jest.fn();
      corsConfig.origin(undefined, callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject unknown origins', () => {
      process.env.NODE_ENV = constants.PROD_ENV;
      const corsConfig = configureCors();

      const callback = jest.fn();
      corsConfig.origin('https://malicious-site.com', callback);

      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should include correct HTTP methods', () => {
      const corsConfig = configureCors();

      expect(corsConfig.methods).toContain('GET');
      expect(corsConfig.methods).toContain('POST');
      expect(corsConfig.methods).toContain('PUT');
      expect(corsConfig.methods).toContain('DELETE');
      expect(corsConfig.methods).toContain('OPTIONS');
    });

    it('should enable credentials', () => {
      const corsConfig = configureCors();

      expect(corsConfig.credentials).toBe(true);
    });
  });
});
