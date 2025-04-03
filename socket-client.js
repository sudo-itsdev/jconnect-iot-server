const WebSocket = require('ws');

// Configuration for server URLs
const config = {
  local: 'ws://localhost:3001', // Local WebSocket server
  cloud: 'wss://jconnect-iot-server-fjomp.ondigitalocean.app', // Cloud WebSocket server
};

// Toggle between 'local' and 'cloud' for debugging
const environment = process.env.ENV || 'local'; // Default to 'local' if ENV is not set
const serverUrl = config[environment];

// Add the token to the connection URL
const token = 'your-secret-token'; // Replace with the actual token
const ws = new WebSocket(`${serverUrl}?token=${token}`);

const clientId = `client-${Math.random().toString(36).substring(2, 15)}`; // Generate a unique client ID
let timer = 0; // Timer starts at 0 seconds
let intervalId; // Store the interval ID

ws.on('open', () => {
  console.log(`Connected to WebSocket server at ${serverUrl}`);

  // Start a timer that sends the incremented time every second
  intervalId = setInterval(() => {
    const message = JSON.stringify({ id: clientId, seconds: timer });
    ws.send(message);
    console.log(`Sent message: ${message}`);
    timer++; // Increment the timer
  }, 100); // Send every 1 second
});

ws.on('message', (message) => {
  console.log(`Received message from server: ${message}`);
});

ws.on('close', (code, reason) => {
  console.log(`Disconnected from WebSocket server (code: ${code}, reason: ${reason})`);
  clearInterval(intervalId); // Stop sending messages when the connection is closed
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
  clearInterval(intervalId); // Stop sending messages if an error occurs
});