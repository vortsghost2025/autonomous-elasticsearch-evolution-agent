/**
 * Master System Startup Script
 * Launches the complete multi-agent system with orchestration
 */

import { spawn } from 'child_process';
import { agentsConfig } from './config/agents-config.js';
import AgentOrchestrator from './orchestrator.js';

console.log('🚀 Starting Master Autonomous Elasticsearch Evolution System');
console.log('========================================================');

console.log('\n📋 System Overview:');
console.log('   • Local Agent: Full dashboard interface (port 3001)');
console.log('   • Background Agent: Silent operation (port 3002)');
console.log('   • Cloud Agent: Remote access (port 3003)');
console.log('   • Orchestration: Coordinated swarm behavior');
console.log('   • Federation: Cross-cluster pattern sharing');

// Global references to processes
let processes = [];
let orchestrator = null;

// Function to start the orchestrator
async function startOrchestrator() {
  console.log('\n🏗️  Starting Agent Orchestrator...');
  
  try {
    orchestrator = new AgentOrchestrator();
    await orchestrator.start();
    console.log('✅ Orchestrator started successfully');
    return orchestrator;
  } catch (error) {
    console.error('❌ Failed to start orchestrator:', error);
    throw error;
  }
}

// Function to start individual agents
function startAgent(name, script, port, envVars = {}) {
  console.log(`\n🔌 Starting ${name}...`);
  
  const agentProcess = spawn('node', [script], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { 
      ...process.env, 
      ...envVars,
      AGENT_PORT: port
    }
  });

  agentProcess.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  agentProcess.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });

  agentProcess.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });

  processes.push(agentProcess);
  console.log(`✅ ${name} started on port ${port}`);
  
  return agentProcess;
}

// Main execution function
async function startMasterSystem() {
  try {
    // Start orchestrator first
    await startOrchestrator();
    
    // Start agents sequentially to avoid conflicts
    console.log('\n🏗️  Launching agent fleet...');
    
    // Start local agent (full dashboard)
    startAgent(
      'Local Agent', 
      'start-mock-server.js', 
      3001, 
      { AGENT_TYPE: 'local', AGENT_PROFILE: 'local' }
    );
    
    // Small delay to ensure first agent starts
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start background agent
    startAgent(
      'Background Agent', 
      'start-background-agent.js', 
      3002, 
      { AGENT_TYPE: 'background', AGENT_PROFILE: 'background' }
    );
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start cloud agent
    startAgent(
      'Cloud Agent', 
      'start-cloud-agent.js', 
      3003, 
      { AGENT_TYPE: 'cloud', AGENT_PROFILE: 'cloud' }
    );
    
    // Wait a bit for all agents to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🌟 Master System Status:');
    console.log('   ✅ Local Agent: http://localhost:3001');
    console.log('   ✅ Background Agent: http://localhost:3002');
    console.log('   ✅ Cloud Agent: http://localhost:3003');
    console.log('   ✅ Orchestration Bus: ws://localhost:3101');
    console.log('   ✅ Multi-Agent Communication: ACTIVE');
    console.log('   ✅ Swarm Coordination: ENABLED');
    console.log('   ✅ Federation Sharing: CONFIGURED');
    
    console.log('\n🤖 System Capabilities:');
    console.log('   • Individual agent control via dashboard');
    console.log('   • Swarm command execution across all agents');
    console.log('   • Cross-agent coordination for complex tasks');
    console.log('   • Federated learning and pattern sharing');
    console.log('   • Centralized monitoring and management');
    
    console.log('\n💡 Usage Examples:');
    console.log('   • Visit http://localhost:3001 to access the main dashboard');
    console.log('   • Use the "Agent Controls" section to trigger actions');
    console.log('   • Use "Multi-Agent Orchestration" to coordinate agents');
    console.log('   • Send commands via the chat interface');
    console.log('   • Monitor all agents from a single interface');
    
    // Keep the main process alive
    setInterval(() => {
      // This keeps the master process alive
    }, 60000);
    
  } catch (error) {
    console.error('❌ Failed to start master system:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
  await shutdown();
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
  await shutdown();
});

async function shutdown() {
  console.log('🛑 Stopping all processes...');
  
  // Stop orchestrator
  if (orchestrator) {
    orchestrator.stop();
  }
  
  // Kill all spawned processes
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill();
    }
  });
  
  console.log('👋 All systems shut down');
  process.exit(0);
}

// Start the master system
startMasterSystem().catch(error => {
  console.error('Fatal error starting master system:', error);
  process.exit(1);
});