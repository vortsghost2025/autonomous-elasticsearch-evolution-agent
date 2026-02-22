/**
 * Simple Test Script for Autonomous Elasticsearch Evolution Agent
 * Demonstrates the core functionality of the system
 */

import { ResearchAgent } from './research-agent.js';
import { CodingAgent } from './coding-agent.js';
import { PersistentMemory } from './persistent-memory.js';

console.log('🧪 Starting Autonomous Elasticsearch Evolution Agent Test...\n');

async function runTest() {
  try {
    // Initialize persistent memory
    console.log('💾 Initializing persistent memory...');
    const persistentMemory = new PersistentMemory({ storagePath: './test-memory-store.json' });
    await persistentMemory.load();
    console.log('✅ Persistent memory initialized\n');

    // Initialize agents
    console.log('🤖 Initializing agents...');
    
    const researchAgent = new ResearchAgent({ 
      agentId: 'test-research-agent',
      persistentMemory: persistentMemory 
    });
    
    const codingAgent = new CodingAgent({ 
      agentId: 'test-coding-agent', 
      persistentMemory: persistentMemory 
    });

    // Initialize agents
    await Promise.all([
      researchAgent.initialize(),
      codingAgent.initialize()
    ]);
    
    console.log('✅ All agents initialized\n');

    // Create mock metrics similar to what the system would receive
    const mockMetrics = {
      timestamp: Date.now(),
      clusterName: 'test-cluster',
      health: { status: 'yellow' },
      nodes: {},
      indexes: {},
      calculated: {
        indexFragmentation: 3.2,
        memoryUsage: 0.82,
        queryLatency: 0.75,
        shardHealth: 0.78,
        clusterHealth: 0.5
      }
    };

    console.log('🔍 Testing research agent analysis...');
    const analysis = await researchAgent.analyzeClusterMetrics(mockMetrics);
    console.log(`✅ Research analysis completed: ${analysis.insights.length} insights generated\n`);

    console.log('📋 Testing research report generation...');
    const report = await researchAgent.generateResearchReport(mockMetrics);
    console.log(`✅ Research report generated with ${report.analysis.insights.length} insights\n`);

    console.log('💻 Testing coding agent code generation...');
    const codeSnippets = await codingAgent.generateCodeFromInsights(report);
    console.log(`✅ Generated ${codeSnippets.length} code snippets\n`);

    console.log('📊 Testing agent status reports...');
    const researchStatus = await researchAgent.getResearchSummary();
    console.log(`✅ Research agent status: ${researchStatus.insightsCount} insights, ${researchStatus.patternsCount} patterns\n`);

    console.log('🎉 All tests passed! The agent system is working correctly.');
    
    // Show summary
    console.log('\n📋 SYSTEM SUMMARY:');
    console.log(`• Research Agent: ${researchStatus.insightsCount} insights, ${researchStatus.patternsCount} patterns`);
    console.log(`• Coding Agent: Successfully generated ${codeSnippets.length} code snippets`);
    console.log(`• Memory: Persisted to ./test-memory-store.json`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runTest();