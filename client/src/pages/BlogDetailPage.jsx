import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogById, getRelatedBlogs } from '../utils/api';
import { formatDate, getInitials, getAvatarColor, stripHtml } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import BlogCard from '../components/BlogCard';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [blogResponse, relatedResponse] = await Promise.all([
          getBlogById(id),
          getRelatedBlogs(id, 3)
        ]);

        if (blogResponse.success) {
          setBlog(blogResponse.data);
        }

        if (relatedResponse.success) {
          setRelatedBlogs(relatedResponse.data);
        }
      } catch (err) {
        setError('Failed to load blog details. Please try again later.');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading blog..." />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-20 h-20 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Blog not found'}</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blogs
          </Link>

          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getAvatarColor(blog.author)} rounded-full flex items-center justify-center text-white font-bold`}>
                {getInitials(blog.author)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{blog.author}</p>
                <p className="text-sm text-gray-500">{formatDate(blog.publishDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                blog.source === 'medium'
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}>
                {blog.source === 'medium' ? 'Medium' : 'Blogger'}
              </span>

              <a
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex items-center space-x-2"
              >
                <span>Read Original</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {blog.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* AI Summary */}
        {blog.summary && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-l-4 border-primary-500 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-900 mb-2">
                  AI Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">{blog.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Preview */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {stripHtml(blog.content).substring(0, 1000)}
              {stripHtml(blog.content).length > 1000 && '...'}
            </p>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <a
                href={blog.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg"
              >
                <span>Continue reading on {blog.source === 'medium' ? 'Medium' : 'Blogger'}</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard key={relatedBlog._id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
