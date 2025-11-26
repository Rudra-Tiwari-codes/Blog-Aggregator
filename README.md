# Tech Blog Aggregator

Production-grade blog aggregation platform for Medium and Blogspot.

**Live:** https://blog-aggregator-finale.vercel.app/

## Features
- **Aggregation**: Multi-source RSS (Medium, Blogspot) with intelligent caching.
- **Search**: Full-text search with keyword matching.
- **Performance**: 30-minute caching, file persistence, and mobile-responsive design.
- **Security**: Helmet.js, Rate Limiting, CORS, and HTML sanitization.

## Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Deployment**: Vercel Serverless

## Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
   cd Blog-Aggregator
   npm install
   ```

2. **Configure**
   Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.

3. **Run**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:3000`

## API Endpoints
- `GET /api/posts` - Fetch all blog posts
- `POST /api/search` - Search blog posts (`{ "query": "term" }`)
- `GET /health` - Health check

## License
MIT License - See LICENSE file.

## Author
**Rudra Tiwari**
- GitHub: [@Rudra-Tiwari-codes](https://github.com/Rudra-Tiwari-codes)
- Medium: [@rudratech](https://medium.com/@rudratech)
- Blog: [rudra-tiwari-blogs.blogspot.com](https://rudra-tiwari-blogs.blogspot.com/)
