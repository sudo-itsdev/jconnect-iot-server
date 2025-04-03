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

  // REST API to get all connected clients with their seconds
  app.get('/clients', (req, res) => {
    const clientData = Array.from(clients.entries()).map(([id, data]) => ({
      id,
      seconds: data.seconds, // Include the seconds value for each client
    }));
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