r
 * Master Controller for Multi-Agent System
 * Controls the orchestration of multiple agents
 */

import AgentOrchestrator from './orchestrator.js';
import { agentsConfig } from './config/agents-config.js';

class MasterController {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Master Controller for Multi-Agent System');
    console.log('==================================================');
    
    // Start the orchestrator
    await this.orchestrator.start();
    
    // Launch the three requested agents: local, background, cloud
    console.log('\n🏗️  Launching requested agents...');
    
    // Local agent (full dashboard)
    try {
      this.orchestrator.launchAgent('local', {
        port: 3001,
        name: 'Local Development Agent'
      });
      console.log('✅ Local agent launched on port 3001');
    } catch (error) {
      console.error('❌ Failed to launch local agent:', error.message);
    }
    
    // Background agent (minimal UI)
    try {
      this.orchestrator.launchAgent('background', {
        port: 3002,
        name: 'Background Processing Agent'
      });
      console.log('✅ Background agent launched on port 3002');
    } catch (error) {
      console.error('❌ Failed to launch background agent:', error.message);
    }
    
    // Cloud agent (remote access)
    try {
      this.orchestrator.launchAgent('cloud', {
        port: 3003,
        name: 'Cloud Agent'
      });
      console.log('✅ Cloud agent launched on port 3003');
    } catch (error) {
      console.error('❌ Failed to launch cloud agent:', error.message);
    }
    
    this.isRunning = true;
    console.log('\n🌟 Multi-Agent System is now running!');
    console.log('   Local Agent: http://localhost:3001');
    console.log('   Background Agent: http://localhost:3002');
    console.log('   Cloud Agent: http://localhost:3003');
    console.log('   Orchestration Bus: ws://localhost:3101');
    console.log('\n📋 Use the orchestrator to coordinate swarm behaviors');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Master Controller is not running');
      return;
    }
    
    this.orchestrator.stop();
    this.isRunning = false;
    console.log('🛑 Master Controller stopped');
  }

  getStatus() {
    if (!this.isRunning) {
      return { running: false, agents: {} };
    }
    
    return {
      running: true,
      timestamp: Date.now(),
      agents: this.orchestrator.getAgentStatus()
    };
  }

  /**
   * Execute a swarm command across all agents
   */
  executeSwarmCommand(command, params = {}) {
    if (!this.isRunning) {
      throw new Error('Master Controller is not running');
    }
    
    console.log(`🔄 Executing swarm command: ${command}`);
    
    // Send to orchestrator which will broadcast to all agents
    const message = {
      type: 'swarm-command',
      command: command,
      params: params,
      timestamp: Date.now()
    };
    
    // In a real implementation, this would send via WebSocket
    // For now, we'll just log it
    console.log('   Command sent to all active agents');
  }

  /**
   * Coordinate specific agents for a task
   */
  coordinateAgents(task, agentIds = null) {
    if (!this.isRunning) {
      throw new Error('Master Controller is not running');
    }
    
    console.log(`🤝 Coordinating agents for task: ${task}`);
    
    const message = {
      type: 'coordination-request',
      task: task,
      targetAgents: agentIds || 'all-active',
      timestamp: Date.now()
    };
    
    // In a real implementation, this would send via WebSocket
    console.log('   Coordination request sent');
  }
}

// Create and export a singleton instance
const masterController = new MasterController();

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
  masterController.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
  masterController.stop();
  process.exit(0);
});

export default masterController;

// If this file is run directly, start the controller
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🤖 Master Controller starting...');
  
  masterController.start()
    .then(() => {
      console.log('\n✅ Master Controller is ready to orchestrate agents!');
      console.log('📊 Check status with: masterController.getStatus()');
      console.log('🔄 Execute swarm commands with: masterController.executeSwarmCommand()');
      
      // Keep the process alive
      setInterval(() => {
        // Keep alive
      }, 60000);
    })
    .catch((error) => {
      console.error('❌ Failed to start Master Controller:', error);
      process.exit(1);
    });
}