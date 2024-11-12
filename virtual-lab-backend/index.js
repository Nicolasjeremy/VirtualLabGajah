// index.js

require('dotenv').config({ path: './back2.env' });const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Firebase Admin SDK using FIREBASE_CONFIG from environment
if (!process.env.FIREBASE_CONFIG) {
  console.error('FIREBASE_CONFIG environment variable is missing');
  process.exit(1); // Exit the process if config is missing
}

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
} catch (error) {
  console.error('Failed to parse FIREBASE_CONFIG:', error.message);
  process.exit(1);
}

// JWT Token Generation Function
function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is missing');
    process.exit(1);
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.userId = decoded.userId;
    next();
  });
}

// Login route
app.post('/login', (req, res) => {
  const userId = req.body.userId || 'sampleUserId'; // Replace with real authentication logic
  const token = generateToken(userId);
  res.json({ token });
});

// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello, user ${req.userId}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

