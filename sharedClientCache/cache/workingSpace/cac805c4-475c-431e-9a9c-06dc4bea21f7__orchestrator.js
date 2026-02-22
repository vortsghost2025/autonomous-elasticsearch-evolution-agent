/**
 * Multi-Agent Orchestrator
 * Manages multiple agents running in different modes (local, background, cloud)
 * Coordinates swarm behavior and federated learning
 */

import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import { agentsConfig } from './config/agents-config.js';
import { PersistentMemory } from './persistent-memory.js';

class AgentOrchestrator {
  constructor(options = {}) {
    this.agents = new Map();
    this.config = { ...agentsConfig, ...options };
    this.persistentMemory = new PersistentMemory({ storagePath: './orchestrator-memory.json' });
    this.websocketServer = null;
    this.isRunning = false;
    this.heartbeatTimer = null;
    this.coordinationTimer = null;
    this.syncTimer = null;
    this.portMap = new Map(); // Track which ports are in use
  }

  async initialize() {
    try {
      await this.persistentMemory.load();
      console.log('[Orchestrator] Persistent memory loaded');
    } catch (error) {
      console.error('[Orchestrator] Failed to load persistent memory:', error);
    }
    
    // Initialize WebSocket server for inter-agent communication
    // Port conflict resolution
    const net = await import('net');
    let port = this.config.orchestration.masterAgent.port || 3101;
    let found = false;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close(() => resolve(true));
        });
        server.listen(port);
      }).then((available) => {
        if (available && !found) {
          found = true;
        } else if (!available) {
          port++;
        }
      });
      if (found) break;
    }
    if (!found) throw new Error('No available port for orchestrator');
    this.portMap.set(port, true);
    this.websocketServer = new WebSocketServer({ port });
    
    this.setupWebsocketHandlers();
    
    console.log('[Orchestrator] Initialized with persistent memory and WebSocket server');
  }

  setupWebsocketHandlers() {
    this.websocketServer.on('connection', (ws) => {
      console.log('[Orchestrator] New agent connected to orchestration bus');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleIncomingMessage(message, ws);
        } catch (error) {
          console.error('[Orchestrator] Failed to parse incoming message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('[Orchestrator] Agent disconnected from orchestration bus');
      });
    });
  }

  handleIncomingMessage(message, senderWs) {
    console.log(`[Orchestrator] Received message from agent:`, message.type);
    
    // Route message based on type
    switch (message.type) {
      case 'agent-status':
        this.updateAgentStatus(message.agentId, message.status);
        break;
      case 'optimization-result':
        this.handleOptimizationResult(message);
        break;
      default:
        console.warn(`[Orchestrator] Unknown message type: ${message.type}`);
    }
  }

  // Add method to stop all processes gracefully
  async stopAllProcesses() {
    console.log('[Orchestrator] Stopping all processes...');
    
    // Stop WebSocket server
    if (this.websocketServer) {
      this.websocketServer.close();
      console.log('[Orchestrator] WebSocket server stopped');
    }
    
    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.coordinationTimer) {
      clearInterval(this.coordinationTimer);
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    // Stop all agents
    for (const [agentId, agentProcess] of this.agents) {
      if (agentProcess && typeof agentProcess.kill === 'function') {
        agentProcess.kill();
        console.log(`[Orchestrator] Stopped agent: ${agentId}`);
      }
    }
    
    // Clear port map
    this.portMap.clear();
    
    console.log('[Orchestrator] All processes stopped successfully');
  }
}