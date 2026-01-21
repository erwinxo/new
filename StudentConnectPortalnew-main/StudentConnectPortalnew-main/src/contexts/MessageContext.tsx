import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  conversation_id: string;
  participant: {
    id: string;
    name: string;
    username: string;
    profile_picture?: string;
  };
  last_message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface User {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
}

interface MessageContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getConversations() as Conversation[];
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getMessagesWithUser(userId) as Message[];
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    try {
      const newMessage = await apiService.sendMessage(recipientId, content) as Message;
      
      // Add the new message to the current messages
      setMessages(prev => [...prev, newMessage]);
      
      // Update the conversation list to reflect the new message
      await loadConversations();
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  }, [loadConversations]);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    if (query.length < 2) return [];
    
    try {
      const data = await apiService.searchUsers(query) as User[];
      return data;
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    searchUsers,
    setCurrentConversation,
    clearError,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}; 