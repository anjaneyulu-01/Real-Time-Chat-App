// Auth Controller - Register, Login, Get Current User
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const buildUserPayload = (user, currentUser = null) => {
  const currentId = currentUser?.toString();
  const contacts = user.contacts.map((id) => id.toString());
  const blockedByMe = currentUser
    ? currentUser.blockedUsers.map((id) => id.toString()).includes(user._id.toString())
    : false;
  const blockedMe = currentUser
    ? user.blockedUsers.map((id) => id.toString()).includes(currentId)
    : false;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    statusMessage: user.statusMessage,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    contactStatus: currentUser ? 'contact' : 'none',
    blockedByMe,
    blockedMe,
    contacts,
  };
};

// @route POST /api/auth/register
// @desc Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Use a consistent avatar service for fallback profile pictures
    const defaultProfilePic =
      profilePic ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=075e54&color=ffffff&size=128&rounded=true`;

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      profilePic: defaultProfilePic,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        statusMessage: user.statusMessage,
        contacts: [],
        blockedUsers: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route POST /api/auth/login
// @desc Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (need to explicitly select password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update user as online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: buildUserPayload(user, user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route GET /api/auth/me
// @desc Get current logged in user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: buildUserPayload(user, user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route GET /api/auth/users
// @desc Get all users except current user
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select(
      'contacts blockedUsers'
    );
    const users = await User.find({ _id: { $ne: req.user.id } });

    res.status(200).json({
      success: true,
      users: users.map((user) => buildUserPayload(user, currentUser._id)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route GET /api/auth/search
// @desc Search users by name or email
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const currentUser = await User.findById(req.user.id).select(
      'contacts blockedUsers'
    );

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      users: users.map((user) => buildUserPayload(user, currentUser._id)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route POST /api/auth/block/:targetId
// @desc Block another user
export const blockUser = async (req, res) => {
  try {
    const { targetId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User to block not found',
      });
    }

    if (currentUser.blockedUsers.some((id) => id.toString() === targetId)) {
      return res.status(400).json({
        success: false,
        message: 'User already blocked',
      });
    }

    currentUser.blockedUsers.push(targetId);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route POST /api/auth/unblock/:targetId
// @desc Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { targetId } = req.params;
    const currentUser = await User.findById(req.user.id);

    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (id) => id.toString() !== targetId
    );
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route POST /api/auth/logout
// @desc Logout user
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isOnline = false;
    user.lastSeen = new Date();
    user.socketId = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
