const WebSocket = require('ws');
const { setClientStatus, resetClientStatus } = require('./rest-api');

// Replace this with your actual authentication logic
function isValidToken(token) {
  const validTokens = ['your-secret-token']; // List of valid tokens
  return validTokens.includes(token);
}

function setupWebSocketServer(server, clients) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    let messageCount = 0;
    const messageLimit = 50; // Max 50 messages per minute
    const resetInterval = setInterval(() => (messageCount = 0), 60 * 1000); // Reset every minute

    // Parse the token from the query string
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const token = urlParams.get('token');
    console.log(`Received token: ${token}`); // Log the received token

    // Validate the token
    if (!isValidToken(token)) {
      console.log('Invalid token, closing connection');
      ws.close(1008, 'Invalid authentication token'); // Close with policy violation code
      return;
    }

    console.log('WebSocket client connected with valid token');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // Validate the `id` field
        if (!data.id || typeof data.id !== 'string') {
          throw new Error('Invalid ID');
        }

        // Validate the `seconds` field (optional but must be a number if present)
        if (data.seconds !== undefined && typeof data.seconds !== 'number') {
          throw new Error('Invalid seconds');
        }

        console.log('Valid message received:', data);

        // Process the message (e.g., update the clients map)
        if (!clients.has(data.id)) {
          clients.set(data.id, { ws, seconds: 0 });
        }
        if (data.seconds !== undefined) {
          clients.get(data.id).seconds = data.seconds;
        }
      } catch (error) {
        console.error('Invalid message format:', error.message);
        ws.close(1008, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      clearInterval(resetInterval);
      // Remove the client from the map when disconnected
      for (const [id, clientData] of clients.entries()) {
        if (clientData.ws === ws) {
          clients.delete(id);
          console.log(`Client with ID ${id} disconnected`);
          break;
        }
      }
      resetClientStatus(); // Reset status when a client disconnects
    });
  });
}

module.exports = {
  setupWebSocketServer,
};