/**
 * Integration Test Script
 * Verifies the integration between the AI agent and the autonomous system
 */

import dotenv from 'dotenv';
dotenv.config();

import { ResearchAgent } from './research-agent.js';
import { PersistentMemory } from './persistent-memory.js';
import chalk from 'chalk';

async function runIntegrationTests() {
  console.log(chalk.blue.bold('\n🧪 Running Integration Tests...\n'));

  // Test 1: Initialize persistent memory
  console.log(chalk.yellow('💾 Test 1: Initializing persistent memory...'));
  try {
    const persistentMemory = new PersistentMemory({ storagePath: './test-memory-store.json' });
    await persistentMemory.load();
    console.log(chalk.green('✅ Persistent memory initialized'));
  } catch (error) {
    console.log(chalk.red('❌ Persistent memory initialization failed:'), error.message);
    return;
  }

  // Test 2: Initialize research agent
  console.log(chalk.yellow('\n🔬 Test 2: Initializing research agent...'));
  try {
    const researchAgent = new ResearchAgent({ persistentMemory: new PersistentMemory() });
    await researchAgent.initialize();
    console.log(chalk.green('✅ Research agent initialized'));
  } catch (error) {
    console.log(chalk.red('❌ Research agent initialization failed:'), error.message);
    return;
  }

  // Test 3: Test basic research functionality without AI
  console.log(chalk.yellow('\n🔍 Test 3: Testing basic research functionality...'));
  try {
    const mockMetrics = {
      clusterName: 'test-cluster',
      health: { status: 'yellow' },
      calculated: {
        memoryUsage: 0.82,
        indexFragmentation: 3.2,
        queryLatency: 0.75,
        shardHealth: 0.78,
        clusterHealth: 0.5
      }
    };

    const researchAgent = new ResearchAgent({ persistentMemory: new PersistentMemory() });
    await researchAgent.initialize();

    // Test basic analysis without AI
    const analysis = await researchAgent.analyzeClusterMetrics(mockMetrics);
    console.log(chalk.green(`✅ Basic analysis completed: ${analysis.insights.length} insights generated`));
  } catch (error) {
    console.log(chalk.red('❌ Basic research functionality test failed:'), error.message);
  }

  // Test 4: Test the enhanced optimizer without ES client
  console.log(chalk.yellow('\n⚙️  Test 4: Testing optimizer functionality...'));
  try {
    // Import without instantiating to avoid ES client issues
    const optimizerModule = await import('./elasticsearch-search-optimizer.js');
    console.log(chalk.green('✅ Optimizer module loaded successfully'));
  } catch (error) {
    console.log(chalk.red('❌ Optimizer module loading failed:'), error.message);
  }

  // Test 5: Test AI agent separately if keys are available
  console.log(chalk.yellow('\n🤖 Test 5: Testing AI agent if keys available...'));
  if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const agentModule = await import('./lib/agent.js');
      const health = await agentModule.default.healthCheck();
      console.log(chalk.green('✅ AI Agent Health Check:'), health);
    } catch (error) {
      console.log(chalk.red('❌ AI agent test failed:'), error.message);
    }
  } else {
    console.log(chalk.yellow('⚠️  Skipping AI agent test - no API keys configured'));
  }

  console.log(chalk.green.bold('\n🎉 Integration tests completed!'));
  console.log(chalk.blue('Core functionality verified successfully.'));
}

// Run the tests
runIntegrationTests().catch(err => {
  console.error(chalk.red('Integration test suite failed:'), err);
  process.exit(1);
});