const http = require('http');
const express = require('express');
const { setupWebSocketServer } = require('./websocket-server');
const { setupRestApi } = require('./rest-api');

const app = express();
const port = process.env.PORT || 3001;

// Create an HTTP server to attach both Express and WebSocket
const server = http.createServer(app);

// Create a Map to store clients by unique ID
const clients = new Map();

// Setup REST API
setupRestApi(app, clients);

// Setup WebSocket server
setupWebSocketServer(server, clients);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`WebSocket server is also running on port ${port}`);
});
