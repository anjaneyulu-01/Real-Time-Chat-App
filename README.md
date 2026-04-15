# 💬 WhatsApp-Like Real-Time Chat Application

A production-level, full-stack real-time chat application built with **React**, **Node.js/Express**, **MongoDB**, **Socket.io**, and **JWT Authentication**.

## 🎯 Features

### ✅ Authentication
- User registration with email and password
- User login with JWT token
- Password hashing using bcrypt
- Secure routes with authentication middleware
- Persistent login via localStorage

### 💬 Chat Features
- **One-to-one private messaging**
- **Real-time messaging** using Socket.io
- **Last message preview** in contact list
- **Unread message count**
- **Message timestamps** (WhatsApp-style)
- **Auto-scroll** to latest messages
- **Message status**: Sent ✓, Delivered ✓✓, Seen ✓✓ (blue)
- **Typing indicators** - Shows when user is typing

### 👥 Contacts & Sidebar
- Display all users as contacts
- **Search users** by name
- Show **profile picture**, **last message**, and **online/offline status**
- Highlight active chat
- Show **"Last seen"** timestamp for offline users

### 🟢 Online Status
- Real-time **online/offline** status display
- **Last seen** feature
- Automatic status updates via Socket.io

### 🎨 UI/UX
- **WhatsApp-style layout** with left sidebar and right chat window
- **Message bubbles** - Sent messages on right, received on left
- **Responsive design** - Works on mobile, tablet, and desktop
- **Clean modern UI** with smooth animations
- **Dark mode ready** (CSS variables)

### 📱 Responsive Layout
- Mobile-optimized chat interface
- Sidebar collapsible on mobile
- Touch-friendly buttons and inputs

---

## 🏗️ Project Structure

```
Real-Time-Chat-App/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema & methods
│   │   └── Message.js            # Message schema
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   └── messages.js           # Message endpoints
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── messageController.js  # Message logic
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── socket/
│   │   └── socketHandler.js     # Socket.io events
│   ├── server.js                # Main server file
│   ├── .env                     # Environment variables
│   └── package.json             # Dependencies
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js       # Contact list sidebar
│   │   │   ├── UserItem.js      # Individual contact item
│   │   │   ├── ChatWindow.js    # Main chat window
│   │   │   ├── MessageBubble.js # Message display component
│   │   │   └── ProtectedRoute.js# Auth-protected routes
│   │   ├── pages/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   └── Chat.js          # Main chat page
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Auth state management
│   │   │   └── SocketContext.js # Socket.io state management
│   │   ├── services/
│   │   │   ├── api.js           # Axios configuration
│   │   │   ├── messageService.js# Message API calls
│   │   │   └── userService.js   # User API calls
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   ├── Chat.css
│   │   │   ├── Sidebar.css
│   │   │   ├── UserItem.css
│   │   │   ├── ChatWindow.css
│   │   │   └── MessageBubble.css
│   │   ├── App.js               # Main app component
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   ├── .env                     # Environment variables
│   └── package.json             # Dependencies
│
└── README.md                    # This file
```

---

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (MongoDB Atlas account recommended)
- **Git** (optional)

---

## 🚀 Installation & Setup

### Step 1: Clone or Extract the Project

```bash
cd Real-Time-Chat-App
```

### Step 2: Setup Backend

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Configure Environment Variables
The `.env` file is already created with the MongoDB connection string. Verify or update if needed:

```env
PORT=5000
MONGODB_URI=mongodb+srv://a9:123@cluster0.rpejexn.mongodb.net/student-management?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
```

> ⚠️ **Security Note**: Change `JWT_SECRET` to a strong, random string in production!

#### 2.4 Start Backend Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Expected output:
```
✅ MongoDB Connected: cluster0.rpejexn.mongodb.net
🚀 Server running on http://localhost:5000
📱 Socket.io running on ws://localhost:5000
```

---

### Step 3: Setup Frontend

#### 3.1 Open a New Terminal and Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

#### 3.3 Configure Environment Variables
The `.env` file is already set up:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### 3.4 Start Frontend Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🧪 Testing the Application

### 1. Create Test Accounts

**Account 1:**
- Email: `user1@gmail.com`
- Password: `password123`
- Name: Alice

**Account 2:**
- Email: `user2@gmail.com`
- Password: `password123`
- Name: Bob

### 2. Test Workflow

1. **Register User 1**
   - Go to Register page
   - Fill in details for User 1
   - Submit

2. **Login with User 1**
   - Go to Login page
   - Enter credentials
   - View chat interface

3. **Open Second Browser/Tab for User 2**
   - Open another browser or incognito tab
   - Register User 2
   - Login with User 2

4. **Test Chat Features**
   - Select a contact in sidebar
   - Send messages
   - Watch **real-time message delivery**
   - Check **typing indicators**
   - Verify **online/offline status**
   - Test **message status** updates

---

## 🔌 Socket.io Events

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `send_message` | `{receiverId, message, media}` | Send a message |
| `message_seen` | `{messageId, receiverId}` | Mark message as seen |
| `typing` | `{receiverId}` | User is typing |
| `stop_typing` | `{receiverId}` | User stopped typing |
| `user_reconnect` | - | User reconnected |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `receive_message` | `{message object}` | New message received |
| `message_sent` | `{message object}` | Message sent confirmation |
| `message_seen_notification` | `{messageId, receiverId}` | Message marked as seen |
| `user_typing` | `{senderId, isTyping}` | User typing status |
| `user_online` | `{userId, isOnline}` | User came online |
| `user_offline` | `{userId, isOnline, lastSeen}` | User went offline |

---

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/auth/users` | Get all users | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

### Message Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/:receiverId` | Get messages | ✅ |
| POST | `/api/messages/send` | Send message | ✅ |
| PUT | `/api/messages/:messageId/seen` | Mark as seen | ✅ |
| PUT | `/api/messages/delivered/:receiverId` | Mark delivered | ✅ |
| GET | `/api/messages/last/:receiverId` | Get last message | ✅ |
| GET | `/api/messages/search/:query` | Search messages | ✅ |

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  profilePic: String (URL),
  isOnline: Boolean,
  lastSeen: Date,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  message: String,
  media: String (optional, URL),
  status: String (sent/delivered/seen),
  readAt: Date (optional),
  deletedFor: [ObjectId] (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

✅ **Password Hashing**: Bcrypt with 10 salt rounds  
✅ **JWT Authentication**: Secure token-based auth  
✅ **Protected Routes**: Middleware verification  
✅ **CORS Configuration**: Restricted to frontend origin  
✅ **Input Validation**: Server-side validation  
✅ **Socket.io Auth**: Token verification on connection  

---

## 🎨 Styling Features

- **CSS Variables** for theming
- **Responsive Design** - Mobile, tablet, desktop
- **Smooth Animations** - SlideIn, fadeIn effects
- **Dark Mode Ready** - Media query support
- **Modern UI** - Clean, minimalist design
- **WhatsApp-inspired** - Familiar user experience

---

## 🐛 Troubleshooting

### Backend Issues

**Error: MongoDB Connection Failed**
```
Solution: Verify MongoDB URI in .env file
- Check you're using correct connection string from MongoDB Atlas
- Ensure IP whitelist includes your IP
```

**Error: Socket.io Connection Error**
```
Solution: Ensure CORS is configured correctly
- Backend CORS should allow http://localhost:3000
- Check PORT is not already in use
```

### Frontend Issues

**Error: API Calls Failing**
```
Solution: 
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in .env
- Clear browser cache and reload
```

**Error: Messages Not Sending**
```
Solution:
- Check Socket.io connection status in browser console
- Verify JWT token is valid
- Check network tab in DevTools
```

---

## 🚀 Production Deployment

### Backend (Using Heroku/Railway/AWS)

1. **Update Environment Variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret>
   ```

2. **Deploy Steps**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push heroku main
   ```

### Frontend (Using Vercel/Netlify)

1. **Update `.env.production`**
   ```env
   REACT_APP_API_URL=https://your-backend.com/api
   REACT_APP_SOCKET_URL=https://your-backend.com
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy built files to Vercel/Netlify**

---

## 📚 Technology Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **date-fns** - Date formatting
- **React Icons** - Icons
- **CSS** - Styling

---

## 📝 Future Enhancements

- 🎥 Video/Audio calls
- 📁 File sharing with cloud storage
- 👥 Group chats
- 🔍 Advanced search with filters
- 🎨 Customizable themes
- 🔔 Push notifications
- ⭐ Message reactions
- 🔊 Sound notifications
- 👁️ Read receipts UI improvements
- 🌐 Multi-language support

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the code comments
3. Check MongoDB Atlas status
4. Verify all environment variables

---

## ✨ Happy Coding!

Built with ❤️ for real-time communication enthusiasts.

---

## 🎓 Learning Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Socket.io Documentation](https://socket.io/docs)
- [JWT Authentication](https://jwt.io)

---

**Last Updated**: April 2026  
**Version**: 1.0.0
#   R e a l - T i m e - C h a t - A p p  
 