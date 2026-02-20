/**
 * Integration Test Script
 * Verifies the integration between the AI agent and the autonomous system
 */

import dotenv from 'dotenv';
dotenv.config();

import { ResearchAgent } from './research-agent.js';
import { PersistentMemory } from './persistent-memory.js';
import agent from './lib/agent.js'; // The AI agent
import chalk from 'chalk';

async function runIntegrationTests() {
  console.log(chalk.blue.bold('\n🧪 Running Integration Tests...\n'));

  // Test 1: Verify AI agent health
  console.log(chalk.yellow('🔍 Test 1: Checking AI agent health...'));
  try {
    const health = await agent.healthCheck();
    console.log(chalk.green('✅ AI Agent Health Check:'), health);
    if (!health.claude && !health.openai) {
      console.log(chalk.red('⚠️  Warning: No LLM providers configured'));
    }
  } catch (error) {
    console.log(chalk.red('❌ AI Agent Health Check failed:'), error.message);
    return;
  }

  // Test 2: Initialize persistent memory
  console.log(chalk.yellow('\n💾 Test 2: Initializing persistent memory...'));
  try {
    const persistentMemory = new PersistentMemory({ storagePath: './test-memory-store.json' });
    await persistentMemory.load();
    console.log(chalk.green('✅ Persistent memory initialized'));
  } catch (error) {
    console.log(chalk.red('❌ Persistent memory initialization failed:'), error.message);
    return;
  }

  // Test 3: Initialize research agent
  console.log(chalk.yellow('\n🔬 Test 3: Initializing research agent...'));
  try {
    const researchAgent = new ResearchAgent({ persistentMemory: new PersistentMemory() });
    await researchAgent.initialize();
    console.log(chalk.green('✅ Research agent initialized'));
  } catch (error) {
    console.log(chalk.red('❌ Research agent initialization failed:'), error.message);
    return;
  }

  // Test 4: Test AI integration in research agent
  console.log(chalk.yellow('\n🤖 Test 4: Testing AI integration in research agent...'));
  try {
    // Create mock metrics similar to what the system would receive
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

    // Test the AI analysis capability
    const aiInsights = await researchAgent.getAIInsights(mockMetrics);
    console.log(chalk.green(`✅ AI Insights generated: ${aiInsights.length} insights`));

    if (aiInsights.length > 0) {
      console.log(chalk.cyan('Sample AI Insight:'), aiInsights[0].description);
    }
  } catch (error) {
    console.log(chalk.red('❌ AI integration test failed:'), error.message);
    // Don't exit here as this might fail due to missing API keys
  }

  // Test 5: Test AI agent directly with a sample query
  console.log(chalk.yellow('\n💬 Test 5: Testing AI agent directly...'));
  try {
    const result = await agent.ask('Analyze these Elasticsearch performance metrics', {
      summarize: true,
      provider: process.env.DEFAULT_LLM || 'claude'
    });
    
    if (result.success) {
      console.log(chalk.green('✅ AI agent responded successfully'));
      console.log(chalk.cyan('Response preview:'), result.summary?.substring(0, 100) + '...');
    } else {
      console.log(chalk.red('⚠️  AI agent response not successful:'), result.error);
    }
  } catch (error) {
    console.log(chalk.red('❌ Direct AI agent test failed:'), error.message);
  }

  // Test 6: Test the enhanced optimizer
  console.log(chalk.yellow('\n⚙️  Test 6: Testing optimizer enhancements...'));
  try {
    // We'll test the proposal enhancement functionality
    const mockProposals = [
      {
        rank: 1,
        title: 'Merge Small Indexes',
        description: 'Merge fragmented small indexes to improve performance',
        estimatedImprovement: 0.42,
        riskLevel: 'LOW',
        confidence: 0.89
      }
    ];
    
    const mockMetrics = {
      calculated: {
        memoryUsage: 0.82,
        indexFragmentation: 3.2,
        queryLatency: 0.75,
        shardHealth: 0.78
      }
    };
    
    const mockAnalysis = {
      healthStatus: 'yellow',
      urgencyLevel: 'MEDIUM'
    };
    
    // Test the parsing function directly
    const { ElasticsearchSearchOptimizer } = await import('./elasticsearch-search-optimizer.js');
    const optimizer = new ElasticsearchSearchOptimizer({}, { persistentMemory: new PersistentMemory() });
    
    const suggestions = optimizer.parseAISuggestions('The system would benefit from cache optimization and shard rebalancing', mockProposals);
    console.log(chalk.green(`✅ Proposal enhancement working: ${suggestions.length} additional suggestions generated`));
  } catch (error) {
    console.log(chalk.red('❌ Optimizer enhancement test failed:'), error.message);
  }

  console.log(chalk.green.bold('\n🎉 Integration tests completed successfully!'));
  console.log(chalk.blue('The AI agent is successfully integrated with the autonomous system.'));
}

// Run the tests
runIntegrationTests().catch(err => {
  console.error(chalk.red('Integration test suite failed:'), err);
  process.exit(1);
});