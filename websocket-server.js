const WebSocket = require("ws");
const { setClientStatus, resetClientStatus } = require("./rest-api");

// Replace this with your actual authentication logic
function isValidToken(token) {
  const validTokens = ["your-secret-token"]; // List of valid tokens
  return validTokens.includes(token);
}

function setupWebSocketServer(server, clients, validClientIds) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const messageLimit = 70; // Max 70 messages per minute
    let messageCount = 0;
    let rateLimited = false; // Track if the client is rate-limited

    console.log('Client connected...');

    // Reset the message count every minute
    const resetInterval = setInterval(() => {
      messageCount = 0;
    }, 60 * 1000); // 1 minute

    // Parse the token from the query string
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const token = urlParams.get("token");
    const clientId = urlParams.get("client_id");
    console.log(`Received token: ${token}`); // Log the received token
    console.log(`Received client_id: ${clientId}`); // Log the received client_id

    // Check if the client_id is valid
    // if (!clientId || !validClientIds.has(clientId)) {
    //   console.log("Invalid client_id, closing connection");
    //   ws.close(1008, "Invalid client_id"); // Close with policy violation code
    //   return;
    // }

    // Check if the client ID is already in the map
    if (clients.has(clientId)) {
      const existingClient = clients.get(clientId);

      // Check if the existing client is still connected
      if (
        existingClient.connected &&
        existingClient.ws &&
        existingClient.ws.readyState === WebSocket.OPEN
      ) {
        console.log(
          `Client with ID ${clientId} is already connected. Closing new connection.`
        );
        ws.close(1008, "Client with this ID is already connected");
        return;
      } else {
        // Remove the stale client from the map
        console.log(`Removing stale client with ID ${clientId}`);
        clients.delete(clientId);
      }
    }

    // Validate the token
    if (!isValidToken(token)) {
      console.log("Invalid token, closing connection");
      ws.close(1008, "Invalid authentication token"); // Close with policy violation code
      return;
    }

    console.log("WebSocket client connected with valid token");

    ws.on("message", (message) => {
      try {
        // Increment the message count
        messageCount++;

        // Check if the client has exceeded the message limit
        if (messageCount > messageLimit) {
          console.log("Rate limit exceeded, closing connection");
          rateLimited = true; // Mark the client as rate-limited
          ws.close(1008, "Rate limit exceeded"); // Close with policy violation code
          return;
        }

        const data = JSON.parse(message);

        // // Validate the `id` field
        // if (!data.id || typeof data.id !== "string") {
        //   throw new Error("Invalid ID");
        // }

        // Validate the `seconds` field (optional but must be a number if present)
        if (data.seconds !== undefined && typeof data.seconds !== "number") {
          throw new Error("Invalid seconds");
        }

        console.log(`Received message from client ${clientId}:`, data);

        // Update the client's data in the `clients` map using clientId as the key
        if (!clients.has(clientId)) {
          clients.set(clientId, {
            ws,
            seconds: 0,
            lastMessageTime: Date.now(),
            connected: true,
          });
        }
        const clientData = clients.get(clientId);
        clientData.seconds = data.seconds;
        clientData.lastMessageTime = Date.now(); // Update the time of the most recent message
        clientData.connected = true; // Mark the client as connected
      } catch (error) {
        console.error("Invalid message format:", error.message);
        ws.close(1008, "Invalid message format");
      }
    });

    ws.on("close", () => {
      clearInterval(resetInterval);

      // Handle rate-limited clients
      if (rateLimited) {
        for (const [id, clientData] of clients.entries()) {
          if (clientData.ws === ws) {
            clients.delete(id); // Remove the client from the map
            console.log(`Client with ID ${id} removed due to rate limiting`);
            break;
          }
        }
        return; // Exit early for rate-limited clients
      }

      // Mark the client as disconnected instead of removing them
      for (const [id, clientData] of clients.entries()) {
        if (clientData.ws === ws) {
          clientData.connected = false; // Mark the client as disconnected
          clientData.ws = null; // Remove the WebSocket reference
          console.log(
            `Client with ID ${id} disconnected but retained in the clients map`
          );
          break;
        }
      }
    });
  });
}

module.exports = {
  setupWebSocketServer,
};
