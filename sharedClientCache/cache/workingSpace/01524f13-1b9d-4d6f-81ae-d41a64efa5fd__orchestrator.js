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
  }

  async initialize() {
    try {
      await this.persistentMemory.load();
      console.log('[Orchestrator] Persistent memory loaded');
    } catch (error) {
      console.error('[Orchestrator] Failed to load persistent memory:', error);
    }
    
    // Initialize WebSocket server for inter-agent communication
    this.websocketServer = new WebSocketServer({ port: 3101 }); // Fixed port for orchestration
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
      case 'request-coordination':
        this.coordinateAgents(message.agentId, message.request);
        break;
      case 'swarm-command':
        this.executeSwarmCommand(message.command, message.params);
        break;
      case 'federation-data':
        this.handleFederationData(message);
        break;
      default:
        console.log(`[Orchestrator] Unknown message type: ${message.type}`);
    }
    
    // Broadcast to other interested agents if needed
    this.broadcastToAgents(message, senderWs);
  }

  updateAgentStatus(agentId, status) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastStatus = { ...status, timestamp: Date.now() };
      console.log(`[Orchestrator] Updated status for agent ${agentId}`, status);
    }
  }

  handleOptimizationResult(result) {
    console.log(`[Orchestrator] Optimization result from ${result.agentId}:`, result.success);
    
    // Store in persistent memory
    this.persistentMemory.set(`optimization_result_${Date.now()}`, result);
  }

  coordinateAgents(requestingAgentId, request) {
    console.log(`[Orchestrator] Coordinating request from ${requestingAgentId}:`, request.action);
    
    // Find compatible agents
    const compatibleAgents = Array.from(this.agents.values()).filter(agent => 
      agent.id !== requestingAgentId && 
      agent.status === 'active'
    );
    
    // Send coordination request to compatible agents
    const coordinationMessage = {
      type: 'coordination-request',
      from: requestingAgentId,
      request: request,
      timestamp: Date.now()
    };
    
    this.broadcastToAgents(coordinationMessage);
  }

  executeSwarmCommand(command, params) {
    console.log(`[Orchestrator] Executing swarm command: ${command}`);
    
    // Send command to all active agents
    const swarmMessage = {
      type: 'swarm-command',
      command: command,
      params: params,
      timestamp: Date.now()
    };
    
    this.broadcastToAgents(swarmMessage);
  }

  handleFederationData(federationData) {
    console.log(`[Orchestrator] Handling federation data from ${federationData.sourceAgent}`);
    
    // Share with other agents for learning
    const shareMessage = {
      type: 'federation-share',
      data: federationData,
      source: federationData.sourceAgent,
      timestamp: Date.now()
    };
    
    this.broadcastToAgents(shareMessage);
  }

  broadcastToAgents(message, excludeWs = null) {
    if (this.websocketServer) {
      this.websocketServer.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === client.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  /**
   * Launch an agent with the specified profile
   */
  launchAgent(profileId, customConfig = {}) {
    if (!this.config.profiles[profileId]) {
      throw new Error(`Unknown agent profile: ${profileId}`);
    }

    const profile = { ...this.config.profiles[profileId], ...customConfig };
    
    // Create agent configuration
    const agentArgs = [
      `--profile=${profileId}`,
      `--port=${profile.port}`,
      `--mode=${profile.mode}`
    ];

    // Determine which script to run based on mode
    let scriptName;
    switch (profile.mode) {
      case 'background':
        scriptName = 'start-background-agent.js';
        break;
      case 'cloud':
        scriptName = 'start-cloud-agent.js';
        break;
      case 'local':
      default:
        scriptName = 'start-mock-server.js';
        break;
    }

    // Spawn the agent process
    const childProcess = spawn('node', [scriptName, ...agentArgs], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: { 
        ...process.env, 
        AGENT_PROFILE: profileId, 
        AGENT_PORT: profile.port,
        ...customConfig
      }
    });

    // Track the agent
    const agentInfo = {
      id: profile.id,
      name: profile.name,
      mode: profile.mode,
      port: profile.port,
      process: childProcess,
      status: 'starting',
      lastPing: Date.now(),
      profile: profile
    };

    this.agents.set(profile.id, agentInfo);
    
    // Handle process events
    childProcess.stdout.on('data', (data) => {
      console.log(`[Agent ${profile.id}] stdout:`, data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`[Agent ${profile.id}] stderr:`, data.toString());
    });

    childProcess.on('close', (code) => {
      console.log(`[Agent ${profile.id}] process exited with code ${code}`);
      const agent = this.agents.get(profile.id);
      if (agent) {
        agent.status = 'stopped';
      }
    });

    console.log(`[Orchestrator] Launched agent: ${profile.name} (${profile.id}) on port ${profile.port}`);
    
    return agentInfo;
  }

  /**
   * Start the orchestration system
   */
  async start() {
    if (this.isRunning) {
      console.log('[Orchestrator] Already running');
      return;
    }

    await this.initialize();
    
    // Start timers for orchestration
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.orchestration.heartbeatInterval);

    this.coordinationTimer = setInterval(() => {
      this.checkCoordinationNeeds();
    }, this.config.orchestration.coordinationInterval);

    this.syncTimer = setInterval(() => {
      this.syncAgentStates();
    }, this.config.orchestration.syncInterval);

    this.isRunning = true;
    console.log('[Orchestrator] Started successfully on port 3101');
  }

  /**
   * Stop the orchestration system
   */
  stop() {
    if (!this.isRunning) {
      console.log('[Orchestrator] Not running');
      return;
    }

    // Clear timers
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.coordinationTimer) clearInterval(this.coordinationTimer);
    if (this.syncTimer) clearInterval(this.syncTimer);

    // Stop all agents
    for (const [agentId, agent] of this.agents) {
      if (agent.process && !agent.process.killed) {
        agent.process.kill();
      }
    }

    // Close WebSocket server
    if (this.websocketServer) {
      this.websocketServer.close();
    }

    this.isRunning = false;
    console.log('[Orchestrator] Stopped successfully');
  }

  sendHeartbeat() {
    const heartbeat = {
      type: 'orchestrator-heartbeat',
      timestamp: Date.now(),
      activeAgents: this.agents.size
    };
    
    this.broadcastToAgents(heartbeat);
  }

  checkCoordinationNeeds() {
    // Check if any agents need coordination
    const activeAgents = Array.from(this.agents.values()).filter(a => a.status === 'active');
    
    if (activeAgents.length > 1) {
      // Multiple agents active, potential for coordination
      console.log(`[Orchestrator] Coordination check: ${activeAgents.length} agents active`);
    }
  }

  syncAgentStates() {
    // Sync agent states to persistent memory
    const states = {};
    for (const [agentId, agent] of this.agents) {
      states[agentId] = {
        status: agent.status,
        lastPing: agent.lastPing,
        profile: agent.profile
      };
    }
    
    this.persistentMemory.set('agent_states', states);
    console.log('[Orchestrator] Agent states synced to persistent memory');
  }

  /**
   * Get status of all managed agents
   */
  getAgentStatus() {
    const status = {};
    for (const [agentId, agent] of this.agents) {
      status[agentId] = {
        id: agent.id,
        name: agent.name,
        mode: agent.mode,
        status: agent.status,
        lastPing: agent.lastPing,
        profile: agent.profile
      };
    }
    return status;
  }
}

export default AgentOrchestrator;