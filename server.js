const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 5001; // Use the port you want

// Serve Angular apps
app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/client', express.static(path.join(__dirname, 'client')));

// WebSocket server
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Broadcast the message to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
      }
    });
  });
});

// Log when the server starts
server.listen(port, () => {
  const address = server.address().address;
  const port = server.address().port;
  console.log(`Server running on http://${address}:${port}`);
});