const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();


const app = express();

// Trust proxy for Render (crucial for sessions/cookies over HTTPS)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin requests (no origin header) or matching FRONTEND_URL
    if (!origin || origin === process.env.FRONTEND_URL || origin.includes('onrender.com') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/institute-portal',
    collectionName: 'http_sessions'
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/institute-portal');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const staffRoutes = require('./routes/staff');
const sessionRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/attendance');
const feesRoutes = require('./routes/fees');
const reportRoutes = require('./routes/reports');

// Use Routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});



const PORT = process.env.PORT || 5000;

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});