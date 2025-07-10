import React, { useState } from 'react';
import { usePost } from '../../contexts/PostContext';
import SearchAndFilter from './SearchAndFilter';
import PostCard from './PostCard';
import { Search, Filter, SortDesc } from 'lucide-react';

const PostsTab: React.FC = () => {
  const { filteredPosts, filterPosts } = usePost();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await filterPosts(query, selectedCategory);
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    await filterPosts(searchQuery, category);
  };

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-gray-200 shadow-sm">
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearch={handleSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-2">
          <SortDesc className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to create a post!'
              }
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default PostsTab;