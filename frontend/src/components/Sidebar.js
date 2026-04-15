// components/Sidebar.js
import React, { useState } from 'react';
import { FiLogOut, FiSearch, FiMoreVertical } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import UserItem from './UserItem';
import '../styles/Sidebar.css';

const getAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=075e54&color=ffffff&size=128&rounded=true`;

const Sidebar = ({
  users,
  selectedUser,
  onSelectUser,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
      setShowMenu(false);
    }
  };

  const userAvatar = currentUser?.profilePic || getAvatarUrl(currentUser?.name || 'User');

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-top">
          <div className="header-title">
            <h1>ChatApp</h1>
            <p>Secure real-time conversations</p>
          </div>
          <div className="header-menu">
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FiMoreVertical />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={handleLogoutClick} className="menu-item logout">
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="header-profile">
          <div className="profile-avatar">
            <img
              src={userAvatar}
              alt={currentUser?.name || 'Profile'}
              onError={(e) => {
                e.target.src = getAvatarUrl(currentUser?.name || 'User');
              }}
            />
          </div>
          <div className="profile-info">
            <h2>{currentUser?.name || 'You'}</h2>
            <p>
              {currentUser?.isOnline
                ? 'Online'
                : currentUser?.lastSeen
                ? `Last seen ${formatDistanceToNow(new Date(currentUser.lastSeen), {
                    addSuffix: true,
                  })}`
                : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Users List */}
      <div className="users-list">
        {users.length > 0 ? (
          users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              currentUser={currentUser}
              isSelected={selectedUser?.id === user.id}
              onSelect={() => onSelectUser(user)}
            />
          ))
        ) : (
          <div className="no-users">
            {searchQuery ? 'No users found' : 'No users available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
