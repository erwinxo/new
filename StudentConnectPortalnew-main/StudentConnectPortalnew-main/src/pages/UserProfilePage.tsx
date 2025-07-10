import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, MapPin, Link, MessageCircle, UserPlus } from 'lucide-react';
import { apiService } from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  profile_picture?: string;
  created_at: string;
  posts_count: number;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await apiService.getUserProfile(userId);
        setUser(userData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
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

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </button>
                    <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information</h3>
                
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
                      <p className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{user.posts_count}</p>
                    <p className="text-sm text-blue-800">Posts Created</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-green-800">Comments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;