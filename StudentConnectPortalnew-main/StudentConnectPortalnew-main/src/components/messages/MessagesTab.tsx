import React, { useState, useEffect } from 'react';
import { useMessages } from '../../contexts/MessageContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Search, Send, ArrowLeft, User } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewMessageModal from './NewMessageModal';

// Add Conversation type
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

const MessagesTab: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    loadConversations, 
    setCurrentConversation,
    isLoading 
  } = useMessages();
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationSelect = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const handleBackToConversations = () => {
    setCurrentConversation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {currentConversation ? (
          <ChatWindow 
            conversation={currentConversation}
            onBack={handleBackToConversations}
          />
        ) : (
          <ConversationList 
            conversations={conversations}
            onConversationSelect={handleConversationSelect}
          />
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <NewMessageModal 
          onClose={() => setShowNewMessage(false)}
          onConversationStart={(conversation) => {
            setCurrentConversation(conversation);
            setShowNewMessage(false);
          }}
        />
      )}
    </div>
  );
};

export default MessagesTab; 