// Socket.io Event Handlers
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

// Store active connections
const activeConnections = new Map();

export const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Authenticate user with JWT
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      socket.disconnect();
      return;
    }

    const userId = decoded.id;
    activeConnections.set(userId, socket.id);

    // Update user as online
    User.findByIdAndUpdate(userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    }).catch((err) => console.error('Error updating user:', err));

    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId, isOnline: true });

    // ============ MESSAGE EVENTS ============

    // Send message event
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, message, media } = data;

        const sender = await User.findById(userId).select('blockedUsers');
        const receiver = await User.findById(receiverId).select('blockedUsers');

        if (!sender || !receiver) {
          return socket.emit('error', { message: 'Invalid chat participant' });
        }

        const blockedBySender = sender.blockedUsers.some(
          (id) => id.toString() === receiverId
        );
        const blockedByReceiver = receiver.blockedUsers.some(
          (id) => id.toString() === userId
        );

        if (blockedBySender || blockedByReceiver) {
          return socket.emit('error', {
            message: 'Message blocked by user or not allowed',
          });
        }

        // Create and save message
        const newMessage = await Message.create({
          senderId: userId,
          receiverId,
          message,
          media: media || null,
          status: 'delivered',
        });

        await newMessage.populate('senderId', 'name email profilePic');
        await newMessage.populate('receiverId', 'name email profilePic');

        // Send to receiver
        const receiverSocketId = activeConnections.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', newMessage);
        }

        // Send confirmation to sender
        socket.emit('message_sent', {
          success: true,
          message: newMessage,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Mark message as seen
    socket.on('message_seen', async (data) => {
      try {
        const { messageId, receiverId } = data;

        await Message.findByIdAndUpdate(messageId, {
          status: 'seen',
          readAt: new Date(),
        });

        // Notify sender
        const senderSocketId = activeConnections.get(receiverId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_seen_notification', {
            messageId,
            receiverId: userId,
          });
        }
      } catch (error) {
        console.error('Error marking message as seen:', error);
      }
    });

    // ============ TYPING INDICATOR EVENTS ============

    // User typing
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeConnections.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          senderId: userId,
          isTyping: true,
        });
      }
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = activeConnections.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          senderId: userId,
          isTyping: false,
        });
      }
    });

    // ============ DISCONNECT EVENT ============

    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.id}`);

      // Update user as offline
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });

      // Remove from active connections
      activeConnections.delete(userId);

      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });

    // ============ RECONNECT/PING EVENTS ============

    // User reconnect
    socket.on('user_reconnect', async (data) => {
      try {
        const user = await User.findById(userId);
        activeConnections.set(userId, socket.id);

        User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        }).catch((err) => console.error('Error updating user:', err));

        socket.broadcast.emit('user_online', {
          userId,
          isOnline: true,
          user,
        });
      } catch (error) {
        console.error('Error handling reconnect:', error);
      }
    });
  });
};

export const getActiveConnections = () => activeConnections;
