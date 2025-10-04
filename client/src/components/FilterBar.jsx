const FilterBar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  selectedSource, 
  onSourceChange,
  sortBy,
  onSortChange 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Category Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input w-full"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Source Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source
        </label>
        <select
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value)}
          className="input w-full"
        >
          <option value="">All Sources</option>
          <option value="medium">Medium</option>
          <option value="blogger">Blogger</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="input w-full"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
