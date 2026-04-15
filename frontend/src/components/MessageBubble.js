// components/MessageBubble.js
import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message, isOwnMessage, senderName, onDelete }) => {
  const messageTime = format(new Date(message.createdAt), 'HH:mm');
  const messageDate = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  const getStatusIcon = () => {
    switch (message.status) {
      case 'seen':
        return '✓✓'; // Double checkmark - blue
      case 'delivered':
        return '✓✓'; // Double checkmark - gray
      case 'sent':
        return '✓'; // Single checkmark
      default:
        return '';
    }
  };

  const isDeleted = message.isDeleted;

  return (
    <div className={`message-bubble-wrapper ${isOwnMessage ? 'own' : 'other'}`}>
      <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'} ${isDeleted ? 'deleted' : ''}`}>
        {message.media && !isDeleted && (
          <img src={message.media} alt="Media" className="message-media" />
        )}
        <p className={`message-text ${isDeleted ? 'deleted-text' : ''}`}>
          {isDeleted ? message.message || 'This message was deleted' : message.message}
        </p>
        <div className="message-footer">
          <span className="message-time">{messageTime}</span>
          {isOwnMessage && !isDeleted && (
            <button className="delete-btn" onClick={() => onDelete?.(message._id)}>
              <FiTrash2 />
            </button>
          )}
          {isOwnMessage && !isDeleted && (
            <span
              className={`message-status ${message.status === 'seen' ? 'seen' : ''}`}
            >
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
      <small className="message-date">{messageDate}</small>
    </div>
  );
};

export default MessageBubble;
