# Contributing to Blog Aggregator

Thank you for considering contributing to Blog Aggregator! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** describing the bug
2. **Steps to reproduce** the issue
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** if applicable
6. **Environment details** (OS, Node version, browser)

Example:
```
Title: Blog cards not displaying on mobile devices

Steps to reproduce:
1. Open the app on a mobile device
2. Navigate to the home page
3. Observe that blog cards are not visible

Expected: Blog cards should display in a responsive grid
Actual: Cards are not visible
Environment: iOS 15, Safari, iPhone 12
```

### Suggesting Enhancements

For feature requests, create an issue with:

1. **Clear description** of the feature
2. **Use case** - why is this feature needed?
3. **Proposed solution** - how should it work?
4. **Alternatives considered**
5. **Additional context**

### Pull Requests

1. **Fork the repository**

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Write clear, commented code
   - Follow existing code style
   - Update documentation if needed

4. **Test your changes:**
   - Test locally
   - Ensure no breaking changes
   - Check both frontend and backend

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add clear description of changes"
   ```
   
   Use clear commit messages:
   - `Add feature for user authentication`
   - `Fix pagination bug on blog list`
   - `Update documentation for deployment`

6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request:**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template

### Pull Request Guidelines

Your PR should:

- Have a clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Pass all checks and tests
- Be focused on a single concern
- Have clean, readable code
- Include comments for complex logic

## Development Setup

1. **Fork and clone:**
   ```bash
   git clone https://github.com/your-username/Blog-Aggregator.git
   cd Blog-Aggregator
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Set up environment:**
   - Copy `.env.example` to `.env` in both directories
   - Add your configuration

4. **Run development servers:**
   ```bash
   # Backend (in server directory)
   npm run dev
   
   # Frontend (in client directory)
   npm run dev
   ```

## Code Style Guidelines

### JavaScript/JSX

- Use ES6+ features
- Use functional components with hooks
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await for asynchronous code

Example:
```javascript
// Good
const fetchBlogData = async (id) => {
  try {
    const response = await getBlogById(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

// Avoid
function a(x) {
  return getBlogById(x).then(r => r.data);
}
```

### React Components

- One component per file
- Use PropTypes or TypeScript for props
- Extract reusable logic into custom hooks
- Keep components focused and small

Example:
```javascript
// Good
const BlogCard = ({ blog }) => {
  const { title, author, summary } = blog;
  
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{author}</p>
      <p>{summary}</p>
    </article>
  );
};

export default BlogCard;
```

### CSS/Tailwind

- Use Tailwind utility classes
- Keep custom CSS minimal
- Use consistent spacing
- Follow mobile-first approach

Example:
```javascript
// Good
<div className="flex flex-col md:flex-row gap-4 p-6">

// Avoid
<div style={{ display: 'flex', padding: '24px' }}>
```

### Backend/API

- Use async/await consistently
- Handle errors properly
- Add input validation
- Use clear route naming
- Add meaningful comments

Example:
```javascript
// Good
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});
```

## Project Structure

When adding new features, follow the existing structure:

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── utils/          # Helper functions and API calls
└── hooks/          # Custom React hooks (if needed)

server/
├── config/         # Configuration files
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
└── middleware/     # Express middleware (if needed)
```

## Testing

Before submitting a PR:

1. **Test locally:**
   - Run the development servers
   - Test all affected features
   - Check on different screen sizes

2. **Check for errors:**
   - Look for console errors
   - Check network requests
   - Verify API responses

3. **Test edge cases:**
   - Empty states
   - Error states
   - Loading states
   - Long content

## Documentation

When adding features:

1. **Update README.md** if needed
2. **Update SETUP.md** for setup changes
3. **Update DEPLOYMENT.md** for deployment changes
4. **Add code comments** for complex logic
5. **Update API documentation** for new endpoints

## Areas for Contribution

Here are some areas where contributions are especially welcome:

### Features
- User authentication and profiles
- Bookmark/favorite functionality
- Comment system
- Social sharing
- Email notifications
- More blog sources
- Advanced search filters
- Dark mode

### Improvements
- Performance optimization
- Better error handling
- Loading states
- Accessibility improvements
- SEO optimization
- Mobile experience
- Test coverage

### Documentation
- Additional examples
- Video tutorials
- API documentation
- Architecture diagrams
- Troubleshooting guides

### Bug Fixes
- UI issues
- API bugs
- Database queries
- Mobile responsiveness
- Cross-browser compatibility

## Getting Help

If you need help:

1. **Check existing documentation:**
   - README.md
   - SETUP.md
   - DEPLOYMENT.md

2. **Search existing issues:**
   - Someone might have had the same question

3. **Create a new issue:**
   - Ask questions
   - Request clarification
   - Discuss ideas

4. **Join discussions:**
   - Comment on issues
   - Participate in PR reviews

## Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to create an issue for any questions about contributing!

Thank you for contributing to Blog Aggregator! 🎉
