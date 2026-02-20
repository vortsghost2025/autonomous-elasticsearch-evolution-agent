/**
 * main.js
 * Orchestrates the multi-agent system, ensuring agents interact and messages are processed in real time
 */

import { Client } from '@elastic/elasticsearch';
import { ElasticsearchSearchOptimizer } from '../elasticsearch-search-optimizer.js';
import { ElasticsearchMetricsCollector } from '../elasticsearch-metrics-collector.js';
import { PersistentMemory } from '../persistent-memory.js';
import { MessagePasser } from '../message-passers.js';
import { CommunicationMonitor } from '../communication-monitor.js';
import { ResearchAgent } from '../research-agent.js';
import { CodingAgent } from '../coding-agent.js';

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

// Periodically collect metrics and send to research agent
setInterval(async () => {
  try {
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
  } catch (error) {
    console.error('Error collecting metrics:', error);
  }
}, 60000); // Every minute

// Print communication monitor summary every 5 minutes
setInterval(() => {
  communicationMonitor.printSummary();
}, 300000);

// Export for testing
export { messagePasser, communicationMonitor };