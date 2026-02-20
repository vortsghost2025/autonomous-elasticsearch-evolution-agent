/**
 * Mock Server for Autonomous Elasticsearch Evolution Agent
 * Designed for Azure Dev Tunnel connectivity (local:8000 → remote:3000)
 * Implements the 14-phase autonomous architecture with all cosmic arcs
 * Uses mock data instead of real Elasticsearch connection
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElasticsearchSearchOptimizer } from './elasticsearch-search-optimizer.js';
import { ResearchAgent } from './research-agent.js';
import { CodingAgent } from './coding-agent.js';
import { PersistentMemory } from './persistent-memory.js';
import { MessagePasser } from './autonomous-elasticsearch-evolution-agent/message-passers.js';
import { CommunicationMonitor } from './autonomous-elasticsearch-evolution-agent/communication-monitor.js';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Store latest data for new WebSocket connections
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

// Initialize persistent memory
const persistentMemory = new PersistentMemory({ 
  storagePath: './memory-store.json' 
});

try {
  await persistentMemory.load();
  console.log("Persistent memory initialized successfully");
} catch (error) {
  console.error("Failed to initialize persistent memory:", error);
}

// Create mock ES client (no real connection)
const mockEsClient = {
  cluster: {
    health: async () => ({
      status: 'yellow',
      active_shards: 10,
      active_primary_shards: 5,
      relocating_shards: 0,
      initializing_shards: 0,
      unassigned_shards: 2,
      delayed_unassigned_shards: 0,
      number_of_nodes: 2,
      number_of_data_nodes: 2,
      active_shards_percent_as_number: 83.3
    })
  },
  nodes: {
    stats: async () => ({
      nodes: {
        'node-1': {
          name: 'node-1',
          jvm: {
            mem: {
              heap_used_percent: 78,
              heap_max_in_bytes: 2147483648, // 2GB
              heap_used_in_bytes: 1677721600 // 1.6GB
            }
          },
          fs: {
            total: {
              total_in_bytes: 53687091200, // 50GB
              available_in_bytes: 21474836480, // 20GB
              free_in_bytes: 21474836480
            }
          },
          indices: {
            docs: { count: 1250000 },
            store: { size_in_bytes: 1073741824 }, // 1GB
            query_cache: { memory_size_in_bytes: 53687091 }
          }
        },
        'node-2': {
          name: 'node-2',
          jvm: {
            mem: {
              heap_used_percent: 82,
              heap_max_in_bytes: 2147483648, // 2GB
              heap_used_in_bytes: 1761605386 // 1.65GB
            }
          },
          fs: {
            total: {
              total_in_bytes: 53687091200, // 50GB
              available_in_bytes: 19327352832, // 18GB
              free_in_bytes: 19327352832
            }
          },
          indices: {
            docs: { count: 1180000 },
            store: { size_in_bytes: 1181116006 }, // 1.1GB
            query_cache: { memory_size_in_bytes: 64424509 }
          }
        }
      }
    })
  },
  indices: {
    stats: async () => ({
      indices: {
        'logs-app-000001': {
          primaries: {
            docs: { count: 500000, deleted: 5000 },
            store: { size_in_bytes: 429496729 }, // ~400MB
            indexing: {
              index_total: 500000,
              index_time_in_millis: 150000,
              delete_total: 5000
            },
            search: {
              query_total: 100000,
              query_time_in_millis: 50000,
              fetch_total: 80000
            },
            segments: {
              count: 12,
              memory_in_bytes: 12582912 // 12MB
            }
          },
          total: {
            store: { size_in_bytes: 472446401 }, // ~450MB
          }
        },
        'logs-app-000002': {
          primaries: {
            docs: { count: 750000, deleted: 7500 },
            store: { size_in_bytes: 644245094 }, // ~600MB
            indexing: {
              index_total: 750000,
              index_time_in_millis: 225000,
              delete_total: 7500
            },
            search: {
              query_total: 150000,
              query_time_in_millis: 75000,
              fetch_total: 120000
            },
            segments: {
              count: 18,
              memory_in_bytes: 18874368 // 18MB
            }
          },
          total: {
            store: { size_in_bytes: 708669605 }, // ~675MB
          }
        }
      }
    })
  }
};

// Initialize components with persistent memory
// Instead of importing the real collector, we'll create mock metrics
const mockMetricsCollector = {
  collectMetrics: async () => {
    const timestamp = Date.now();
    const clusterName = 'demo-cluster';
    
    // Mock metrics
    const clusterHealth = {
      status: 'yellow',
      active_shards: 10,
      active_primary_shards: 5,
      relocating_shards: 0,
      initializing_shards: 0,
      unassigned_shards: 2,
      delayed_unassigned_shards: 0,
      number_of_nodes: 2,
      number_of_data_nodes: 2,
      active_shards_percent_as_number: 83.3
    };
    
    const nodeStats = {
      'node-1': {
        name: 'node-1',
        jvmMemory: {
          heapUsedPercent: 78,
          heapMaxInBytes: 2147483648,
          heapUsedInBytes: 1677721600
        },
        fsTotal: {
          total: 53687091200,
          available: 21474836480,
          free: 21474836480
        },
        indices: {
          docsCount: 1250000,
          storeSize: 1073741824,
          cacheSize: 53687091
        }
      },
      'node-2': {
        name: 'node-2',
        jvmMemory: {
          heapUsedPercent: 82,
          heapMaxInBytes: 2147483648,
          heapUsedInBytes: 1761605386
        },
        fsTotal: {
          total: 53687091200,
          available: 19327352832,
          free: 19327352832
        },
        indices: {
          docsCount: 1180000,
          storeSize: 1181116006,
          cacheSize: 64424509
        }
      }
    };
    
    const indexStats = {
      'logs-app-000001': {
        docs: { count: 500000, deleted: 5000 },
        store: { size: 429496729, totalSize: 472446401 },
        indexing: {
          indexTotal: 500000,
          indexTimeInMillis: 150000,
          deleteTotal: 5000
        },
        search: {
          queryTotal: 100000,
          queryTimeInMillis: 50000,
          fetchTotal: 80000
        },
        segments: {
          count: 12,
          memoryInBytes: 12582912
        }
      },
      'logs-app-000002': {
        docs: { count: 750000, deleted: 7500 },
        store: { size: 644245094, totalSize: 708669605 },
        indexing: {
          indexTotal: 750000,
          indexTimeInMillis: 225000,
          deleteTotal: 7500
        },
        search: {
          queryTotal: 150000,
          queryTimeInMillis: 75000,
          fetchTotal: 120000
        },
        segments: {
          count: 18,
          memoryInBytes: 18874368
        }
      }
    };
    
    // Calculate derived metrics
    const avgFragmentation = 2.4; // Mock value
    const avgMemoryUsage = 0.80; // 80%
    const avgQueryLatency = 0.5; // 500ms average
    const shardHealth = 0.833; // 83.3%
    const clusterHealthValue = 0.5; // Yellow = 0.5
    
    const calculated = {
      indexFragmentation: avgFragmentation,
      memoryUsage: avgMemoryUsage,
      queryLatency: avgQueryLatency,
      shardHealth: shardHealth,
      clusterHealth: clusterHealthValue
    };
    
    const metrics = {
      timestamp,
      clusterName,
      health: clusterHealth,
      nodes: nodeStats,
      indexes: indexStats,
      calculated
    };
    
    return metrics;
  }
};

const optimizer = new ElasticsearchSearchOptimizer(mockEsClient, { 
  clusterName: 'demo-cluster', 
  autonomyLevel: 'supervised',
  persistentMemory: persistentMemory
});

// Initialize research and coding agents
const researchAgent = new ResearchAgent({ 
  agentId: 'research-agent-1',
  persistentMemory: persistentMemory 
});

const codingAgent = new CodingAgent({ 
  agentId: 'coding-agent-1', 
  persistentMemory: persistentMemory 
});

// Initialize message passing system
const messagePasser = new MessagePasser();
const communicationMonitor = new CommunicationMonitor(messagePasser);

// Add event handlers for research agent
messagePasser.subscribe('metrics-update', async (message) => {
  console.log(`[Research Agent] Received metrics update from ${message.sender}`);
  
  try {
    // Generate research report based on metrics
    const report = await researchAgent.generateResearchReport(message.content.data);
    
    // Send report to coding agent
    messagePasser.sendMessage({
      type: 'research-report',
      sender: 'research-agent',
      receiver: 'coding-agent',
      content: {
        report,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[Research Agent] Error processing metrics:', error);
  }
});

// Add event handlers for coding agent
messagePasser.subscribe('research-report', async (message) => {
  console.log(`[Coding Agent] Received research report from ${message.sender}`);
  
  try {
    // Generate code from research insights
    const codeSnippets = await codingAgent.generateCodeFromInsights(message.content.report);
    
    // Send generated code back to research agent for validation
    messagePasser.sendMessage({
      type: 'generated-code',
      sender: 'coding-agent',
      receiver: 'research-agent',
      content: {
        codeSnippets,
        reportRef: message.content.report.timestamp,
        timestamp: Date.now()
      }
    });
    
    // Also send to optimizer for potential execution
    messagePasser.sendMessage({
      type: 'optimization-suggestions',
      sender: 'coding-agent',
      receiver: 'optimizer',
      content: {
        suggestions: codeSnippets,
        reportRef: message.content.report.timestamp,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('[Coding Agent] Error generating code:', error);
  }
});

// Add handler for optimization suggestions
messagePasser.subscribe('optimization-suggestions', async (message) => {
  console.log(`[Optimizer] Received ${message.content.suggestions.length} optimization suggestions`);
  
  // Run an optimization cycle with the suggestions
  try {
    const result = await optimizer.runPhase9Cycle('suggestion-cycle', {
      health: { status: 'yellow' },
      calculated: { 
        memoryUsage: 0.85, 
        indexFragmentation: 4.5, 
        queryLatency: 0.8,
        shardHealth: 0.65
      }
    });
    
    console.log(`[Optimizer] Completed optimization cycle with result:`, result.success);
  } catch (error) {
    console.error('[Optimizer] Error running optimization cycle:', error);
  }
});

// Start the system
console.log("🚀 Starting Autonomous Elasticsearch Evolution Agent with Multi-Agent Communication");

// Initialize agents
await Promise.all([
  researchAgent.initialize(),
  codingAgent.initialize(),
  optimizer.initialize()
]);

// Run initial optimization cycle
await optimizer.runPhase9Cycle('initial-cycle');

// Periodically generate mock metrics and send to research agent
setInterval(async () => {
  try {
    const metrics = await mockMetricsCollector.collectMetrics();
    
    messagePasser.sendMessage({
      type: 'metrics-update',
      sender: 'metrics-collector',
      receiver: 'research-agent',
      content: {
        timestamp: Date.now(),
        data: metrics
      }
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
  }
}, 60000); // Every minute

// Print communication monitor summary every 5 minutes
setInterval(() => {
  communicationMonitor.printSummary();
}, 300000);

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Autonomous Elasticsearch Evolution Agent Dashboard Server running on port ${PORT}`);
  console.log(`Access via Azure Dev Tunnel: Forward local port 8000 to remote port ${PORT}`);
  console.log('Ready for local development and remote access...');
});

// Export for testing
export { 
  server, 
  broadcastMetrics, 
  broadcastOptimization, 
  broadcastInsight, 
  broadcastStatus,
  wss 
};