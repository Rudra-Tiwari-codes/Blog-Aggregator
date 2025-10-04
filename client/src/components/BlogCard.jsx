import { Link } from 'react-router-dom';
import { formatDate, truncateText, getInitials, getAvatarColor } from '../utils/helpers';

const BlogCard = ({ blog }) => {
  const {
    _id,
    title,
    author,
    summary,
    link,
    source,
    publishDate,
    categories,
    imageUrl
  } = blog;

  return (
    <article className="card group animate-fade-in">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
        
        {/* Source Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg ${
            source === 'medium' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}>
            {source === 'medium' ? 'Medium' : 'Blogger'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded"
              >
                {category}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                +{categories.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link to={`/blog/${_id}`}>
          <h3 className="text-xl font-display font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {summary || truncateText(title, 120)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Author */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${getAvatarColor(author)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
              {getInitials(author)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{author}</span>
              <span className="text-xs text-gray-500">{formatDate(publishDate)}</span>
            </div>
          </div>

          {/* Read More Link */}
          <Link
            to={`/blog/${_id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 group/link"
          >
            <span>Read</span>
            <svg
              className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
