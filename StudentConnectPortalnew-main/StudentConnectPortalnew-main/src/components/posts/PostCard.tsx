import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost, Post } from '../../contexts/PostContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  MessageCircle, 
  Send, 
  Clock, 
  MapPin, 
  Building, 
  Tag,
  Eye
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const { addReply } = usePost();
  const navigate = useNavigate();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) {
      console.log('Reply validation failed:', { user: !!user, content: replyContent.trim() });
      return;
    }

    console.log('Submitting reply:', { postId: post.id, content: replyContent.trim() });
    setIsSubmitting(true);
    try {
      await addReply(post.id, {
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        authorProfilePicture: user.profilePicture,
        content: replyContent.trim()
      });
      setReplyContent('');
      setShowReplyForm(false);
      console.log('Reply submitted successfully');
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (post.documentUrl) {
      const link = document.createElement('a');
      link.href = post.documentUrl;
      link.download = post.documentName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewProfile = () => {
    console.log('Navigating to profile:', post.authorId);
    navigate(`/profile/${post.authorId}`);
  };

  const getPostIcon = () => {
    switch (post.type) {
      case 'note':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'job':
        return <Building className="h-5 w-5 text-green-600" />;
      case 'thread':
        return <MessageCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPostTypeLabel = () => {
    switch (post.type) {
      case 'note':
        return 'Note';
      case 'job':
        return 'Job';
      case 'thread':
        return 'Thread';
      default:
        return 'Post';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewProfile}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
          >
            {post.authorProfilePicture ? (
              <img
                src={post.authorProfilePicture}
                alt={post.authorName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-left">
              <p className="font-medium text-gray-900">{post.authorName}</p>
              <p className="text-sm text-gray-500">@{post.authorUsername}</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
            {getPostIcon()}
            <span className="text-sm font-medium text-gray-700">{getPostTypeLabel()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {formatDate(post.createdAt)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
      </div>

      {/* Post-specific content */}
      {post.type === 'note' && (
        <div className="mb-4">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          {post.documentUrl && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {post.documentName || 'Document'}
                  </span>
                </div>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {post.type === 'job' && (
        <div className="mb-4 space-y-2">
          {post.company && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>{post.company}</span>
            </div>
          )}
          {post.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{post.location}</span>
            </div>
          )}
          {post.jobLink && (
            <div className="mt-3">
              <a
                href={post.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </a>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Reply ({post.replies?.length || 0})
        </button>
        
        <button
          onClick={handleViewProfile}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 text-sm font-medium transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Profile
        </button>
      </div>

      {/* Replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                {reply.authorProfilePicture ? (
                  <img
                    src={reply.authorProfilePicture}
                    alt={reply.authorName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-xs">
                      {reply.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/profile/${reply.authorId}`)}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {reply.authorName}
                </button>
                <span className="text-xs text-gray-500">@{reply.authorUsername}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-4 space-y-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              Reply
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PostCard;