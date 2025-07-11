import React from 'react';
import { Search, Filter, BookOpen, Briefcase, MessageCircle } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearch,
  selectedCategory,
  onCategoryChange,
}) => {
  const categories = [
    { id: 'all', label: 'All Posts', icon: Filter },
    { id: 'note', label: 'Notes', icon: BookOpen },
    { id: 'job', label: 'Jobs', icon: Briefcase },
    { id: 'thread', label: 'Threads', icon: MessageCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts, tags, or users..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white border-transparent shadow-md'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchAndFilter;