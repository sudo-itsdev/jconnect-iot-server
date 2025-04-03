let clientStatus = null; // Variable to store the status sent by the WebSocket client

function setupRestApi(app, clients) {
  // REST API to get the current status
  app.get('/status', (req, res) => {
    if (clientStatus) {
      res.json({ status: clientStatus });
    } else {
      res.status(404).json({ error: 'No client status available' });
    }
  });

  // REST API to get all connected clients with their seconds and online status
  app.get('/clients', (req, res) => {
    const clientData = Array.from(clients.entries()).map(([id, data]) => {
      const currentTime = Date.now();
      const isOnline = currentTime - data.lastMessageTime <= 5000; // Check if the last message was within 5 seconds
      return {
        id,
        seconds: data.seconds,
        online: isOnline,
      };
    });
    res.json({ clients: clientData });
  });
}

module.exports = {
  setupRestApi,
  setClientStatus: (status) => {
    clientStatus = status;
  },
  resetClientStatus: () => {
    clientStatus = null;
  },
};