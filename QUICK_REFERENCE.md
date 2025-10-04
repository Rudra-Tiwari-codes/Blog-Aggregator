# Quick Reference Guide - Blog Aggregator

## 🚀 Quick Start Commands

### One-Time Setup
```bash
# Clone repository
git clone https://github.com/Rudra-Tiwari-codes/Blog-Aggregator.git
cd Blog-Aggregator

# Run setup script
# On Unix/Linux/Mac:
chmod +x setup.sh
./setup.sh

# On Windows:
setup.bat

# Or install manually:
cd server && npm install
cd ../client && npm install
```

### Configure
```bash
# Backend: Edit server/.env
MONGODB_URI=mongodb://localhost:27017/blog-aggregator
OPENAI_API_KEY=your_api_key_here

# Frontend: Edit client/.env (optional)
VITE_API_URL=http://localhost:5000/api
```

### Run Development Servers
```bash
# Option 1: Run both servers with one command
npm run dev

# Option 2: Run separately
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### Initialize Data
```bash
# Fetch blogs from RSS feeds
curl -X POST http://localhost:5000/api/admin/fetch-blogs

# Generate AI summaries
curl -X POST http://localhost:5000/api/admin/generate-summaries

# Generate embeddings (optional)
curl -X POST http://localhost:5000/api/admin/generate-embeddings
```

### Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
Blog-Aggregator/
├── client/          # React frontend (Port 3000)
├── server/          # Express backend (Port 5000)
├── SETUP.md         # Detailed setup guide
├── DEPLOYMENT.md    # Production deployment
└── README.md        # Project overview
```

## 🔧 Common Commands

### Backend (server/)
```bash
npm run dev          # Development with auto-reload
npm start            # Production mode
```

### Frontend (client/)
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Root Directory
```bash
npm run install:all  # Install all dependencies
npm run dev          # Run both servers
npm run build:client # Build frontend for production
```

## 🌐 API Endpoints

### Public API
```
GET  /api/blogs                  # Get all blogs
GET  /api/blogs/:id              # Get single blog
GET  /api/blogs/:id/related      # Get related blogs
GET  /api/blogs/categories/list  # Get categories
GET  /api/blogs/stats/overview   # Get statistics
```

### Admin API
```
POST /api/admin/fetch-blogs         # Fetch from RSS
POST /api/admin/generate-summaries  # Generate AI summaries
POST /api/admin/generate-embeddings # Generate embeddings
```

### Query Parameters (GET /api/blogs)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `sort` - newest | oldest | title
- `category` - Filter by category
- `source` - medium | blogger
- `search` - Search term

## 🔑 Environment Variables

### Backend (.env in server/)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog-aggregator
OPENAI_API_KEY=sk-...
MEDIUM_USERNAME=rudragod5
BLOGGER_URL=https://rudra-tiwari-blogs.blogspot.com
NODE_ENV=development
```

### Frontend (.env in client/)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### OpenAI API Errors
- Verify API key is correct in server/.env
- Check OpenAI account has credits
- Check API usage limits

### npm Install Errors
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies

### Backend Key Packages
- express - Web framework
- mongoose - MongoDB ODM
- rss-parser - RSS feed parsing
- openai - OpenAI API client
- cors - CORS middleware
- dotenv - Environment variables

### Frontend Key Packages
- react - UI framework
- react-router-dom - Routing
- axios - HTTP client
- tailwindcss - CSS framework
- vite - Build tool

## 🎨 Customization

### Change Colors
Edit `client/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },  // Change primary color
      secondary: { ... } // Change secondary color
    }
  }
}
```

### Add Blog Source
Edit `server/.env`:
```env
MEDIUM_USERNAME=your_username
BLOGGER_URL=https://your-blog.blogspot.com
```

### Modify UI Components
Components are in `client/src/components/`:
- Navbar.jsx
- Footer.jsx
- BlogCard.jsx
- SearchBar.jsx
- FilterBar.jsx
- etc.

## 🚀 Deployment

### Quick Deploy Options

**Frontend (Choose one):**
- Vercel: `cd client && vercel --prod`
- Netlify: `cd client && netlify deploy --prod`

**Backend (Choose one):**
- Railway: `cd server && railway up`
- Render: Connect GitHub and deploy
- Heroku: `cd server && heroku create && git push heroku main`

**Database:**
- MongoDB Atlas: Free tier available
- Connection string: Update MONGODB_URI

See DEPLOYMENT.md for detailed instructions.

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Installation guide
- **DEPLOYMENT.md** - Deployment guide
- **CONTRIBUTING.md** - How to contribute
- **CHANGELOG.md** - Version history
- **PROJECT_SUMMARY.md** - Complete feature list

## 🎯 Key Features

✅ RSS feed aggregation (Medium + Blogger)
✅ AI-powered summaries (OpenAI GPT-3.5)
✅ Smart recommendations (embeddings)
✅ Full-text search
✅ Category & source filtering
✅ Responsive design
✅ Pagination
✅ Related articles

## 🔐 Security Checklist

- [ ] Add .env to .gitignore (already done)
- [ ] Never commit API keys
- [ ] Use environment variables for secrets
- [ ] Enable CORS for production domains
- [ ] Add rate limiting (optional)
- [ ] Use HTTPS in production

## 📊 Monitoring

### Check Application Health
```bash
# Backend health
curl http://localhost:5000/api/health

# Get statistics
curl http://localhost:5000/api/blogs/stats/overview
```

### View Logs
- Backend logs: Check terminal running `npm run dev`
- MongoDB logs: Check MongoDB log files
- Browser logs: Open DevTools console

## 🆘 Getting Help

1. **Check documentation:**
   - SETUP.md for installation issues
   - DEPLOYMENT.md for deployment help
   - CONTRIBUTING.md for development

2. **Common issues:**
   - MongoDB not running
   - Missing API keys
   - Port conflicts
   - Module not found errors

3. **Get support:**
   - Create GitHub issue
   - Check existing issues
   - Review troubleshooting section

## 🔄 Regular Maintenance

### Update Dependencies
```bash
# Backend
cd server
npm update

# Frontend
cd client
npm update
```

### Refresh Blog Data
```bash
# Fetch new blogs
curl -X POST http://localhost:5000/api/admin/fetch-blogs

# Regenerate summaries
curl -X POST http://localhost:5000/api/admin/generate-summaries
```

### Backup Database
```bash
mongodump --uri="mongodb://localhost:27017/blog-aggregator" --out=/backup
```

## 🎓 Learning Resources

- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Node.js:** https://nodejs.org/
- **Express:** https://expressjs.com/
- **MongoDB:** https://www.mongodb.com/
- **OpenAI API:** https://platform.openai.com/docs

## 📞 Support

**Repository:** https://github.com/Rudra-Tiwari-codes/Blog-Aggregator

**Issues:** Create an issue on GitHub

**Documentation:** Check the docs/ folder

---

**Quick Tip:** Bookmark this file for easy reference! 📌
