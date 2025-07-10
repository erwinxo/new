import React, { useState } from 'react';
import { usePost } from '../../contexts/PostContext';
import { useAuth } from '../../contexts/AuthContext';
import { X, FileText, Briefcase, MessageCircle, Upload, Link, Tag, Plus } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/api';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  const { createPost, isLoading } = usePost();
  const [postType, setPostType] = useState<'note' | 'job' | 'thread'>('note');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    company: '',
    location: '',
    jobLink: '',
    documentName: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await apiService.uploadDocument(file);
      setFormData(prev => ({
        ...prev,
        documentName: result.name,
        documentUrl: result.url
      }));
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const postData = {
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        authorProfilePicture: user.profilePicture,
        type: postType,
        title: formData.title,
        content: formData.content,
        ...(postType === 'note' && {
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          documentName: formData.documentName || undefined,
          documentUrl: formData.documentUrl || undefined
        }),
        ...(postType === 'job' && {
          company: formData.company,
          location: formData.location,
          jobLink: formData.jobLink
        })
      };

      await createPost(postData);
      onSubmit();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const postTypes = [
    { id: 'note', label: 'Note', icon: FileText, description: 'Share study materials and documents' },
    { id: 'job', label: 'Job', icon: Briefcase, description: 'Post job opportunities and referrals' },
    { id: 'thread', label: 'Thread', icon: MessageCircle, description: 'Start a discussion or ask questions' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id as 'note' | 'job' | 'thread')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      postType === type.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">{type.label}</h3>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your post content..."
            />
          </div>

          {/* Note-specific fields */}
          {postType === 'note' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. computer-science, algorithms, study-guide"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Upload (Optional)
                </label>
                <div className="relative">
                  <input
                    id="documentUpload"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={uploadingFile}
                  />
                  {uploadingFile && (
                    <div className="absolute right-3 top-3">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
                {formData.documentName && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {formData.documentName} uploaded successfully
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX
                </p>
              </div>
            </div>
          )}

          {/* Job-specific fields */}
          {postType === 'job' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Remote, New York, NY"
                />
              </div>

              <div>
                <label htmlFor="jobLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Link
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="jobLink"
                    name="jobLink"
                    type="url"
                    value={formData.jobLink}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://company.com/jobs/position"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <LoadingSpinner /> : <Plus className="h-4 w-4" />}
              Create Post
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;