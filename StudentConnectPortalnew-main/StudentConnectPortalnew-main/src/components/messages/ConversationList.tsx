import React from 'react';
import { MessageCircle, User } from 'lucide-react';

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

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onConversationSelect 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
        <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-center">
          Start a conversation by sending a message to another user
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.conversation_id}
          onClick={() => onConversationSelect(conversation)}
          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="relative">
              {conversation.participant.profile_picture ? (
                <img
                  src={conversation.participant.profile_picture}
                  alt={conversation.participant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
              {conversation.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </div>
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {conversation.participant.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatTime(conversation.last_message.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {truncateMessage(conversation.last_message.content)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList; 