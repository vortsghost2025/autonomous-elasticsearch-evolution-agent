/**
 * Real-time Dashboard Server for Autonomous Elasticsearch Evolution Agent
 * Provides WebSocket-based visualization of system activity
 */

import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Store latest metrics for new connections
let latestMetrics = null;
let latestOptimizations = [];
let latestInsights = [];

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New dashboard client connected');
  
  // Send initial data to new client
  if (latestMetrics) {
    ws.send(JSON.stringify({ type: 'metrics', data: latestMetrics }));
  }
  
  if (latestOptimizations.length > 0) {
    ws.send(JSON.stringify({ type: 'optimizations', data: latestOptimizations.slice(-10) })); // Last 10
  }
  
  if (latestInsights.length > 0) {
    ws.send(JSON.stringify({ type: 'insights', data: latestInsights.slice(-10) })); // Last 10
  }
  
  // Send periodic updates
  const interval = setInterval(() => {
    if (latestMetrics) {
      ws.send(JSON.stringify({ type: 'metrics', data: latestMetrics }));
    }
  }, 5000); // Every 5 seconds
  
  // Handle client disconnect
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Dashboard client disconnected');
  });
});

// Function to broadcast metrics to all clients
function broadcastMetrics(metrics) {
  latestMetrics = metrics;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'metrics', data: metrics }));
    }
  });
}

// Function to broadcast optimizations to all clients
function broadcastOptimization(opt) {
  latestOptimizations.push({...opt, timestamp: Date.now()});
  if (latestOptimizations.length > 50) {
    latestOptimizations = latestOptimizations.slice(-50);
  }
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'optimization', data: opt }));
    }
  });
}

// Function to broadcast insights to all clients
function broadcastInsight(insight) {
  latestInsights.push({...insight, timestamp: Date.now()});
  if (latestInsights.length > 50) {
    latestInsights = latestInsights.slice(-50);
  }
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'insight', data: insight }));
    }
  });
}

// Function to broadcast system status
function broadcastStatus(status) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'status', data: status }));
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Dashboard server running on http://localhost:${PORT}`);
});

// Export functions for use by other modules
export { 
  broadcastMetrics, 
  broadcastOptimization, 
  broadcastInsight, 
  broadcastStatus,
  wss 
};