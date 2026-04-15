// SocketContext.js - Global socket state
import React, { createContext, useEffect, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Online/Offline events
    newSocket.on('user_online', (data) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.id === data.userId);
        if (!exists) {
          return [...prev, { id: data.userId, isOnline: true }];
        }
        return prev.map((u) =>
          u.id === data.userId ? { ...u, isOnline: true } : u
        );
      });
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId
            ? { ...u, isOnline: false, lastSeen: data.lastSeen }
            : u
        )
      );
    });

    // Typing indicator
    newSocket.on('user_typing', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.senderId]: true,
        }));
      } else {
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          delete newTyping[data.senderId];
          return newTyping;
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  // Send message
  const sendMessage = useCallback(
    (receiverId, message, media = null) => {
      if (!socket || !socket.connected) {
        console.error('Socket is not connected');
        return;
      }

      socket.emit('send_message', {
        receiverId,
        message,
        media,
      });
    },
    [socket]
  );

  // Mark message as seen
  const markMessageAsSeen = useCallback(
    (messageId, receiverId) => {
      if (!socket || !socket.connected) return;
      socket.emit('message_seen', {
        messageId,
        receiverId,
      });
    },
    [socket]
  );

  // Emit typing event
  const emitTyping = useCallback(
    (receiverId) => {
      if (!socket || !socket.connected) return;
      socket.emit('typing', { receiverId });
    },
    [socket]
  );

  // Emit stop typing event
  const emitStopTyping = useCallback(
    (receiverId) => {
      if (!socket || !socket.connected) return;
      socket.emit('stop_typing', { receiverId });
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        sendMessage,
        markMessageAsSeen,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
