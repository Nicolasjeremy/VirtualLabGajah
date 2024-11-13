require('dotenv').config({ path: './back2.env' });
const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Load and validate environment variables
const { FIREBASE_CONFIG, JWT_SECRET, PORT = 3000 } = process.env;

admin.initializeApp();

// JWT Token Generation
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: 'Token is required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/login', (req, res) => {
  const userId = req.body.userId || 'sampleUserId'; // Replace with real authentication logic
  const token = generateToken(userId);
  res.json({ token });
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello, user ${req.userId}` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
