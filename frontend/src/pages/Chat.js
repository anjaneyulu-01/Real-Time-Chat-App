// pages/Chat.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import userService from '../services/userService';
import messageService from '../services/messageService';
import '../styles/Chat.css';

const Chat = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const loadUsers = async (query = '') => {
    try {
      setLoading(true);
      const response = query.trim()
        ? await userService.searchUsers(query.trim())
        : await userService.getAllUsers();

      if (response.data.success && Array.isArray(response.data.users)) {
        const usersWithLastMessage = await Promise.allSettled(
          response.data.users.map(async (user) => {
            try {
              const messageResponse = await messageService.getLastMessage(user.id);
              return {
                ...user,
                lastMessage: messageResponse.data.success
                  ? messageResponse.data.message
                  : null,
              };
            } catch (error) {
              return { ...user, lastMessage: null };
            }
          })
        );

        const preparedUsers = usersWithLastMessage.map((result) =>
          result.status === 'fulfilled' ? result.value : null
        ).filter(Boolean);

        preparedUsers.sort((a, b) => {
          const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setUsers(preparedUsers);
        setSelectedUser((prev) =>
          prev && preparedUsers.some((u) => u.id === prev.id)
            ? prev
            : preparedUsers[0] || null
        );
        return preparedUsers;
      } else {
        console.error('Invalid response structure:', response.data);
        setUsers([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Use filtered users directly from server search
  // No client-side filtering needed as server search already filters results
  const filteredUsers = Array.isArray(users) ? users : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowMobileChat(true);
  };

  const handleBackToContacts = () => {
    setShowMobileChat(false);
    setSelectedUser(null);
  };

  if (!isAuthenticated || loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className={`sidebar-wrapper ${showMobileChat ? 'hidden-mobile' : ''}`}>
        <Sidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={user}
          onLogout={handleLogout}
        />
      </div>

      <div className={`chat-wrapper ${showMobileChat ? 'visible-mobile' : ''}`}>
        {selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            currentUser={user}
            onBack={handleBackToContacts}
            onUserUpdate={loadUsers}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <h2>👋 Welcome {user?.name || 'User'}</h2>
              <p>Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
