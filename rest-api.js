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

  // REST API to get all connected clients
  app.get('/clients', (req, res) => {
    const clientIds = Array.from(clients.keys());
    res.json({ clients: clientIds });
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