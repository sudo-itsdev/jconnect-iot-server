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

// Add the client id to the connection URL
const client_id = process.env.CLIENT_ID || `ITS_CLOCK_0123456789`; // Generate a unique client ID

const ws = new WebSocket(`${serverUrl}?token=${token}&client_id=${client_id}`)

let timer = 0; // Timer starts at 0 seconds
let intervalId; // Store the interval ID

ws.on('open', () => {
  console.log(`Connected to WebSocket server at ${serverUrl}`);

  // Start a timer that sends the incremented time every second
  intervalId = setInterval(() => {
    const message = JSON.stringify({ seconds: timer });
    ws.send(message);
    console.log(`Sent message: ${message}`);
    timer++; // Increment the timer
  }, 1000); // Send every 1 second
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