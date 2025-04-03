const WebSocket = require('ws');
const { setClientStatus, resetClientStatus } = require('./rest-api');

function setupWebSocketServer(server, clients) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      try {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.id) {
          // Store the client connection by unique ID
          const clientId = parsedMessage.id;
          clients.set(clientId, ws);
          console.log(`Client connected with ID: ${clientId}`);
        }

        if (parsedMessage.status) {
          // Update the status for REST API
          setClientStatus(parsedMessage.status);
          console.log(`Updated client status: ${parsedMessage.status}`);
        }
      } catch (error) {
        console.error('Invalid message format. Expected JSON with "id" and/or "status" fields.');
      }
    });

    ws.on('close', () => {
      // Remove the client from the map when disconnected
      for (const [id, clientWs] of clients.entries()) {
        if (clientWs === ws) {
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