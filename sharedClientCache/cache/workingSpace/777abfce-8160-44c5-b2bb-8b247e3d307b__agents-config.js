/**
 * Configuration for Multi-Agent System
 * Allows management of multiple agents running in different modes
 */

export const agentsConfig = {
  // Define different agent profiles
  profiles: {
    local: {
      id: 'local-agent',
      name: 'Local Agent',
      mode: 'local',
      port: 3001,
      description: 'Runs locally with full dashboard access',
      features: ['dashboard', 'realtime-monitoring', 'interactive-controls'],
      websocketUrl: 'ws://localhost:3001/ws',
      httpUrl: 'http://localhost:3001'
    },
    background: {
      id: 'background-agent',
      name: 'Background Agent',
      mode: 'background',
      port: 3002,
      description: 'Runs in background with minimal UI',
      features: ['silent-operation', 'low-resource', 'automated-tasks'],
      websocketUrl: 'ws://localhost:3002/ws',
      httpUrl: 'http://localhost:3002'
    },
    cloud: {
      id: 'cloud-agent',
      name: 'Cloud Agent',
      mode: 'cloud',
      port: 3003,
      description: 'Runs in cloud environment with remote access',
      features: ['remote-access', 'secure-connection', 'scalable'],
      websocketUrl: 'wss://your-cloud-domain.com/ws',
      httpUrl: 'https://your-cloud-domain.com'
    }
  },
  
  // Default settings for all agents
  defaults: {
    clusterName: 'multi-agent-cluster',
    autonomyLevel: 'supervised',
    collectionInterval: 60000, // 1 minute
    simulationCount: 10,
    maxHistory: 1000,
    memoryPath: './memory-store.json'
  },
  
  // Orchestration settings
  orchestration: {
    masterAgent: { port: 3001 }, // Primary agent that coordinates
    coordinationInterval: 30000, // 30 seconds
    heartbeatInterval: 10000, // 10 seconds
    syncInterval: 60000, // 1 minute
    maxAgents: 10,
    enableSwarm: true,
    enableFederation: true
  },
  
  // Communication settings
  communication: {
    enableBroadcast: true,
    enableDirectMessaging: true,
    enableGroupMessaging: true,
    messageRetentionHours: 24,
    maxMessageSize: 1024 * 1024 // 1MB
  },
  
  // Resource allocation
  resources: {
    local: {
      cpuLimit: '50%',
      memoryLimit: '512MB',
      diskSpace: '1GB'
    },
    background: {
      cpuLimit: '20%',
      memoryLimit: '256MB',
      diskSpace: '512MB'
    },
    cloud: {
      cpuLimit: '80%',
      memoryLimit: '2GB',
      diskSpace: '10GB'
    }
  }
};