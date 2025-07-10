import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorProfilePicture?: string;
  type: 'note' | 'job' | 'thread';
  title: string;
  content: string;
  tags?: string[];
  documentUrl?: string;
  documentName?: string;
  jobLink?: string;
  company?: string;
  location?: string;
  replies?: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorProfilePicture?: string;
  content: string;
  createdAt: Date;
}

interface PostContextType {
  posts: Post[];
  filteredPosts: Post[];
  createPost: (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addReply: (postId: string, replyData: Omit<Reply, 'id' | 'createdAt'>) => Promise<void>;
  filterPosts: (query: string, category?: string) => void;
  isLoading: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const usePost = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await apiService.getPosts();
      const formattedPosts = postsData.map((post: any) => ({
        id: post.id,
        authorId: post.author_id,
        authorName: post.author_name,
        authorUsername: post.author_username,
        authorProfilePicture: post.author_profile_picture,
        type: post.type,
        title: post.title,
        content: post.content,
        tags: post.tags,
        documentUrl: post.document_url,
        documentName: post.document_name,
        jobLink: post.job_link,
        company: post.company,
        location: post.location,
        replies: post.replies?.map((reply: any) => ({
          id: reply.id,
          authorId: reply.author_id,
          authorName: reply.author_name,
          authorUsername: reply.author_username,
          authorProfilePicture: reply.author_profile_picture,
          content: reply.content,
          createdAt: new Date(reply.created_at)
        })) || [],
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at)
      }));
      
      setPosts(formattedPosts);
      setFilteredPosts(formattedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newPostData = await apiService.createPost({
        type: postData.type,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        company: postData.company,
        location: postData.location,
        job_link: postData.jobLink,
        document_name: postData.documentName,
        document_url: postData.documentUrl
      });
      
      const newPost: Post = {
        id: newPostData.id,
        authorId: newPostData.author_id,
        authorName: newPostData.author_name,
        authorUsername: newPostData.author_username,
        authorProfilePicture: newPostData.author_profile_picture,
        type: newPostData.type,
        title: newPostData.title,
        content: newPostData.content,
        tags: newPostData.tags,
        documentUrl: newPostData.document_url,
        documentName: newPostData.document_name,
        jobLink: newPostData.job_link,
        company: newPostData.company,
        location: newPostData.location,
        replies: [],
        createdAt: new Date(newPostData.created_at),
        updatedAt: new Date(newPostData.updated_at)
      };
      
      setPosts(prev => [newPost, ...prev]);
      setFilteredPosts(prev => [newPost, ...prev]);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addReply = async (postId: string, replyData: Omit<Reply, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const newReplyData = await apiService.addReply(postId, replyData.content);
      
      const newReply: Reply = {
        id: newReplyData.id,
        authorId: newReplyData.author_id,
        authorName: newReplyData.author_name,
        authorUsername: newReplyData.author_username,
        authorProfilePicture: newReplyData.author_profile_picture,
        content: newReplyData.content,
        createdAt: new Date(newReplyData.created_at)
      };
      
      const updatePost = (post: Post) => 
        post.id === postId 
          ? { 
              ...post, 
              replies: [...(post.replies || []), newReply],
              updatedAt: new Date()
            }
          : post;
      
      setPosts(prev => prev.map(updatePost));
      setFilteredPosts(prev => prev.map(updatePost));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = async (query: string, category?: string) => {
    // If no search query and category is 'all', reset to original posts
    if (!query.trim() && (!category || category === 'all')) {
      setFilteredPosts(posts);
      return;
    }
    
    // If we have search/filter criteria, fetch from API
    if (query.trim() || (category && category !== 'all')) {
      try {
        setIsLoading(true);
        const filteredData = await apiService.getPosts({ search: query, category });
        const formattedPosts = filteredData.map((post: any) => ({
          id: post.id,
          authorId: post.author_id,
          authorName: post.author_name,
          authorUsername: post.author_username,
          authorProfilePicture: post.author_profile_picture,
          type: post.type,
          title: post.title,
          content: post.content,
          tags: post.tags,
          documentUrl: post.document_url,
          documentName: post.document_name,
          jobLink: post.job_link,
          company: post.company,
          location: post.location,
          replies: post.replies?.map((reply: any) => ({
            id: reply.id,
            authorId: reply.author_id,
            authorName: reply.author_name,
            authorUsername: reply.author_username,
            authorProfilePicture: reply.author_profile_picture,
            content: reply.content,
            createdAt: new Date(reply.created_at)
          })) || [],
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at)
        }));
        
        setFilteredPosts(formattedPosts);
      } catch (error) {
        console.error('Failed to filter posts:', error);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // Local filtering when no search/filter criteria
    let filtered = posts;
    if (category && category !== 'all') {
      filtered = filtered.filter(post => post.type === category);
    }
    
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.authorName.toLowerCase().includes(searchTerm) ||
        post.authorUsername.toLowerCase().includes(searchTerm) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    setFilteredPosts(filtered);
  };

  const value = {
    posts,
    filteredPosts,
    createPost,
    addReply,
    filterPosts,
    isLoading
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};