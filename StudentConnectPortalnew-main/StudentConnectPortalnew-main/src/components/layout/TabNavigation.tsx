import React from 'react';
import { FileText, User } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'posts' | 'profile';
  onTabChange: (tab: 'posts' | 'profile') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-lg border border-gray-200 shadow-sm">
      <button
        onClick={() => onTabChange('posts')}
        className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
          activeTab === 'posts'
            ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <FileText className="h-4 w-4" />
        Posts
      </button>
      
      <button
        onClick={() => onTabChange('profile')}
        className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
          activeTab === 'profile'
            ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <User className="h-4 w-4" />
        Profile
      </button>
    </div>
  );
};

export default TabNavigation;