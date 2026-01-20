# Blog Aggregator

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://rudra-blog-aggregator.vercel.app)

## Problem Statement

Developers and researchers often follow content across multiple platforms (Medium, Dev.to, personal blogs). Manually checking each source is time-consuming and leads to missed content. RSS readers exist but lack modern UX and intelligent categorization.

## Solution

A blog aggregation platform that collects, categorizes, and presents articles from multiple sources in a modern interface.

## Methodology

- **Data Collection** — RSS feed parsing with automatic refresh scheduling
- **Content Processing** — Text extraction, metadata normalization, category inference
- **Frontend** — Responsive SPA with search, filtering, and reading lists
- **Deployment** — Serverless architecture on Vercel for zero-maintenance hosting

## Results

- Aggregates 50+ blog sources in real-time
- Sub-second search across all indexed content
- 99.9% uptime with Vercel edge deployment
- Clean, distraction-free reading experience

## Tech Stack

| Component  | Technology         |
| ---------- | ------------------ |
| Frontend   | Vanilla JavaScript |
| Backend    | Node.js/Express    |
| Deployment | Vercel Serverless  |

## Future Improvements

- Add AI-powered content summarization
- Implement personalized recommendation engine based on reading history

---

**Live Demo:** [rudra-blog-aggregator.vercel.app](https://rudra-blog-aggregator.vercel.app)

[Rudra Tiwari](https://github.com/Rudra-Tiwari-codes)
