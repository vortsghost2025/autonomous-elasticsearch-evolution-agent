/**
 * Collaboration Hub Server
 * Real-time communication hub for multi-platform agents (VS Code, LM Arena, etc.)
 * Supports WebSocket for instant updates and REST API for polling
 */


import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Message store
const messages = {
  'vscode-agents': [],
  'lmarena-agents': [],
  'shared': []
};
const MAX_MESSAGES = 100;

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('New collaboration hub client connected:', req.url);
  // Send initial messages
  ws.send(JSON.stringify({
    type: 'init',
    messages: messages
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'post-message') {
        const { platform, sender, content, timestamp = new Date().toISOString() } = message;
        if (!platform || !sender || !content) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Missing required fields: platform, sender, content'
          }));
          return;
        }
        const newMessage = {
          id: Date.now() + Math.random(),
          platform,
          sender,
          content,
          timestamp
        };
        if (messages.hasOwnProperty(platform)) {
          messages[platform].push(newMessage);
          if (messages[platform].length > MAX_MESSAGES) {
            messages[platform].shift();
          }
        } else {
          messages.shared.push(newMessage);
        }
        const broadcastMessage = {
          type: 'new-message',
          message: newMessage
        };
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(broadcastMessage));
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from collaboration hub');
  });
});

// REST API endpoints
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/messages/:platform', (req, res) => {
  const platform = req.params.platform;
  if (messages.hasOwnProperty(platform)) {
    res.json(messages[platform]);
  } else {
    res.status(404).json({ error: `Platform '${platform}' not found` });
  }
});

app.post('/api/messages', (req, res) => {
  const { platform, sender, content, timestamp = new Date().toISOString() } = req.body;
  if (!platform || !sender || !content) {
    return res.status(400).json({
      error: 'Missing required fields: platform, sender, content'
    });
  }
  const newMessage = {
    id: Date.now() + Math.random(),
    platform,
    sender,
    content,
    timestamp
  };
  if (messages.hasOwnProperty(platform)) {
    messages[platform].push(newMessage);
    if (messages[platform].length > MAX_MESSAGES) {
      messages[platform].shift();
    }
  } else {
    messages.shared.push(newMessage);
  }
  const broadcastMessage = {
    type: 'new-message',
    message: newMessage
  };
  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(broadcastMessage));
    }
  });
  res.status(201).json(newMessage);
});

app.delete('/api/messages/:platform', (req, res) => {
  const platform = req.params.platform;
  if (messages.hasOwnProperty(platform)) {
    messages[platform] = [];
    res.json({ message: `Cleared messages for platform '${platform}'` });
  } else {
    res.status(404).json({ error: `Platform '${platform}' not found` });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Collaboration Hub Server running on port ${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET    /api/messages                    - Get all messages`);
  console.log(`   GET    /api/messages/:platform          - Get messages for specific platform`);
  console.log(`   POST   /api/messages                    - Post a new message`);
  console.log(`   DELETE /api/messages/:platform          - Clear messages for platform`);
  console.log(`\n🌐 WebSocket Endpoint:`);
  console.log(`   ws://localhost:${PORT}/ws              - Real-time message updates`);
  console.log(`\n🎯 Platform Options:`);
  console.log(`   'vscode-agents'                       - VS Code agents`);
  console.log(`   'lmarena-agents'                      - LM Arena agents`);
  console.log(`   'shared'                              - Shared messages`);
  console.log(`\n💡 Usage:`);
  console.log(`   - Open collab-hub.html in your browser`);
  console.log(`   - Connect agents to WebSocket endpoint`);
  console.log(`   - Use REST API for programmatic access`);
});