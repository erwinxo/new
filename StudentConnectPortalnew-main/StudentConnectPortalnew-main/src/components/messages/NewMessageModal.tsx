import React, { useState, useEffect } from 'react';
import { useMessages } from '../../contexts/MessageContext';
import { X, Search, User, Send } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
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

interface NewMessageModalProps {
  onClose: () => void;
  onConversationStart: (conversation: Conversation) => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ 
  onClose, 
  onConversationStart 
}) => {
  const { searchUsers, sendMessage, conversations } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !messageContent.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(selectedUser.id, messageContent.trim());
      
      // Create a conversation object to pass back
      const conversation: Conversation = {
        conversation_id: selectedUser.id, // This will be updated when conversations are reloaded
        participant: {
          id: selectedUser.id,
          name: selectedUser.name,
          username: selectedUser.username,
          profile_picture: selectedUser.profile_picture,
        },
        last_message: {
          id: 'temp',
          content: messageContent.trim(),
          created_at: new Date().toISOString(),
          sender_id: 'current_user', // This will be updated
        },
        unread_count: 0,
      };
      
      onConversationStart(conversation);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedUser(null);
    setMessageContent('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedUser ? 'New Message' : 'New Conversation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedUser ? (
            // Search Users
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No users found</p>
                </div>
              )}
            </div>
          ) : (
            // Send Message
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={handleBackToSearch}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                {selectedUser.profile_picture ? (
                  <img
                    src={selectedUser.profile_picture}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                </div>
              </div>

              <form onSubmit={handleSendMessage}>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isSending}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!messageContent.trim() || isSending}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal; 