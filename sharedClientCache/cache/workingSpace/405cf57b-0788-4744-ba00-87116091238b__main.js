/**
 * main.js
 * Orchestrates the multi-agent system, ensuring agents interact and messages are processed in real time
 */

import { ElasticsearchSearchOptimizer } from './elasticsearch-search-optimizer.js';
import { ElasticsearchMetricsCollector } from './elasticsearch-metrics-collector.js';
import { PersistentMemory } from './persistent-memory.js';
import { MessagePasser } from './message-passers.js';
import { CommunicationMonitor } from './communication-monitor.js';

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

// Create ES client (using fake connection for demo purposes)
const esClient = new Client({ node: 'http://localhost:9200' });

// Initialize components with persistent memory
const metricsCollector = new ElasticsearchMetricsCollector(esClient, { 
  clusterName: 'demo-cluster',
  persistentMemory: persistentMemory
});

const optimizer = new ElasticsearchSearchOptimizer(esClient, { 
  clusterName: 'demo-cluster', 
  autonomyLevel: 'supervised',
  persistentMemory: persistentMemory
});

// Initialize message passing system
const messagePasser = new MessagePasser();
const communicationMonitor = new CommunicationMonitor(messagePasser);

// Add event handlers for research agent
messagePasser.subscribe('research-results', async (message) => {
  console.log(`[Research Agent] Received research results: ${message.content.title}`);
  
  // Process the research results and send back to code agent
  const response = await optimizer.runPhase9Cycle('research-cycle', message.content.data);
  
  // Send response back to code agent
  messagePasser.sendMessage({
    type: 'code-response',
    sender: 'research-agent',
    receiver: 'code-agent',
    content: {
      status: 'success',
      result: response,
      timestamp: Date.now()
    }
  });
});

// Add event handlers for code agent
messagePasser.subscribe('code-request', async (message) => {
  console.log(`[Code Agent] Received code request: ${message.content.description}`);
  
  // Simulate code generation based on research results
  const codeResponse = {
    status: 'success',
    code: `// Generated code based on research\nfunction optimizeCluster() {\n  // Implementation based on research findings\n}`,
    explanation: 'Implementation based on research findings',
    timestamp: Date.now()
  };
  
  // Send response back to research agent
  messagePasser.sendMessage({
    type: 'code-response',
    sender: 'code-agent',
    receiver: 'research-agent',
    content: codeResponse
  });
});

// Start the system
console.log("🚀 Starting Autonomous Elasticsearch Evolution Agent with Multi-Agent Communication");

// Run initial optimization cycle
await optimizer.runPhase9Cycle('initial-cycle');

// Periodically collect metrics and send to research agent
setInterval(async () => {
  const metrics = await metricsCollector.collectMetrics();
  
  messagePasser.sendMessage({
    type: 'metrics-update',
    sender: 'metrics-collector',
    receiver: 'research-agent',
    content: {
      timestamp: Date.now(),
      data: metrics
    }
  });
}, 60000); // Every minute

// Print communication monitor summary every 5 minutes
setInterval(() => {
  communicationMonitor.printSummary();
}, 300000);

// Export for testing
export { messagePasser, communicationMonitor };