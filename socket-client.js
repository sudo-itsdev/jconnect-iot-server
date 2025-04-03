const WebSocket = require('ws');

// Replace with your WebSocket server URL
const serverUrl = 'ws://localhost:3001';

const clientId = 'client1'; // Unique ID for this client
const ws = new WebSocket(serverUrl);

ws.on('open', () => {
  console.log('Connected to WebSocket server');

  // Send a unique ID and status update to the server
  const message = JSON.stringify({ id: clientId, status: 'online' });
  ws.send(message);
  console.log(`Sent message: ${message}`);
});

ws.on('message', (message) => {
  console.log(`Received message from server: ${message}`);
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
});