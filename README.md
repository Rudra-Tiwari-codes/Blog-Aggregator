# Blog Aggregator

Production-grade blog aggregation platform for Medium and Blogspot with intelligent caching, semantic search, and enterprise-level security.

**Live:** https://rudra-blog-aggregator.vercel.app/

## Features

- **Multi-Source Aggregation**: Fetches posts from Medium and Blogspot RSS feeds
- **Intelligent Caching**: 30-minute cache with file persistence and in-memory fallback
- **Semantic Search**: AI-powered search with keyword fallback for optimal results
- **Production-Ready**: Comprehensive error handling, logging, and monitoring
- **Security**: Helmet.js, rate limiting, CORS, input validation, and XSS protection
- **Performance**: Optimized for serverless deployment with efficient resource usage
- **Mobile-Responsive**: Modern UI with responsive design

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI/ML**: Google Gemini API for semantic search and content summarization
- **Deployment**: Vercel Serverless Functions
- **Testing**: Jest with comprehensive unit and integration tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## Quick Start

1. **Clone & Install**

   ```bash
   git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
   cd Blog-Aggregator
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:

   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   MEDIUM_USERNAME=your_medium_username  # Optional, defaults to 'rudratech'
   NODE_ENV=development
   PORT=3000  # Optional, defaults to 3000
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

   Access at `http://localhost:3000`

4. **Run Tests**

   ```bash
   npm test              # Run all tests with coverage
   npm run test:unit     # Run unit tests only
   npm run test:watch    # Run tests in watch mode
   ```

5. **Lint and Format**
   ```bash
   npm run lint          # Check for linting errors
   npm run lint:fix       # Auto-fix linting errors
   npm run format        # Format code with Prettier
   ```

## API Endpoints

### `GET /api/posts`

Fetches all aggregated blog posts from configured sources.

**Query Parameters:**

- `refresh` (boolean, optional): Force refresh cache (default: `false`)

**Response:**

```json
{
  "success": true,
  "posts": [...],
  "count": 10,
  "cached": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /api/search`

Performs semantic search across all blog posts.

**Request Body:**

```json
{
  "query": "JavaScript async programming"
}
```

**Response:**

```json
{
  "success": true,
  "results": [...],
  "count": 5,
  "query": "JavaScript async programming",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /health`

Health check endpoint for monitoring and load balancers.

**Response:**

```json
{
  "status": "OK",
  "uptime": 12345.67,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Architecture

- **Serverless Functions**: API endpoints deployed as Vercel serverless functions
- **Caching Strategy**: Multi-layer caching (in-memory + file system) with 30-minute TTL
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Security**: Rate limiting, input validation, CORS, and security headers
- **Logging**: Structured logging with Winston for production monitoring

## Development

### Project Structure

```
├── api/              # Vercel serverless functions
├── backend/          # Core business logic
├── frontend/         # Static frontend files
├── middleware/       # Express middleware
├── tests/            # Test suites
├── utils/            # Utility functions
└── server.js         # Local development server
```

### Code Quality Standards

- ESLint with strict rules
- Prettier for code formatting
- Pre-commit hooks with Husky
- Comprehensive test coverage (target: 80%+)
- TypeScript-ready structure

## Deployment

The project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `MEDIUM_USERNAME` (optional)
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - See LICENSE file.

## Author

**Rudra Tiwari**

- GitHub: [@Rudra-Tiwari-codes](https://github.com/Rudra-Tiwari-codes)
- Medium: [@rudratech](https://medium.com/@rudratech)
- Blog: [rudra-tiwari-blogs.blogspot.com](https://rudra-tiwari-blogs.blogspot.com/)
