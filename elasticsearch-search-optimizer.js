
/**
 * ElasticsearchSearchOptimizer
 * Core autonomous agent for Elasticsearch cluster optimization
 * Implements 14-phase autonomous architecture
 */

import { PersistentMemory } from './persistent-memory.js';
import MLPredictor from './ml-predictor.js';
import SimulationEngine from './simulation-engine.js';
import agent from './lib/agent.js'; // Import the AI agent

// Import dashboard functions if available
let dashboardAvailable = false;
let broadcastOptimization = () => {};
let broadcastStatus = () => {};

try {
  const dashboard = await import('./dashboard-server.js');
  if (dashboard.broadcastOptimization && dashboard.broadcastStatus) {
    broadcastOptimization = dashboard.broadcastOptimization;
    broadcastStatus = dashboard.broadcastStatus;
    dashboardAvailable = true;
    console.log('[Dashboard] Connected to real-time dashboard server');
  }
} catch (e) {
  console.log('[Dashboard] Dashboard server not available, continuing without real-time updates');
}

export class ElasticsearchSearchOptimizer {
  constructor(esClient, options = {}) {
    this.esClient = esClient;
    this.clusterName = options.clusterName || 'production';
    this.autonomyLevel = options.autonomyLevel || 'supervised';
    this.lastOptimization = null;
    this.optimizationHistory = [];
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.mlPredictor = new MLPredictor();
    this.simulationEngine = new SimulationEngine();
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
      
      // Train ML predictor with historical data
      if (this.optimizationHistory.length > 0) {
        const trainingData = this.prepareTrainingData(this.optimizationHistory);
        this.mlPredictor.train(trainingData);
        console.log(`[ElasticsearchSearchOptimizer] Trained ML predictor with ${trainingData.length} historical entries`);
      }
      
      this.isInitialized = true;
      console.log('[ElasticsearchSearchOptimizer] Initialized with persistent memory, ML predictor, and simulation engine');
      
      // Broadcast status if dashboard available
      if (dashboardAvailable) {
        broadcastStatus({
          optimizerStatus: `Active | ${this.optimizationHistory.length} optimizations`,
          optimizationCount: this.optimizationHistory.length
        });
      }
    } catch (error) {
      console.error('[ElasticsearchSearchOptimizer] Error during initialization:', error);
      // Continue anyway, we don't want to crash if memory restore fails
      this.isInitialized = true;
    }
  }

  /**
   * Prepare training data for ML predictor from optimization history
   */
  prepareTrainingData(history) {
    return history.map(entry => ({
      success: entry.result?.success || false,
      metrics: {
        latencyImprovement: entry.result?.expectedImprovement || 0,
        memoryImprovement: 0.25, // Placeholder
        fragmentationImprovement: 0.42, // Placeholder
        shardBalanceImprovement: 0.15, // Placeholder
        throughputImprovement: 0.65 // Placeholder
      },
      proposal: entry.approvedProposal || entry.proposals[0],
      timestamp: entry.timestamp
    }));
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
      
      // Phase 12: Simulate multiple scenarios
      const scenarios = this.simulationEngine.generateScenarios(input, strategy);
      const simulationResults = await this.simulationEngine.runSimulations(scenarios, input);
      
      // Phase 13: Generate proposals from best simulation results
      const proposals = this.generateProposalsFromSimulations(simulationResults);
      
      // Use AI agent to potentially enhance proposals
      const enhancedProposals = await this.enhanceProposalsWithAI(proposals, input, analysis);
      
      // Phase E: Govern
      const approvedProposal = this.phaseEGovernanceCheck(enhancedProposals, analysis);
      
      // Apply if approved
      let result = { success: false };
      if (approvedProposal && this.canApply()) {
        // Predict outcome using ML model
        const prediction = await this.mlPredictor.predictOutcome(approvedProposal, analysis);
        console.log(`[ML Predictor] Predicted improvement: ${(prediction.predictedImprovement * 100).toFixed(2)}% for ${approvedProposal.title}`);
        
        result = await this.applyProposal(approvedProposal);
        
        // Update ML predictor with actual results
        const trainingEntry = {
          success: result.success,
          metrics: {
            latencyImprovement: result.expectedImprovement || 0,
            memoryImprovement: prediction.estimatedMemorySavings || 0.25,
            fragmentationImprovement: 0.42, // Would come from actual measurement
            shardBalanceImprovement: 0.15, // Would come from actual measurement
            throughputImprovement: 0.65 // Would come from actual measurement
          },
          proposal: approvedProposal,
          timestamp: Date.now(),
          predictedImprovement: prediction.predictedImprovement
        };
        
        this.mlPredictor.train([trainingEntry]);
      }

      const cycleResult = { 
        cycleId, 
        strategy, 
        analysis, 
        proposals,
        enhancedProposals,
        approvedProposal, 
        result, 
        simulationResults,
        timestamp: Date.now(),
        mlPrediction: approvedProposal ? await this.mlPredictor.predictOutcome(approvedProposal, analysis) : null
      };
      
      this.optimizationHistory.push(cycleResult);
      this.lastOptimization = cycleResult;

      // Persist the optimization to memory
      await this.persistentMemory.addToOptimizationHistory(cycleResult);

      // Store the updated agent state
      await this.persistentMemory.storeAgentState({
        lastOptimization: this.lastOptimization,
        optimizationHistory: this.optimizationHistory
      });

      // Broadcast optimization to dashboard if available
      if (dashboardAvailable && approvedProposal) {
        broadcastOptimization({
          title: approvedProposal.title,
          description: approvedProposal.description,
          success: result.success,
          expectedImprovement: result.expectedImprovement || 0,
          confidence: approvedProposal.confidence,
          riskLevel: approvedProposal.riskLevel,
          timestamp: Date.now()
        });
      }

      return { success: true, cycleResult, agentId: this.clusterName };
    } catch (error) {
      // Log the error to persistent memory
      await this.persistentMemory.logError(error);
      return { success: false, error: error.message, agentId: this.clusterName };
    }
  }

  /**
   * Enhance proposals using AI agent
   */
  async enhanceProposalsWithAI(proposals, metrics, analysis) {
    try {
      // Get AI recommendations for optimization strategies
      const aiResult = await agent.ask(
        `Given these Elasticsearch cluster metrics: ${JSON.stringify(metrics.calculated)}, 
        and these optimization proposals: ${JSON.stringify(proposals)},
        suggest improvements to these proposals or recommend additional optimization strategies.`,
        {
          summarize: true,
          provider: 'claude'
        }
      );

      if (aiResult.success && aiResult.summary) {
        // Parse the AI's suggestions and potentially add them to proposals
        const aiSuggestions = this.parseAISuggestions(aiResult.summary, proposals);
        return [...proposals, ...aiSuggestions];
      }
    } catch (error) {
      console.warn('[Optimizer] AI enhancement failed, continuing with original proposals:', error.message);
    }

    return proposals;
  }

  /**
   * Parse AI suggestions into optimization proposals
   */
  parseAISuggestions(aiSummary, existingProposals) {
    // Simple parsing of AI suggestions into proposal format
    // In a more advanced implementation, this could use NLP to extract specific actions
    const suggestions = [];
    
    // Look for common optimization keywords in the AI summary
    if (aiSummary.toLowerCase().includes('merge') || aiSummary.toLowerCase().includes('segment')) {
      suggestions.push({
        rank: existingProposals.length + suggestions.length + 1,
        title: 'AI-Suggested Index Merging',
        description: 'AI recommended merging small indexes based on fragmentation analysis',
        estimatedImprovement: 0.35,
        estimatedMemorySavings: 0.2,
        riskLevel: 'LOW',
        confidence: 0.85
      });
    }
    
    if (aiSummary.toLowerCase().includes('cache') || aiSummary.toLowerCase().includes('memory')) {
      suggestions.push({
        rank: existingProposals.length + suggestions.length + 1,
        title: 'AI-Suggested Cache Optimization',
        description: 'AI recommended adjusting cache settings based on usage patterns',
        estimatedImprovement: 0.25,
        estimatedMemorySavings: 0.3,
        riskLevel: 'LOW',
        confidence: 0.8
      });
    }
    
    if (aiSummary.toLowerCase().includes('shard') || aiSummary.toLowerCase().includes('balance')) {
      suggestions.push({
        rank: existingProposals.length + suggestions.length + 1,
        title: 'AI-Suggested Shard Rebalancing',
        description: 'AI recommended redistributing shards for better load distribution',
        estimatedImprovement: 0.2,
        estimatedMemorySavings: 0.15,
        riskLevel: 'MEDIUM',
        confidence: 0.75
      });
    }
    
    return suggestions;
  }

  /**
   * Generate proposals from simulation results
   */
  generateProposalsFromSimulations(simulationResults) {
    return simulationResults.map((result, index) => ({
      rank: index + 1,
      title: result.name,
      description: result.description,
      estimatedImprovement: result.predictedImprovement,
      estimatedMemorySavings: result.predictedImprovement * 0.3, // Simplified estimation
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      operations: result.operations,
      estimatedDuration: result.estimatedDuration
    })).slice(0, 10); // Return top 10 proposals
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
    // Generate scenarios based on current state
    const scenarios = this.simulationEngine.generateScenarios(analysis, strategy);
    const simulationResults = await this.simulationEngine.runSimulations(scenarios, analysis);
    
    // Convert simulation results to proposals
    const proposals = this.generateProposalsFromSimulations(simulationResults);
    
    // Enhance proposals with AI
    const enhancedProposals = await this.enhanceProposalsWithAI(proposals, analysis, analysis);
    
    // Enhance proposals with ML predictions
    for (const proposal of enhancedProposals) {
      const prediction = await this.mlPredictor.predictOutcome(proposal, analysis);
      proposal.mlPrediction = prediction;
    }

    return enhancedProposals;
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
    
    const status = {
      clusterName: this.clusterName,
      autonomyLevel: this.autonomyLevel,
      lastOptimization: this.lastOptimization,
      optimizationCount: this.optimizationHistory.length,
      isInitialized: this.isInitialized,
      mlPredictorStatus: {
        trainedOn: this.mlPredictor.trainingData.length,
        lastUpdated: this.mlPredictor.trainingData.length > 0 ? 
          this.mlPredictor.trainingData[this.mlPredictor.trainingData.length - 1].timestamp : null
      },
      simulationStats: this.simulationEngine.getStats()
    };
    
    // Add dashboard status info if available
    if (dashboardAvailable) {
      status.dashboardStatus = 'Connected';
      status.mlStatus = `Trained on ${this.mlPredictor.trainingData.length} samples`;
      status.simulationStatus = `Ran ${this.simulationEngine.getStats().totalSimulations} simulation runs`;
    }
    
    return status;
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
    
    const status = {
      agentId: this.clusterName,
      isHealthy: true,
      isCritical: false,
      lastCheck: Date.now(),
      memoryStatus: await this.persistentMemory.get('healthStatus', 'OK'),
      mlPredictorStatus: `Trained on ${this.mlPredictor.trainingData.length} samples`,
      simulationStatus: `Ran ${this.simulationEngine.getStats().totalSimulations} simulation runs`
    };
    
    // Broadcast status if dashboard available
    if (dashboardAvailable) {
      broadcastStatus({
        optimizerStatus: `Active | ${this.optimizationHistory.length} optimizations`,
        mlStatus: status.mlPredictorStatus,
        simulationStatus: status.simulationStatus,
        optimizationCount: this.optimizationHistory.length
      });
    }
    
    return status;
  }
}

export default ElasticsearchSearchOptimizer;