const http = require('http');
const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { setupWebSocketServer } = require('./websocket-server');
const { setupRestApi } = require('./rest-api');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3001;

// Apply rate limiting to all REST API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', apiLimiter); // Apply to all API routes

// Middleware to validate JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// Protect API routes
app.use('/api', authenticateToken);

// Create an HTTP server to attach both Express and WebSocket
const server = http.createServer(app);

// Create a Map to store clients by unique ID
const clients = new Map();

// Setup REST API
setupRestApi(app, clients);

// Setup WebSocket server
setupWebSocketServer(server, clients);

// Endpoint to validate data
app.post(
  '/api/data',
  body('name').isString().notEmpty(),
  body('age').isInt({ min: 0 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ message: 'Data is valid' });
  }
);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`WebSocket server is also running on port ${port}`);
});
