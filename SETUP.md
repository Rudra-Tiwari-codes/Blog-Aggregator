# Blog Aggregator - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
cd Blog-Aggregator
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog-aggregator
OPENAI_API_KEY=your_openai_api_key_here
MEDIUM_USERNAME=rudragod5
BLOGGER_URL=https://rudra-tiwari-blogs.blogspot.com
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

#### Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Compass to start MongoDB visually.

#### Run the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure Environment Variables (Optional)

Create a `.env` file in the `client` directory if you need to change the API URL:

```bash
cp .env.example .env
```

The default configuration should work for local development.

#### Run the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Initial Data Setup

After both servers are running, you need to fetch blog data:

### 1. Fetch Blogs from RSS Feeds

Open your browser or use a tool like Postman to send a POST request:

```
POST http://localhost:5000/api/admin/fetch-blogs
```

Or use curl:

```bash
curl -X POST http://localhost:5000/api/admin/fetch-blogs
```

This will fetch blogs from Medium and Blogger and store them in the database.

### 2. Generate AI Summaries

After fetching blogs, generate AI summaries:

```
POST http://localhost:5000/api/admin/generate-summaries
```

Or use curl:

```bash
curl -X POST http://localhost:5000/api/admin/generate-summaries
```

**Note:** This will use your OpenAI API credits. It processes 10 blogs at a time to avoid rate limits.

### 3. Generate Embeddings (Optional)

For better related article recommendations:

```
POST http://localhost:5000/api/admin/generate-embeddings
```

Or use curl:

```bash
curl -X POST http://localhost:5000/api/admin/generate-embeddings
```

## Accessing the Application

Once both servers are running and data is loaded:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Project Structure

```
Blog-Aggregator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Helper functions and API calls
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Public Endpoints

- `GET /api/blogs` - Get all blogs (with filters, search, pagination)
- `GET /api/blogs/:id` - Get a single blog
- `GET /api/blogs/:id/related` - Get related blogs
- `GET /api/blogs/categories/list` - Get all categories
- `GET /api/blogs/stats/overview` - Get blog statistics

### Admin Endpoints

- `POST /api/admin/fetch-blogs` - Fetch blogs from RSS feeds
- `POST /api/admin/generate-summaries` - Generate AI summaries
- `POST /api/admin/generate-embeddings` - Generate embeddings for recommendations

## Features

### Frontend Features

- ✅ Responsive design with Tailwind CSS
- ✅ Blog card grid with images
- ✅ Search functionality
- ✅ Filter by category and source
- ✅ Sort by date and title
- ✅ Pagination
- ✅ Blog detail page
- ✅ Related articles section
- ✅ Smooth animations and transitions

### Backend Features

- ✅ RSS feed fetching from Medium and Blogger
- ✅ MongoDB database storage
- ✅ OpenAI integration for summaries
- ✅ AI embeddings for semantic search
- ✅ Related blog recommendations
- ✅ RESTful API
- ✅ CORS enabled

## Troubleshooting

### MongoDB Connection Issues

If you get a MongoDB connection error:

1. Make sure MongoDB is running
2. Check the `MONGODB_URI` in your `.env` file
3. Try using `127.0.0.1` instead of `localhost`

### OpenAI API Errors

If AI features aren't working:

1. Verify your OpenAI API key is correct
2. Check your API usage limits and billing
3. Make sure you have credits available

### Port Already in Use

If you get a "port already in use" error:

**Backend (port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

## Development Tips

### Running in Development Mode

Both the frontend and backend support hot-reload in development mode:

- **Backend:** Uses `nodemon` - changes auto-reload
- **Frontend:** Uses Vite - instant HMR (Hot Module Replacement)

### Database Management

View your data using MongoDB Compass:

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to the `blog-aggregator` database

### Adding More Blog Sources

To add more blog sources, edit `server/.env`:

```env
MEDIUM_USERNAME=your_medium_username
BLOGGER_URL=https://your-blog.blogspot.com
```

Then run the fetch-blogs endpoint again.

## Next Steps

1. **Customize the design:** Edit Tailwind classes in components
2. **Add more features:** User authentication, favorites, comments
3. **Deploy:** See DEPLOYMENT.md for deployment instructions
4. **Schedule fetching:** Use cron jobs to automatically fetch new blogs

## Support

If you encounter any issues:

1. Check the console for error messages
2. Review the troubleshooting section above
3. Check GitHub issues
4. Create a new issue with detailed information

## License

MIT License - See LICENSE file for details
