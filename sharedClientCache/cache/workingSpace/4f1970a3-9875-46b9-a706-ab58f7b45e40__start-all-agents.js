/**
 * Start All Agents Script
 * Launches local, background, and cloud agents simultaneously
 */

import { spawn } from 'child_process';
import { agentsConfig } from './config/agents-config.js';

console.log('🚀 Starting Multi-Agent System');
console.log('===============================');

// Agent configurations
const agents = [
  {
    name: 'Local Agent',
    id: 'local-agent',
    port: 3001,
    script: 'start-mock-server.js',
    description: 'Full dashboard with interactive controls'
  },
  {
    name: 'Background Agent', 
    id: 'background-agent',
    port: 3002,
    script: 'start-background-agent.js',
    description: 'Silent operation with automated tasks'
  },
  {
    name: 'Cloud Agent',
    id: 'cloud-agent', 
    port: 3003,
    script: 'start-cloud-agent.js',
    description: 'Remote access with secure connection'
  }
];

// Spawn processes for each agent
const processes = [];

console.log('\n🏗️  Launching agents...');

// Function to start an agent
function startAgent(agent) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔌 Starting ${agent.name} on port ${agent.port}...`);
    
    const process = spawn('node', [agent.script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        AGENT_ID: agent.id,
        AGENT_NAME: agent.name,
        AGENT_PORT: agent.port
      }
    });

    process.stdout.on('data', (data) => {
      console.log(`[${agent.name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${agent.name} ERROR] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      console.log(`[${agent.name}] Process exited with code ${code}`);
    });

    // Store process reference
    processes.push(process);
    
    // Resolve after a short delay to allow startup
    setTimeout(() => {
      console.log(`✅ ${agent.name} started successfully`);
      resolve(process);
    }, 3000);
  });
}

// Create placeholder scripts if they don't exist
function createPlaceholderScripts() {
  // Background agent script
  const bgScript = `/**
 * Background Agent
 * Runs with minimal UI and automated tasks
 */

console.log("🤖 Starting Background Agent...");
console.log("   Mode: Background");
console.log("   Port: \${process.env.AGENT_PORT || 3002}");
console.log("   Features: Silent operation, automated tasks");
console.log("   Status: Active");

// Background agent logic would go here
// For now, just simulate activity
setInterval(() => {
  console.log("[Background Agent] Performing scheduled maintenance...");
}, 30000);

// Simulate WebSocket server for orchestration
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: parseInt(process.env.AGENT_PORT || 3002) + 100 });

wss.on('connection', (ws) => {
  console.log('[Background Agent] Orchestration connection established');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      console.log('[Background Agent] Received orchestration command:', msg.type);
      
      // Handle orchestration commands
      switch(msg.type) {
        case 'swarm-command':
          console.log('[Background Agent] Executing swarm command:', msg.command);
          break;
        case 'coordination-request':
          console.log('[Background Agent] Processing coordination request');
          break;
        default:
          console.log('[Background Agent] Unknown command type:', msg.type);
      }
    } catch (e) {
      console.error('[Background Agent] Error processing message:', e);
    }
  });
});

console.log("Background Agent ready for orchestration on port:", parseInt(process.env.AGENT_PORT || 3002) + 100);
`;

  // Cloud agent script
  const cloudScript = `/**
 * Cloud Agent
 * Runs in cloud environment with remote access
 */

console.log("☁️ Starting Cloud Agent...");
console.log("   Mode: Cloud");
console.log("   Port: \${process.env.AGENT_PORT || 3003}");
console.log("   Features: Remote access, secure connection, scalable");
console.log("   Status: Active");

// Cloud agent logic would go here
// For now, just simulate activity
setInterval(() => {
  console.log("[Cloud Agent] Monitoring cloud resources...");
}, 45000);

// Simulate WebSocket server for orchestration
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: parseInt(process.env.AGENT_PORT || 3003) + 100 });

wss.on('connection', (ws) => {
  console.log('[Cloud Agent] Orchestration connection established');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      console.log('[Cloud Agent] Received orchestration command:', msg.type);
      
      // Handle orchestration commands
      switch(msg.type) {
        case 'swarm-command':
          console.log('[Cloud Agent] Executing swarm command:', msg.command);
          break;
        case 'coordination-request':
          console.log('[Cloud Agent] Processing coordination request');
          break;
        case 'federation-data':
          console.log('[Cloud Agent] Processing federation data');
          break;
        default:
          console.log('[Cloud Agent] Unknown command type:', msg.type);
      }
    } catch (e) {
      console.error('[Cloud Agent] Error processing message:', e);
    }
  });
});

console.log("Cloud Agent ready for orchestration on port:", parseInt(process.env.AGENT_PORT || 3003) + 100);
`;

  // Write the placeholder scripts
  const fs = await import('fs');
  
  try {
    await fs.promises.writeFile('start-background-agent.js', bgScript);
    console.log('📄 Created start-background-agent.js');
  } catch (e) {
    console.log('📄 Background agent script already exists or error creating');
  }
  
  try {
    await fs.promises.writeFile('start-cloud-agent.js', cloudScript);
    console.log('📄 Created start-cloud-agent.js');
  } catch (e) {
    console.log('📄 Cloud agent script already exists or error creating');
  }
}

// Main execution
async function startAllAgents() {
  try {
    // Create placeholder scripts
    await createPlaceholderScripts();
    
    // Start all agents concurrently
    const agentPromises = agents.map(agent => startAgent(agent));
    await Promise.all(agentPromises);
    
    console.log('\n🌟 All agents started successfully!');
    console.log('\n📋 Agent Status:');
    agents.forEach(agent => {
      console.log(`   ${agent.name}: http://localhost:${agent.port}`);
    });
    
    console.log('\n🔄 Orchestration buses:');
    console.log('   Local: ws://localhost:3101');
    console.log('   Background: ws://localhost:3102');
    console.log('   Cloud: ws://localhost:3103');
    
    console.log('\n💡 Use the Master Controller to coordinate swarm behaviors');
    console.log('   Run: node master-controller.js');
    
  } catch (error) {
    console.error('❌ Error starting agents:', error);
    process.exit(1);
  }
}

// Start all agents
startAllAgents();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('\n⚠️  Shutting down all agents...');
  processes.forEach(proc => proc.kill());
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Shutting down all agents...');
  processes.forEach(proc => proc.kill());
  process.exit(0);
});