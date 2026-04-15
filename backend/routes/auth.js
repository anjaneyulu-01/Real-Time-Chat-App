// Auth Routes
import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  searchUsers,
  blockUser,
  unblockUser,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.get('/users', protect, getAllUsers);
router.get('/search', protect, searchUsers);
router.post('/block/:targetId', protect, blockUser);
router.post('/unblock/:targetId', protect, unblockUser);
router.post('/logout', protect, logout);

export default router;
