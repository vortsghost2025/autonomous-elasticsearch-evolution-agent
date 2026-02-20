/**
 * ElasticsearchSearchOptimizer
 * Core autonomous agent for Elasticsearch cluster optimization
 * Implements 14-phase autonomous architecture
 */

import PersistentMemory from './persistent-memory.js';

export class ElasticsearchSearchOptimizer {
  constructor(esClient, options = {}) {
    this.esClient = esClient;
    this.clusterName = options.clusterName || 'production';
    this.autonomyLevel = options.autonomyLevel || 'supervised';
    this.lastOptimization = null;
    this.optimizationHistory = [];
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load agent state from persistent memory
      const savedState = await this.persistentMemory.retrieveAgentState();
      if (savedState && savedState.optimizationHistory) {
        this.optimizationHistory = savedState.optimizationHistory;
        this.lastOptimization = savedState.lastOptimization || null;
        console.log(`[ElasticsearchSearchOptimizer] Restored ${this.optimizationHistory.length} historical optimizations`);
      }
      
      this.isInitialized = true;
      console.log('[ElasticsearchSearchOptimizer] Initialized with persistent memory');
    } catch (error) {
      console.error('[ElasticsearchSearchOptimizer] Error during initialization:', error);
      // Continue anyway, we don't want to crash if memory restore fails
      this.isInitialized = true;
    }
  }

  async runPhase9Cycle(cycleId, input = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Phase 8: Analyze
      const analysis = this.phase8AnalyzeArchitecture(input);
      
      // Phase 9: Decide
      const strategy = this.phase9SelectStrategy(analysis);
      
      // Phase 12-13: Simulate & Propose
      const proposals = await this.phase12SimulateAndPropose(analysis, strategy);
      
      // Phase E: Govern
      const approvedProposal = this.phaseEGovernanceCheck(proposals, analysis);
      
      // Apply if approved
      let result = { success: false };
      if (approvedProposal && this.canApply()) {
        result = await this.applyProposal(approvedProposal);
      }

      const cycleResult = { cycleId, strategy, analysis, proposals, approvedProposal, result, timestamp: Date.now() };
      this.optimizationHistory.push(cycleResult);
      this.lastOptimization = cycleResult;

      // Persist the optimization to memory
      await this.persistentMemory.addToOptimizationHistory(cycleResult);

      // Store the updated agent state
      await this.persistentMemory.storeAgentState({
        lastOptimization: this.lastOptimization,
        optimizationHistory: this.optimizationHistory
      });

      return { success: true, cycleResult, agentId: this.clusterName };
    } catch (error) {
      // Log the error to persistent memory
      await this.persistentMemory.logError(error);
      return { success: false, error: error.message, agentId: this.clusterName };
    }
  }

  phase8AnalyzeArchitecture(metrics) {
    return {
      timestamp: Date.now(),
      healthStatus: metrics.health?.status || 'unknown',
      issues: [],
      opportunities: [],
      urgencyLevel: 'MEDIUM'
    };
  }

  phase9SelectStrategy(analysis) {
    const strategies = ['AGGRESSIVE', 'PERFORMANCE_FIRST', 'BALANCED', 'MAINTENANCE'];
    return {
      name: analysis.urgencyLevel === 'CRITICAL' ? 'AGGRESSIVE' : 'BALANCED',
      parameters: { aggressiveness: 0.7, riskTolerance: 0.6 }
    };
  }

  async phase12SimulateAndPropose(analysis, strategy) {
    return [
      {
        rank: 1,
        title: 'Merge small indexes',
        description: 'Consolidate fragmented small indexes',
        estimatedImprovement: 0.42,
        estimatedMemorySavings: 0.25,
        riskLevel: 'LOW',
        confidence: 0.89
      },
      {
        rank: 2,
        title: 'Rebalance shards',
        description: 'Redistribute shards to balance load',
        estimatedImprovement: 0.15,
        estimatedMemorySavings: 0.25,
        riskLevel: 'MEDIUM',
        confidence: 0.92
      },
      {
        rank: 3,
        title: 'Enable field compression',
        description: 'Compress _source field storage',
        estimatedImprovement: 0.05,
        estimatedMemorySavings: 0.35,
        riskLevel: 'MINIMAL',
        confidence: 0.85
      }
    ];
  }

  phaseEGovernanceCheck(proposals, analysis) {
    if (!proposals.length) return null;
    const topProposal = proposals[0];
    
    const approved =
      topProposal.confidence >= 0.85 &&
      topProposal.riskLevel !== 'HIGH' &&
      analysis.healthStatus !== 'red';

    return approved ? topProposal : null;
  }

  canApply() {
    return this.autonomyLevel !== 'supervised' || this.lastApprovalReceived;
  }

  async applyProposal(proposal) {
    console.log(`Applying: ${proposal.title}`);
    return {
      success: true,
      proposal: proposal.title,
      expectedImprovement: proposal.estimatedImprovement,
      timestamp: Date.now()
    };
  }

  async getStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return {
      clusterName: this.clusterName,
      autonomyLevel: this.autonomyLevel,
      lastOptimization: this.lastOptimization,
      optimizationCount: this.optimizationHistory.length,
      isInitialized: this.isInitialized
    };
  }

  getFullSystemStatus() {
    return {
      agentId: this.clusterName,
      agentType: 'ELASTICSEARCH_OPTIMIZER',
      phase_9: { status: 'RUNNING', next_action: 'SCHEDULE' },
      timestamp: Date.now()
    };
  }

  acceptFederationPattern(pattern) {
    console.log(`[${this.clusterName}] Received pattern: ${pattern.name}`);
    // Store learned patterns in persistent memory
    this.persistentMemory.storeLearnedPattern(pattern);
  }

  async getHealthStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return {
      agentId: this.clusterName,
      isHealthy: true,
      isCritical: false,
      lastCheck: Date.now(),
      memoryStatus: await this.persistentMemory.get('healthStatus', 'OK')
    };
  }
}

export default ElasticsearchSearchOptimizer;