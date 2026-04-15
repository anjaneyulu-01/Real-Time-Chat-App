// Message Routes
import express from 'express';
import {
  getMessages,
  sendMessage,
  deleteMessage,
  markMessageAsSeen,
  markMessagesAsDelivered,
  getLastMessage,
  searchMessages,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/:receiverId', getMessages);
router.post('/send', sendMessage);
router.put('/:messageId/delete', deleteMessage);
router.put('/:messageId/seen', markMessageAsSeen);
router.put('/delivered/:receiverId', markMessagesAsDelivered);
router.get('/last/:receiverId', getLastMessage);
router.get('/search/:query', searchMessages);

export default router;
