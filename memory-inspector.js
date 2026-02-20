/**
 * Memory Inspector Utility
 * A utility script to inspect the persistent memory contents
 */

import { PersistentMemory } from './persistent-memory.js';

async function inspectMemory() {
  console.log('🔍 Memory Inspector Utility');
  console.log('===========================');
  
  const memory = new PersistentMemory({ 
    storagePath: './memory-store.json' 
  });
  
  try {
    await memory.load();
    console.log('✅ Memory loaded successfully\n');
    
    // Get all keys
    const keys = await memory.keys();
    console.log(`📋 Found ${keys.length} items in memory:`);
    console.log(keys.map(k => `  • ${k}`).join('\n'));
    console.log('');
    
    // Display optimization history
    const optHistory = await memory.getOptimizationHistory();
    console.log(`📊 Optimization History (${optHistory.length} entries):`);
    if (optHistory.length > 0) {
      const recent = optHistory[optHistory.length - 1]; // Most recent
      console.log(`  Latest cycle: ${recent.cycleId}`);
      console.log(`  Strategy: ${recent.strategy?.name || 'N/A'}`);
      console.log(`  Success: ${recent.result?.success || 'N/A'}`);
      console.log(`  Timestamp: ${new Date(recent.timestamp).toISOString()}`);
    } else {
      console.log('  No optimization history found');
    }
    console.log('');
    
    // Display error log
    const errorLog = await memory.getErrorLog();
    console.log(`⚠️  Error Log (${errorLog.length} entries):`);
    if (errorLog.length > 0) {
      const recent = errorLog[errorLog.length - 1]; // Most recent
      console.log(`  Latest error: ${recent.message}`);
      console.log(`  Timestamp: ${new Date(recent.timestamp).toISOString()}`);
    } else {
      console.log('  No errors logged');
    }
    console.log('');
    
    // Display learned patterns
    const patterns = await memory.getLearnedPatterns();
    console.log(`🧠 Learned Patterns (${patterns.length} entries):`);
    if (patterns.length > 0) {
      patterns.forEach((pattern, idx) => {
        console.log(`  Pattern ${idx + 1}: ${pattern.name || pattern.title || 'Unknown'}`);
      });
    } else {
      console.log('  No learned patterns found');
    }
    console.log('');
    
    // Display metrics history count
    const metricsHistory = await memory.get('metricsHistory', []);
    console.log(`📈 Metrics History: ${metricsHistory.length} entries`);
    
  } catch (error) {
    console.error('❌ Error inspecting memory:', error.message);
  }
}

// Run if called directly
if (process.argv[1].endsWith('memory-inspector.js')) {
  inspectMemory().catch(console.error);
}

export { inspectMemory };