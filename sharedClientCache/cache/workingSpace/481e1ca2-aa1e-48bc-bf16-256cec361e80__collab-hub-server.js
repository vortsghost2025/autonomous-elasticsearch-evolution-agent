/**
 * Collaboration Hub Server
 * Enables real-time communication between agents on multiple platforms
 * Supports both WebSocket for real-time updates and REST API for polling
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store messages for each platform
const messages = {
  vsCodeAgents: [],
  lmArenaAgents: []
};

// In-memory log store
const logs = [];
function log(message, level = 'info') {
  logs.push({ message, level, timestamp: Date.now() });
  if (logs.length > 500) logs.shift();
}
log('Collaboration Hub Server started', 'info');

// Maximum number of stored messages per platform
const MAX_MESSAGES = 100;

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('New client connected to collaboration hub');

  // Send initial messages to the newly connected client
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      vsCodeMessages: messages.vsCodeAgents,
      lmArenaMessages: messages.lmArenaAgents
    }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // Validate message structure
      if (!message.platform || !['vsCode', 'lmArena'].includes(message.platform) || 
          !message.sender || !message.content) {
        console.error('Invalid message format:', message);
        return;
      }

      // Create message object
      const newMessage = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sender: message.sender,
        content: message.content,
        platform: message.platform
      };

      // Add to appropriate platform
      if (message.platform === 'vsCode') {
        messages.vsCodeAgents.push(newMessage);
        // Trim array to max size
        if (messages.vsCodeAgents.length > MAX_MESSAGES) {
          messages.vsCodeAgents = messages.vsCodeAgents.slice(-MAX_MESSAGES);
        }
      } else if (message.platform === 'lmArena') {
        messages.lmArenaAgents.push(newMessage);
        // Trim array to max size
        if (messages.lmArenaAgents.length > MAX_MESSAGES) {
          messages.lmArenaAgents = messages.lmArenaAgents.slice(-MAX_MESSAGES);
        }
      }

      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'newMessage',
            data: newMessage
          }));
        }
      });

      log(`Message added from ${message.sender} on ${message.platform}`);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    log('Client disconnected from collaboration hub');
  });

  ws.on('error', (error) => {
    log('WebSocket error: ' + error, 'error');
  });
});

// REST API endpoints
// GET messages for a specific platform
app.get('/api/messages/:platform', (req, res) => {
  const platform = req.params.platform;
  
  if (!['vsCode', 'lmArena'].includes(platform)) {
    log('Invalid platform requested: ' + platform, 'warn');
    return res.status(400).json({ error: 'Invalid platform. Use vsCode or lmArena' });
  }
  
  const platformMessages = platform === 'vsCode' ? messages.vsCodeAgents : messages.lmArenaAgents;
  res.json({
    platform: platform,
    messages: platformMessages
  });
});

// POST new message
app.post('/api/messages', express.json(), (req, res) => {
  const { platform, sender, content } = req.body;
  
  if (!platform || !['vsCode', 'lmArena'].includes(platform) || !sender || !content) {
    log('Invalid message format received', 'warn');
    return res.status(400).json({ error: 'Invalid message format. Require platform, sender, and content.' });
  }
  
  const newMessage = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    sender,
    content,
    platform
  };
  
  if (platform === 'vsCode') {
    messages.vsCodeAgents.push(newMessage);
    if (messages.vsCodeAgents.length > MAX_MESSAGES) {
      messages.vsCodeAgents = messages.vsCodeAgents.slice(-MAX_MESSAGES);
    }
  } else if (platform === 'lmArena') {
    messages.lmArenaAgents.push(newMessage);
    if (messages.lmArenaAgents.length > MAX_MESSAGES) {
      messages.lmArenaAgents = messages.lmArenaAgents.slice(-MAX_MESSAGES);
    }
  }
  
  // Broadcast via WebSocket
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'newMessage',
        data: newMessage
      }));
    }
  });
  
  log(`POST message from ${sender} on ${platform}`);
  res.status(201).json({ success: true, id: newMessage.id });
// Log API
app.get('/api/logs', (req, res) => {
  res.json(logs);
});
});

// Endpoint to get both platform messages
app.get('/api/messages', (req, res) => {
  res.json({
    vsCodeMessages: messages.vsCodeAgents,
    lmArenaMessages: messages.lmArenaAgents
  });
});

// Serve the collaboration hub HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'collab-hub.html'));
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Collaboration Hub Server running on port ${PORT}`);
  console.log(`Access the dashboard at http://localhost:${PORT}`);
  console.log('WebSocket endpoint: ws://localhost:' + PORT + '/ws');
  console.log('REST API endpoints:');
  console.log('  GET  /api/messages/vsCode');
  console.log('  GET  /api/messages/lmArena');
  console.log('  POST /api/messages');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    console.log('Server closed.');
  });
});

export { app, server, messages };