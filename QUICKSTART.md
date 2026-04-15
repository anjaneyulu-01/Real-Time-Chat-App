# 🚀 QUICK START GUIDE

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js v14+
- MongoDB connection string (provided)

---

## Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Start server (runs on port 5000)
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0...
🚀 Server running on http://localhost:5000
📱 Socket.io running on ws://localhost:5000
```

---

## Frontend Setup

```bash
# 1. Open NEW TERMINAL and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (opens http://localhost:3000)
npm start
```

---

## 🧪 Test Immediately

### Create Test Accounts

**User 1 (Browser Tab 1):**
1. Go to http://localhost:3000/register
2. Name: `Alice`
3. Email: `alice@test.com`
4. Password: `password123`
5. Register → Chat page loads

**User 2 (Browser Tab 2 - Incognito):**
1. Go to http://localhost:3000/register
2. Name: `Bob`
3. Email: `bob@test.com`
4. Password: `password123`
5. Register → Chat page loads

### Send Messages
- Tab 1: Select "Bob" from contacts
- Tab 1: Type message → Click send
- Tab 2: See message appear in real-time! 🎉

---

## ✅ What's Working

✓ User registration & login  
✓ Real-time messaging  
✓ Online/Offline status  
✓ Typing indicators  
✓ Message status (sent/delivered/seen)  
✓ Responsive mobile UI  
✓ JWT authentication  
✓ Message persistence in MongoDB  

---

## 📁 File Structure

```
backend/
  ├── server.js (Main entry)
  ├── config/db.js (MongoDB)
  ├── models/ (User, Message)
  ├── routes/ (Auth, Messages)
  ├── controllers/ (Business logic)
  ├── middleware/ (Auth verification)
  └── socket/ (Real-time events)

frontend/
  ├── src/
  │   ├── pages/ (Login, Register, Chat)
  │   ├── components/ (Sidebar, ChatWindow, etc)
  │   ├── context/ (Auth, Socket state)
  │   ├── services/ (API calls)
  │   └── styles/ (CSS files)
  └── public/
      └── index.html
```

---

## 🔌 Key Socket.io Events

**Send Message:**
```javascript
socket.emit('send_message', {
  receiverId: userId,
  message: 'Hello!',
  media: null
})
```

**Typing:**
```javascript
socket.emit('typing', { receiverId: userId })
socket.emit('stop_typing', { receiverId: userId })
```

**See Messages:**
```javascript
socket.emit('message_seen', {
  messageId: msgId,
  receiverId: senderId
})
```

---

## 🔐 Login Flow

1. User enters email & password
2. Backend verifies password with bcrypt
3. JWT token generated
4. Token stored in localStorage
5. Token sent in every API request header
6. Socket.io connects with token
7. Real-time events enabled

---

## 📊 Database

**MongoDB URI:** `mongodb+srv://a9:123@cluster0.rpejexn.mongodb.net/student-management`

**Collections:**
- `users` - All user accounts
- `messages` - All messages

---

## 🐛 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| Backend won't start | Check .env file exists with MONGODB_URI |
| Frontend can't connect | Verify backend running on :5000 |
| Messages not sending | Check browser console for Socket errors |
| Login fails | Ensure user registered first |
| MongoDB error | Use correct connection string |

---

## 📞 Support

1. Check MongoDB Atlas IP whitelist
2. Verify both terminals running
3. Check browser console for errors
4. Clear cache: `Ctrl+Shift+Delete` (Chrome)

---

**Ready to chat? Let's go! 🎉**
