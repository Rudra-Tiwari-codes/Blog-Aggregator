# Tech Blog Aggregator

Production-grade blog aggregation platform that collects and displays technical articles from Medium and Blogspot with intelligent caching, full-text search, and performance optimizations.

**Live:** https://blog-aggregator-finale.vercel.app/

## Features

- Multi-source RSS aggregation (Medium, Blogspot)
- 30-minute intelligent caching with file persistence
- Keyword-based search with text matching
- HTML sanitization and content cleaning
- Mobile-responsive dark theme
- Rate limiting and security headers
- SEO optimization with OpenGraph and JSON-LD
- WCAG 2.2 accessibility compliance

## Architecture

```
blog-aggregator/
├── api/                  # Serverless endpoints
│   ├── posts.js         # Blog posts with caching
│   └── search.js        # Full-text search
├── backend/             # Business logic
│   ├── postsService.js  # Aggregation service
│   └── utils.js         # RSS parsing utilities
├── frontend/            # Client application
│   ├── index.html      # Main page
│   ├── app.js          # Core logic
│   ├── analytics.js    # Monitoring
│   └── style.css       # Styles
├── data/               # Cache storage
└── server.js           # Express configuration
```

## Technology Stack

**Frontend:** Vanilla JavaScript ES6+, HTML5, CSS3  
**Backend:** Node.js 18+, Express.js  
**Deployment:** Vercel Serverless  
**Security:** Helmet.js, Rate Limiting, CORS  

## Installation


### Prerequisites
- Node.js 18.0.0+
- npm package manager


### Setup

1. Clone repository
```bash
git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
cd Blog-Aggregator
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.example .env
```

Required environment variables:
```env
NODE_ENV=development
PORT=3000
GEMINI_API_KEY=your-api-key
MEDIUM_USERNAME=rudratech
CACHE_FILE=data/posts.json
```

4. Start server
```bash
npm run dev
```

Access at `http://localhost:3000`

## Deployment

### Vercel

1. Install Vercel CLI
```bash
npm i -g vercel
```

2. Deploy
```bash
vercel
```

3. Set environment variables in Vercel Dashboard

Required production variables:
- `GEMINI_API_KEY`
- `NODE_ENV=production`

## API Reference

### GET `/api/posts`
Fetch all blog posts

**Query Parameters:**
- `refresh` (optional): Force cache refresh

**Response:**
```json
{
  "posts": [{
    "title": "Post Title",
    "link": "https://...",
    "published": "2025-11-26T...",
    "summary": "Summary...",
    "source": "Medium"
  }],
  "cached": true,
  "count": 20
}
```

### POST `/api/search`
Search blog posts

**Request:**
```json
{
  "query": "javascript"
}
```

**Response:**
```json
{
  "results": [...],
  "count": 5,
  "query": "javascript"
}
```

### GET `/health`
Health check

**Response:**
```json
{
  "uptime": 12345,
  "status": "OK",
  "mongodb": "connected"
}
```

## Configuration

### Rate Limits
- General: 100 requests/15 minutes
- API: 50 requests/15 minutes
- Search: 10 requests/minute

### Caching
- Duration: 30 minutes in-memory
- Persistence: File-based (`data/posts.json`)
- Manual refresh: `?refresh=true`

## Performance Targets

- Lighthouse Performance: 95+
- First Contentful Paint: <1.8s
- Time to Interactive: <3.8s
- Cumulative Layout Shift: <0.1

## Security

- Helmet.js security headers
- Rate limiting on all endpoints
- CORS configuration
- Input sanitization
- XSS protection
- Content Security Policy

## Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm test -- --coverage    # Coverage report
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details


## Author

**Rudra Tiwari**

- GitHub: [@Rudra-Tiwari-codes](https://github.com/Rudra-Tiwari-codes)
- Medium: [@rudratech](https://medium.com/@rudratech)
- Blog: [rudra-tiwari-blogs.blogspot.com](https://rudra-tiwari-blogs.blogspot.com/)

# Blog-Aggregator
