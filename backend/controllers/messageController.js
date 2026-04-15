// Message Controller
import Message from '../models/Message.js';
import User from '../models/User.js';

const canChat = async (senderId, receiverId) => {
  const sender = await User.findById(senderId).select('blockedUsers');
  const receiver = await User.findById(receiverId).select('blockedUsers');

  if (!sender || !receiver) {
    return false;
  }

  const senderBlockedReceiver = sender.blockedUsers.some(
    (id) => id.toString() === receiverId
  );
  const receiverBlockedSender = receiver.blockedUsers.some(
    (id) => id.toString() === senderId
  );

  return !(senderBlockedReceiver || receiverBlockedSender);
};

// @route GET /api/messages/:receiverId
// @desc Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic')
      .sort({ createdAt: 1 });

    const filteredMessages = messages.filter(
      (msg) => !msg.deletedFor.some((id) => id.toString() === senderId)
    );

    res.status(200).json({
      success: true,
      messages: filteredMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route POST /api/messages/send
// @desc Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, media } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverId and message',
      });
    }

    const permitted = await canChat(senderId, receiverId);
    if (!permitted) {
      return res.status(403).json({
        success: false,
        message: 'Message blocked by user or not allowed',
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      media: media || null,
      status: 'sent',
    });

    await newMessage.populate('senderId', 'name email profilePic');
    await newMessage.populate('receiverId', 'name email profilePic');

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route PUT /api/messages/:messageId/delete
// @desc Delete a message for me or for everyone
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.query;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const isSender = message.senderId.toString() === userId;
    const isReceiver = message.receiverId.toString() === userId;
    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this message',
      });
    }

    if (forEveryone === 'true') {
      if (!isSender) {
        return res.status(403).json({
          success: false,
          message: 'Only the sender can delete for everyone',
        });
      }

      message.isDeleted = true;
      message.deletedForEveryone = true;
      message.deletedFor = [message.senderId, message.receiverId];
      message.message = 'This message was deleted';
      await message.save();
    } else {
      if (!message.deletedFor.some((id) => id.toString() === userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route PUT /api/messages/:messageId/seen
// @desc Mark message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        status: 'seen',
        readAt: new Date(),
      },
      { new: true }
    )
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic');

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route PUT /api/messages/delivered/:receiverId
// @desc Mark all messages as delivered for a user
export const markMessagesAsDelivered = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        status: 'sent',
      },
      { status: 'delivered' }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as delivered',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route GET /api/messages/last/:receiverId
// @desc Get last message with a user
export const getLastMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    const lastMessage = await Message.findOne({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic');

    res.status(200).json({
      success: true,
      message: lastMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route GET /api/messages/search/:query
// @desc Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, message: { $regex: query, $options: 'i' } },
        { receiverId: userId, message: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
