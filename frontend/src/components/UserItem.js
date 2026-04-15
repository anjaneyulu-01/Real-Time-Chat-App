// components/UserItem.js
import React from 'react';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import '../styles/UserItem.css';

const getAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=075e54&color=ffffff&size=128&rounded=true`;

const getIdString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id?.toString() || value.id?.toString() || '';
};

const UserItem = ({
  user,
  currentUser,
  isSelected,
  onSelect,
  onSendRequest,
  onAcceptRequest,
}) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.some((u) => u.id === user.id && u.isOnline);
  const lastMessage = user.lastMessage;
  const blockedByMe = user.blockedByMe;
  const blockedMe = user.blockedMe;

  const messagePreview = lastMessage
    ? lastMessage.message
    : blockedMe
    ? 'You are blocked'
    : blockedByMe
    ? 'You blocked this user'
    : isOnline
    ? 'Online'
    : `Last seen ${formatDistanceToNow(new Date(user.lastSeen), {
        addSuffix: true,
      })}`;

  const senderId = getIdString(lastMessage?.senderId);
  const receiverId = getIdString(lastMessage?.receiverId);
  const currentUserId = getIdString(currentUser?.id);

  const unreadCount =
    lastMessage &&
    receiverId === currentUserId &&
    senderId !== currentUserId &&
    lastMessage.status !== 'seen'
      ? 1
      : 0;

  const avatarUrl = user.profilePic || getAvatarUrl(user.name);

  return (
    <div className={`user-item ${isSelected ? 'active' : ''}`} onClick={onSelect}>
      <div className="user-avatar">
        <img
          src={avatarUrl}
          alt={user.name}
          onError={(e) => {
            e.target.src = getAvatarUrl(user.name);
          }}
        />
        {isOnline && <div className="online-badge"></div>}
      </div>

      <div className="user-info">
        <div className="user-header">
          <h3 className="user-name">{user.name}</h3>
          {lastMessage && (
            <span className="message-time">
              {formatDistanceToNow(new Date(lastMessage.createdAt), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        <p className="last-message">
          {messagePreview.length > 40
            ? `${messagePreview.substring(0, 40)}...`
            : messagePreview}
        </p>
      </div>


      {unreadCount > 0 && <div className="unread-badge">{unreadCount}</div>}
    </div>
  );
};

export default UserItem;
