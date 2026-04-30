// components/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../context/SocketContext';
import messageService from '../services/messageService';
import userService from '../services/userService';
import MessageBubble from './MessageBubble';
import '../styles/ChatWindow.css';

const getIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id?.toString() || value.id?.toString() || '';
};

const ChatWindow = ({ selectedUser, currentUser, onBack, onUserUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const {
    socket,
    sendMessage,
    markMessageAsSeen,
    emitTyping,
    emitStopTyping,
    typingUsers,
    onlineUsers,
  } = useSocket();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch messages on component mount or when selected user changes
  useEffect(() => {
    let isCurrent = true;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messageService.getMessages(selectedUser.id);
        
        if (!isCurrent || !isMountedRef.current) return;
        
        if (response.data.success) {
          setMessages(response.data.messages);

          const currentUserId = getIdString(currentUser.id);

          // Mark unread messages as delivered
          response.data.messages.forEach((msg) => {
            if (
              getIdString(msg.receiverId) === currentUserId &&
              msg.status !== 'seen'
            ) {
              markMessageAsSeen(msg._id, getIdString(msg.senderId));
            }
          });
          
          // Refresh user list to update unread badge after marking as seen
          if (onUserUpdate) {
            setTimeout(() => {
              if (isCurrent && isMountedRef.current) {
                onUserUpdate();
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        if (isCurrent && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isCurrent = false;
    };
  }, [selectedUser.id, currentUser.id]);

  // Listen for incoming messages via Socket.io
  useEffect(() => {
    if (!socket) return;

    // Listen for messages I receive from others
    socket.on('receive_message', (message) => {
      const senderId = getIdString(message.senderId);
      const receiverId = getIdString(message.receiverId);
      const currentUserId = getIdString(currentUser.id);
      const selectedUserId = getIdString(selectedUser.id);

      if (
        (senderId === selectedUserId && receiverId === currentUserId) ||
        (senderId === currentUserId && receiverId === selectedUserId)
      ) {
        setMessages((prev) => [...prev, message]);

        // Auto-mark as seen if from selected user
        if (receiverId === currentUserId) {
          markMessageAsSeen(message._id, senderId);
        }
      }
    });

    // Listen for messages I sent (confirmation from server)
    socket.on('message_sent', (data) => {
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    socket.on('message_seen_notification', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: 'seen' } : msg
        )
      );
      // Refresh user list to update unread badge
      if (onUserUpdate) {
        onUserUpdate();
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('message_seen_notification');
    };
  }, [socket, selectedUser.id, currentUser.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Emit typing event
    emitTyping(selectedUser.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to emit stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedUser.id);
    }, 1000);
  };

  const isBlocked = selectedUser.blockedByMe || selectedUser.blockedMe;

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (isBlocked || !newMessage.trim()) return;

    // Send message via Socket.io
    sendMessage(selectedUser.id, newMessage.trim());
    setNewMessage('');
    emitStopTyping(selectedUser.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleBlockUser = async () => {
    try {
      await userService.blockUser(selectedUser.id);
      onUserUpdate();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async () => {
    try {
      await userService.unblockUser(selectedUser.id);
      onUserUpdate();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmation = window.confirm(
      'Click OK to delete for everyone, or Cancel to delete only for you.'
    );
    try {
      const response = await messageService.deleteMessage(
        messageId,
        confirmation
      );
      if (response.data.success) {
        if (confirmation) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? response.data.message : msg
            )
          );
        } else {
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const isUserOnline = onlineUsers.some(
    (u) => u.id === selectedUser.id && u.isOnline
  );
  const isUserTyping = typingUsers[selectedUser.id];
  const selectedUserAvatar =
    selectedUser.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      selectedUser.name
    )}&background=075e54&color=ffffff&size=128&rounded=true`;

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-btn mobile-only" onClick={onBack}>
          <FiArrowLeft />
        </button>

        <div className="chat-user-info">
          <img
            src={selectedUserAvatar}
            alt={selectedUser.name}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                selectedUser.name
              )}&background=075e54&color=ffffff&size=128&rounded=true`;
            }}
          />
          <div className="user-info">
            <h2>{selectedUser.name}</h2>
            <p className="user-status">
              {selectedUser.statusMessage
                ? selectedUser.statusMessage
                : isUserOnline
                ? '🟢 Online'
                : selectedUser.lastSeen
                ? `Last seen ${formatDistanceToNow(new Date(selectedUser.lastSeen), {
                    addSuffix: true,
                  })}`
                : 'Offline'}
            </p>
          </div>
        </div>

        <div className="chat-actions">
          {selectedUser.blockedByMe ? (
            <button className="block-btn unblock" onClick={handleUnblockUser}>
              Unblock
            </button>
          ) : (
            <button className="block-btn" onClick={handleBlockUser}>
              Block
            </button>
          )}
        </div>
      </div>

      {isBlocked && (
        <div className="chat-blocked-banner">
          {selectedUser.blockedMe
            ? 'You have been blocked by this user. You cannot send messages.'
            : 'You have blocked this user. Unblock to continue chatting.'}
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-state">
              <span className="avatar">{selectedUser.name.charAt(0)}</span>
              <h3>No messages yet</h3>
              <p>Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const messageSenderId = getIdString(msg.senderId);
            const isOwn = messageSenderId === getIdString(currentUser.id);

            return (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                isOwnMessage={isOwn}
                senderName={isOwn ? currentUser.name : selectedUser.name}
                onDelete={isOwn ? handleDeleteMessage : undefined}
              />
            );
          })
        )}

        {isUserTyping && (
          <div className="typing-indicator">
            <p>✏️ {selectedUser.name} is typing...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-wrapper">
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            className="message-input"
            disabled={isBlocked}
          />
          <button type="submit" className="send-btn" disabled={isBlocked || !newMessage.trim()}>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
