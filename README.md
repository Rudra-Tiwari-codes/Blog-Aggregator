# Blog Aggregator

Production-grade blog aggregation platform aggregating content from Medium and Blogspot with intelligent caching and semantic search.

**Live:** https://rudra-blog-aggregator.vercel.app/

## Features

- Multi-source RSS aggregation (Medium, Blogspot)
- Intelligent caching with 30-minute TTL and file persistence
- Semantic search with keyword fallback
- Production-ready error handling and logging
- Security: rate limiting, input validation, CORS, XSS protection
- Serverless-optimized architecture

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API for search and summarization
- **Deployment**: Vercel Serverless Functions
- **Testing**: Jest (unit + integration)
- **Quality**: ESLint, Prettier, Husky

## Quick Start

```bash
# Clone and install
git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
cd Blog-Aggregator
npm install

# Configure environment
# Create .env file with:
# GEMINI_API_KEY=your_key_here
# MEDIUM_USERNAME=your_username (optional)

# Run development server
npm run dev
# Access at http://localhost:3000
```

## API Endpoints

- `GET /api/posts?refresh=true` - Fetch all posts (optional refresh)
- `POST /api/search` - Search posts (`{ "query": "term" }`)
- `GET /health` - Health check

## Development

```bash
npm test              # Run tests with coverage
npm run lint          # Check code quality
npm run format        # Format code
```

## Project Structure

```
├── api/              # Serverless functions
├── backend/          # Business logic
├── frontend/         # Static assets
├── middleware/       # Express middleware
├── tests/            # Test suites
└── utils/            # Utilities
```

## Deployment

Deployed on Vercel with automatic CI/CD. Set environment variables:
- `GEMINI_API_KEY` (required)
- `MEDIUM_USERNAME` (optional)

## License

MIT

## Author

**Rudra Tiwari**  
GitHub: [@Rudra-Tiwari-codes](https://github.com/Rudra-Tiwari-codes) | Medium: [@rudratech](https://medium.com/@rudratech)
