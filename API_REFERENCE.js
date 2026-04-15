/**
 * COMPLETE API & SOCKET REFERENCE
 * Real-Time Chat Application
 * ====================================
 */

// ============================================
// 📡 REST API ENDPOINTS
// ============================================

/* 
 * BASE URL (Development): http://localhost:5000/api
 * Header: Authorization: Bearer {token}
 */

// ============ AUTHENTICATION ============

/**
 * POST /auth/register
 * @description Register a new user
 * @access Public
 * @body {
 *   name: string,
 *   email: string,
 *   password: string,
 *   profilePic?: string (optional, base64 or URL)
 * }
 * @returns { success: true, token: string, user: {} }
 */

/**
 * POST /auth/login
 * @description Login user with email and password
 * @access Public
 * @body { email: string, password: string }
 * @returns { success: true, token: string, user: {} }
 */

/**
 * GET /auth/me
 * @description Get current logged-in user
 * @access Protected (requires JWT)
 * @returns { success: true, user: {} }
 */

/**
 * GET /auth/users
 * @description Get all users except current user
 * @access Protected (requires JWT)
 * @returns { success: true, users: [] }
 */

/**
 * POST /auth/logout
 * @description Logout user (marks as offline)
 * @access Protected (requires JWT)
 * @returns { success: true, message: "Logged out successfully" }
 */


// ============ MESSAGES ============

/**
 * GET /messages/:receiverId
 * @description Get all messages between current user and receiverId
 * @access Protected (requires JWT)
 * @param receiverId - ID of the other user
 * @returns { success: true, messages: [] }
 */

/**
 * POST /messages/send
 * @description Send a message
 * @access Protected (requires JWT)
 * @body {
 *   receiverId: string (user ID),
 *   message: string (required),
 *   media?: string (optional, image/file URL)
 * }
 * @returns { success: true, message: {} }
 */

/**
 * PUT /messages/:messageId/seen
 * @description Mark a message as seen
 * @access Protected (requires JWT)
 * @param messageId - ID of the message
 * @returns { success: true, message: {} }
 */

/**
 * PUT /messages/delivered/:receiverId
 * @description Mark all messages as delivered for a user
 * @access Protected (requires JWT)
 * @param receiverId - ID of the user who sent messages
 * @returns { success: true, message: "Messages marked as delivered" }
 */

/**
 * GET /messages/last/:receiverId
 * @description Get the last message with a user
 * @access Protected (requires JWT)
 * @param receiverId - ID of the other user
 * @returns { success: true, message: {} }
 */

/**
 * GET /messages/search/:query
 * @description Search messages by content
 * @access Protected (requires JWT)
 * @param query - Search term
 * @returns { success: true, messages: [] }
 */


// ============================================
// 🔌 SOCKET.IO EVENTS
// ============================================

/* 
 * Connection Setup:
 * const socket = io(URL, {
 *   auth: { token: JWT_TOKEN }
 * })
 */


// ========== CLIENT → SERVER EVENTS ==========

/**
 * EVENT: send_message
 * @description Send a message to another user
 * @data {
 *   receiverId: string,
 *   message: string,
 *   media?: string
 * }
 * 
 * socket.emit('send_message', {
 *   receiverId: '507f1f77bcf86cd799439011',
 *   message: 'Hello! How are you?',
 *   media: null
 * })
 */

/**
 * EVENT: message_seen
 * @description Mark a message as seen by receiver
 * @data {
 *   messageId: string,
 *   receiverId: string
 * }
 * 
 * socket.emit('message_seen', {
 *   messageId: '507f1f77bcf86cd799439012',
 *   receiverId: '507f1f77bcf86cd799439011'
 * })
 */

/**
 * EVENT: typing
 * @description Notify that user is typing
 * @data { receiverId: string }
 * 
 * socket.emit('typing', {
 *   receiverId: '507f1f77bcf86cd799439011'
 * })
 */

/**
 * EVENT: stop_typing
 * @description Notify that user stopped typing
 * @data { receiverId: string }
 * 
 * socket.emit('stop_typing', {
 *   receiverId: '507f1f77bcf86cd799439011'
 * })
 */

/**
 * EVENT: user_reconnect
 * @description Notify that user reconnected
 * 
 * socket.emit('user_reconnect')
 */


// ========== SERVER → CLIENT EVENTS ==========

/**
 * EVENT: receive_message
 * @description Receive a new message
 * @data {
 *   _id: string,
 *   senderId: { _id, name, email, profilePic },
 *   receiverId: string,
 *   message: string,
 *   media?: string,
 *   status: 'sent' | 'delivered' | 'seen',
 *   createdAt: ISO8601,
 *   updatedAt: ISO8601
 * }
 * 
 * socket.on('receive_message', (message) => {
 *   console.log('New message:', message)
 * })
 */

/**
 * EVENT: message_sent
 * @description Confirmation that message was sent
 * @data {
 *   success: true,
 *   message: { ...message object }
 * }
 * 
 * socket.on('message_sent', (data) => {
 *   console.log('Message sent:', data.message)
 * })
 */

/**
 * EVENT: message_seen_notification
 * @description Notification that receiver saw your message
 * @data {
 *   messageId: string,
 *   receiverId: string
 * }
 * 
 * socket.on('message_seen_notification', (data) => {
 *   // Update message status to 'seen'
 * })
 */

/**
 * EVENT: user_typing
 * @description Notification that user is typing/stopped typing
 * @data {
 *   senderId: string,
 *   isTyping: boolean
 * }
 * 
 * socket.on('user_typing', (data) => {
 *   if (data.isTyping) {
 *     console.log('User is typing...')
 *   } else {
 *     console.log('User stopped typing')
 *   }
 * })
 */

/**
 * EVENT: user_online
 * @description Broadcast that a user came online
 * @data {
 *   userId: string,
 *   isOnline: true,
 *   user?: {}
 * }
 * 
 * socket.on('user_online', (data) => {
 *   // Update user status to online
 * })
 */

/**
 * EVENT: user_offline
 * @description Broadcast that a user went offline
 * @data {
 *   userId: string,
 *   isOnline: false,
 *   lastSeen: ISO8601
 * }
 * 
 * socket.on('user_offline', (data) => {
 *   // Update user status to offline with lastSeen
 * })
 */


// ============================================
// 📋 EXAMPLE COMPLETE FLOW
// ============================================

/**
 * 1. USER REGISTRATION
 */
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
// Response: { success: true, token: "eyJhbGc..." }


/**
 * 2. STORE TOKEN IN LOCALSTORAGE
 */
localStorage.setItem('token', response.token)


/**
 * 3. INITIALIZE SOCKET CONNECTION
 */
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
})
socket.on('connect', () => console.log('Connected'))


/**
 * 4. GET ALL USERS
 */
GET /api/auth/users
Headers: Authorization: Bearer {token}
// Response: { success: true, users: [{...}, {...}] }


/**
 * 5. SEND MESSAGE VIA SOCKET
 */
socket.emit('send_message', {
  receiverId: 'bob_user_id',
  message: 'Hello Bob!'
})
socket.on('message_sent', (data) => {
  console.log('Delivered!')
})


/**
 * 6. RECEIVE MESSAGE IN REAL-TIME
 */
socket.on('receive_message', (message) => {
  console.log('Message from Alice:', message.message)
  // Automatically mark as delivered
  socket.emit('message_seen', {
    messageId: message._id,
    receiverId: message.senderId
  })
})


/**
 * 7. TYPING INDICATOR
 */
// User starts typing
socket.emit('typing', { receiverId: 'bob_user_id' })

// After 1 second of no input
socket.emit('stop_typing', { receiverId: 'bob_user_id' })

// Receive on other end
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    // Show "Alice is typing..."
  }
})


// ============================================
// 🔐 JWT TOKEN STRUCTURE
// ============================================

/**
 * Header
 */
{
  "alg": "HS256",
  "typ": "JWT"
}

/**
 * Payload (expires in 7 days)
 */
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1234567890,
  "exp": 1235172690
}

/**
 * Signature
 */
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  'your_super_secret_jwt_key'
)


// ============================================
// 📊 MESSAGE STATUS FLOW
// ============================================

/**
 * Sent ✓
 * └─ Message stored in DB, transmitted to receiver via Socket.io
 * 
 * Delivered ✓✓
 * └─ Receiver's socket received message event
 * └─ Status updated to 'delivered' in DB
 * 
 * Seen ✓✓ (blue)
 * └─ Receiver opened chat with sender
 * └─ emit('message_seen') called
 * └─ Status updated to 'seen' in DB
 * └─ Sender gets 'message_seen_notification' event
 */


// ============================================
// 💾 DATA PERSISTENCE
// ============================================

/**
 * User Collection
 */
{
  "_id": ObjectId,
  "name": "Alice",
  "email": "alice@example.com",
  "password": "$2a$10$...", // bcrypt hashed
  "profilePic": "https://...",
  "isOnline": true,
  "lastSeen": ISODate("2024-04-15T10:30:00Z"),
  "socketId": "socket_id_123",
  "createdAt": ISODate,
  "updatedAt": ISODate
}

/**
 * Message Collection
 */
{
  "_id": ObjectId,
  "senderId": ObjectId,
  "receiverId": ObjectId,
  "message": "Hello!",
  "media": null,
  "status": "seen",
  "readAt": ISODate("2024-04-15T10:32:00Z"),
  "createdAt": ISODate("2024-04-15T10:31:00Z"),
  "updatedAt": ISODate
}
