require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const app = express();

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_CONFIG_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// JWT Token Generation Function
function generateToken(userId) {
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

// Sample login route (for demonstration)
app.post('/login', (req, res) => {
  // Sample logic to authenticate the user and generate JWT
  const userId = 'sampleUserId';
  const token = generateToken(userId);
  res.json({ token });
});

// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.send(`Hello, user ${req.userId}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
