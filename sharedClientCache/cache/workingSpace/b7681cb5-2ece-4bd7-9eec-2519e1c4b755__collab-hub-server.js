// Real-time Dual-Agent Collaboration Hub (Node.js + WebSocket)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory message stores for each agent group
let messages = {
  vscode: [], // Messages from VS Code agents
  lmarena: [] // Messages from LM Arena agents
};

// REST API for polling fallback
app.get('/api/messages/:group', (req, res) => {
  const group = req.params.group;
  res.json(messages[group] || []);
});

app.post('/api/messages/:group', (req, res) => {
  const group = req.params.group;
  const msg = req.body;
  if (!messages[group]) messages[group] = [];
  messages[group].push({ ...msg, timestamp: Date.now() });
  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ group, ...msg, timestamp: Date.now() }));
    }
  });
  res.json({ status: 'ok' });
});

// WebSocket for real-time updates
wss.on('connection', ws => {
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'message' && data.group) {
        if (!messages[data.group]) messages[data.group] = [];
        messages[data.group].push({ ...data, timestamp: Date.now() });
        // Broadcast to all
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ ...data, timestamp: Date.now() }));
          }
        });
      }
    } catch (e) {}
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Collab Hub server running on port ${PORT}`);
});
