import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import Header from '../components/layout/Header';
import TabNavigation from '../components/layout/TabNavigation';
import PostsTab from '../components/posts/PostsTab';
import ProfileTab from '../components/profile/ProfileTab';
import CreatePostModal from '../components/posts/CreatePostModal';

const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'profile'>('posts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const { posts } = usePost();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header onCreatePost={() => setShowCreateModal(true)} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-8">
          {activeTab === 'posts' && <PostsTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default MainPage;