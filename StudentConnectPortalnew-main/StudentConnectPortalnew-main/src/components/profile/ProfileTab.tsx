import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePost } from '../../contexts/PostContext';
import { apiService } from '../../services/api';
import { Edit2, Mail, Calendar, MapPin, Link, Camera, FileText, Building, MessageCircle, Clock } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { posts } = usePost();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userStats, setUserStats] = useState({
    posts_count: 0,
    notes_count: 0,
    jobs_count: 0,
    threads_count: 0
  });

  useEffect(() => {
    if (user && posts) {
      // Calculate user statistics from posts
      const userPosts = posts.filter(post => post.authorId === user.id);
      const notes_count = userPosts.filter(post => post.type === 'note').length;
      const jobs_count = userPosts.filter(post => post.type === 'job').length;
      const threads_count = userPosts.filter(post => post.type === 'thread').length;
      
      setUserStats({
        posts_count: userPosts.length,
        notes_count,
        jobs_count,
        threads_count
      });
    }
  }, [user, posts]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <button className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg mt-2 sm:mt-0"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {user.bio || 'No bio added yet. Click "Edit Profile" to add your bio.'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Not available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">Not specified</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Link className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-medium text-gray-900">Not specified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Activity Overview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{userStats.posts_count}</p>
                  <p className="text-sm text-blue-800">Posts Created</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-green-800">Comments</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-2xl font-bold text-purple-600">{userStats.notes_count}</p>
                  <p className="text-sm text-purple-800">Notes Shared</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-2xl font-bold text-orange-600">{userStats.jobs_count}</p>
                  <p className="text-sm text-orange-800">Jobs Posted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
            <div className="space-y-3">
              {posts && posts
                .filter(post => post.authorId === user.id)
                .slice(0, 3)
                .map((post) => {
                  const getPostIcon = () => {
                    switch (post.type) {
                      case 'note':
                        return <FileText className="h-4 w-4 text-blue-600" />;
                      case 'job':
                        return <Building className="h-4 w-4 text-green-600" />;
                      case 'thread':
                        return <MessageCircle className="h-4 w-4 text-purple-600" />;
                      default:
                        return <FileText className="h-4 w-4 text-gray-600" />;
                    }
                  };

                  const getTypeLabel = () => {
                    switch (post.type) {
                      case 'note': return 'Note';
                      case 'job': return 'Job';
                      case 'thread': return 'Thread';
                      default: return 'Post';
                    }
                  };

                  const formatDate = (date: Date) => {
                    const now = new Date();
                    const diff = now.getTime() - date.getTime();
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const days = Math.floor(hours / 24);
                    
                    if (days > 0) {
                      return `${days} day${days > 1 ? 's' : ''} ago`;
                    } else if (hours > 0) {
                      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    } else {
                      return 'Just now';
                    }
                  };

                  return (
                    <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="bg-white p-2 rounded-lg border">
                        {getPostIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {getTypeLabel()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(post.createdAt)}</span>
                          {post.replies && post.replies.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{post.replies.length} replies</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {(!posts || posts.filter(post => post.authorId === user.id).length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No posts yet. Start sharing your content!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};

export default ProfileTab;