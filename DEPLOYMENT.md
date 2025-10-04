# Deployment Guide

This guide covers deploying the Blog Aggregator to production environments.

## Deployment Options

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to client directory:**
   ```bash
   cd client
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Environment Variables:**
   - Set `VITE_API_URL` to your backend API URL

#### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

4. **Configuration:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variable: `VITE_API_URL`

### Backend Deployment

#### Option 1: Railway (Recommended)

1. **Create a Railway account:** https://railway.app/

2. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

3. **Login:**
   ```bash
   railway login
   ```

4. **Initialize project:**
   ```bash
   cd server
   railway init
   ```

5. **Add MongoDB:**
   - Go to Railway dashboard
   - Add MongoDB plugin
   - Copy the connection string

6. **Set Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=<your-railway-mongodb-uri>
   OPENAI_API_KEY=<your-openai-key>
   MEDIUM_USERNAME=rudragod5
   BLOGGER_URL=https://rudra-tiwari-blogs.blogspot.com
   NODE_ENV=production
   ```

7. **Deploy:**
   ```bash
   railway up
   ```

#### Option 2: Render

1. **Create a Render account:** https://render.com/

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add MongoDB:**
   - Create a new MongoDB database on Render or use MongoDB Atlas

4. **Set Environment Variables in Render Dashboard:**
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-uri>
   OPENAI_API_KEY=<your-openai-key>
   MEDIUM_USERNAME=rudragod5
   BLOGGER_URL=https://rudra-tiwari-blogs.blogspot.com
   NODE_ENV=production
   ```

#### Option 3: Heroku

1. **Install Heroku CLI:** https://devcenter.heroku.com/articles/heroku-cli

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   cd server
   heroku create your-app-name
   ```

4. **Add MongoDB:**
   ```bash
   heroku addons:create mongolab
   ```

5. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set MEDIUM_USERNAME=rudragod5
   heroku config:set BLOGGER_URL=https://rudra-tiwari-blogs.blogspot.com
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

### Database Deployment

#### MongoDB Atlas (Cloud MongoDB)

1. **Create account:** https://www.mongodb.com/cloud/atlas

2. **Create a cluster:**
   - Choose free tier
   - Select a region close to your users

3. **Create database user:**
   - Database Access → Add New Database User
   - Save username and password

4. **Whitelist IP addresses:**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`

5. **Get connection string:**
   - Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update backend `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-aggregator?retryWrites=true&w=majority
   ```

## Production Considerations

### Environment Variables

Make sure all environment variables are set in production:

**Backend:**
- `MONGODB_URI` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key
- `MEDIUM_USERNAME` - Medium username
- `BLOGGER_URL` - Blogger URL
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_URL` - Backend API URL

### CORS Configuration

Update CORS settings in `server/server.js` for production:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Enable HTTPS** (most hosting providers do this automatically)
4. **Set secure headers:**

```javascript
// Add to server.js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Performance Optimization

1. **Enable compression:**

```bash
cd server
npm install compression
```

```javascript
// Add to server.js
import compression from 'compression';
app.use(compression());
```

2. **Add rate limiting:**

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Scheduled Tasks

Set up cron jobs to automatically fetch new blogs:

**Using node-cron:**

```bash
cd server
npm install node-cron
```

```javascript
// Add to server.js
import cron from 'node-cron';
import { fetchAllBlogs } from './services/rssFetcher.js';

// Fetch blogs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled blog fetch...');
  await fetchAllBlogs();
});
```

### Monitoring

1. **Set up logging:**
   - Use services like Loggly, Papertrail, or LogDNA

2. **Error tracking:**
   - Integrate Sentry for error monitoring

3. **Uptime monitoring:**
   - Use UptimeRobot or Pingdom

### Backup Strategy

1. **MongoDB Atlas:** Automatic backups enabled
2. **Manual backups:**
   ```bash
   mongodump --uri="your-mongodb-uri" --out=/backup/path
   ```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./client
        run: npm install
      
      - name: Build
        working-directory: ./client
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: blog-aggregator-api
```

## Post-Deployment

### 1. Test the Application

- Visit your frontend URL
- Check API endpoints
- Test all features

### 2. Initialize Data

```bash
# Fetch blogs
curl -X POST https://your-api-url.com/api/admin/fetch-blogs

# Generate summaries
curl -X POST https://your-api-url.com/api/admin/generate-summaries

# Generate embeddings
curl -X POST https://your-api-url.com/api/admin/generate-embeddings
```

### 3. Monitor Performance

- Check response times
- Monitor API usage
- Watch OpenAI credit consumption

### 4. Set Up Alerts

Configure alerts for:
- Server downtime
- High API usage
- Database issues
- Error rates

## Costs Estimate

**Free Tier:**
- Frontend (Vercel/Netlify): Free
- Backend (Railway): Free tier available
- MongoDB Atlas: Free tier (512MB)
- OpenAI: Pay per use (~$0.002 per summary)

**Estimated Monthly Cost:**
- Small traffic: $0-10
- Medium traffic: $10-50
- High traffic: $50+

## Troubleshooting Deployment

### Build Failures

1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Check environment variables

### Connection Issues

1. Verify MongoDB URI is correct
2. Check firewall/network settings
3. Ensure IP whitelist includes hosting provider IPs

### Performance Issues

1. Enable caching
2. Optimize database queries
3. Use CDN for static assets
4. Consider adding Redis for caching

## Support

For deployment issues:
1. Check hosting provider documentation
2. Review application logs
3. Test locally first
4. Check GitHub issues

## Updates and Maintenance

1. **Regular updates:**
   ```bash
   git pull origin main
   # Redeploy
   ```

2. **Database backups:** Schedule regular backups

3. **Monitor costs:** Check OpenAI usage and hosting bills

4. **Update dependencies:** Keep packages up to date
   ```bash
   npm update
   ```
