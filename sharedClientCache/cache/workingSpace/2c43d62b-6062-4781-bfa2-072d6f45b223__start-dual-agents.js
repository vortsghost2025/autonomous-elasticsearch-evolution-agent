/**
 * Startup script for Dual-Agent Research-Validation System
 * Launches both research and validation agents independently
 */

import { spawn } from 'child_process';
import { ResearchValidationSystem } from './research-validation-system.js';
import { PersistentMemory } from './persistent-memory.js';

console.log('🚀 Starting Dual-Agent Research-Validation System');
console.log('==================================================');

// Create persistent memory instance
const persistentMemory = new PersistentMemory({ 
  storagePath: './dual-agent-memory.json' 
});

// Initialize the research-validation system
const researchValidationSystem = new ResearchValidationSystem({
  persistentMemory: persistentMemory
});

async function startSystem() {
  try {
    // Initialize the system
    await researchValidationSystem.initialize();
    
    // Start monitoring the system
    setInterval(() => {
      console.log('\n📊 System Status:', researchValidationSystem.getStatus());
    }, 30000);
    
    // Example usage - simulate cluster metrics
    const mockClusterMetrics = {
      health: { status: 'yellow' },
      nodes: { count: 3, cpuUsage: 0.65 },
      indexes: { count: 15, size: '2.3TB' },
      shards: { total: 120, unassigned: 5 }
    };
    
    // Run research-validation cycles periodically
    setInterval(async () => {
      try {
        const results = await researchValidationSystem.executeCycle(mockClusterMetrics);
        console.log('\n✅ Research-Validation Cycle Completed:');
        console.log('   Research Findings:', results.originalFindings);
        console.log('   Validation Status:', results.status);
      } catch (error) {
        console.error('❌ Cycle execution failed:', error);
      }
    }, 60000); // Every minute
    
    console.log('✅ Dual-agent system started successfully');
    
  } catch (error) {
    console.error('❌ Failed to start dual-agent system:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Received SIGINT, shutting down...');
  await researchValidationSystem.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Received SIGTERM, shutting down...');
  await researchValidationSystem.shutdown();
  process.exit(0);
});

// Start the system
startSystem();