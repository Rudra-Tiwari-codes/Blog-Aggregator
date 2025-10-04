const EmptyState = ({ 
  title = 'No blogs found', 
  message = 'Try adjusting your filters or check back later.', 
  icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon || (
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
