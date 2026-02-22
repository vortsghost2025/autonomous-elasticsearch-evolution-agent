/**
 * Research-Validation System
 * Implements dual-agent architecture with separated research and validation processes
 * Ensures double verification through independent analysis
 */

import { ResearchAgent } from './research-agent.js';
import { CodingAgent } from './coding-agent.js';
import { PersistentMemory } from './persistent-memory.js';
import { MessagePasser } from './message-passers.js';

class ResearchValidationSystem {
  constructor(options = {}) {
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.researchAgent = new ResearchAgent({
      agentId: 'research-agent',
      persistentMemory: this.persistentMemory,
      llmConfig: {
        model: 'claude-sonnet',
        temperature: 0.7,
        maxTokens: 2048
      }
    });
    
    this.validationAgent = new ResearchAgent({
      agentId: 'validation-agent',
      persistentMemory: this.persistentMemory,
      llmConfig: {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 1536
      }
    });
    
    this.messagePasser = new MessagePasser();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize both agents separately
      await Promise.all([
        this.researchAgent.initialize(),
        this.validationAgent.initialize()
      ]);
      
      // Set up message passing between agents
      this.setupMessageHandlers();
      
      // Load historical data
      await this.loadHistoricalData();
      
      this.isInitialized = true;
      console.log('[ResearchValidationSystem] Dual-agent system initialized');
    } catch (error) {
      console.error('[ResearchValidationSystem] Initialization failed:', error);
      throw error;
    }
  }

  setupMessageHandlers() {
    // Research agent sends findings to validation agent
    this.messagePasser.subscribe('research-findings', async (message) => {
      const researchResults = message.content;
      
      // Send to validation agent for independent verification
      await this.validationAgent.analyzeFindings(researchResults);
      
      // Broadcast validation results
      this.messagePasser.sendMessage({
        type: 'validation-results',
        sender: 'validation-agent',
        receiver: 'research-agent',
        content: {
          status: 'verified',
          timestamp: Date.now(),
          originalFindings: researchResults,
          validationAnalysis: await this.validationAgent.getValidationAnalysis()
        }
      });
    });

    // Validation agent sends verification status
    this.messagePasser.subscribe('validation-status', (message) => {
      console.log(`[Validation Agent] Status: ${message.content.status}`);
    });
  }

  async loadHistoricalData() {
    try {
      const historicalResearch = await this.persistentMemory.get('historical-research', []);
      const historicalValidation = await this.persistentMemory.get('historical-validation', []);
      
      if (historicalResearch.length > 0) {
        console.log(`[ResearchValidationSystem] Loaded ${historicalResearch.length} historical research entries`);
      }
      
      if (historicalValidation.length > 0) {
        console.log(`[ResearchValidationSystem] Loaded ${historicalValidation.length} historical validation entries`);
      }
    } catch (error) {
      console.error('[ResearchValidationSystem] Error loading historical data:', error);
    }
  }

  /**
   * Execute research and validation cycle
   */
  async executeCycle(clusterMetrics) {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    try {
      console.log('[ResearchValidationSystem] Starting research-validation cycle...');
      
      // Step 1: Research phase with Claude
      const researchResults = await this.researchAgent.analyzeCluster(clusterMetrics);
      
      // Step 2: Send findings to validation agent
      this.messagePasser.sendMessage({
        type: 'research-findings',
        sender: 'research-agent',
        receiver: 'validation-agent',
        content: researchResults
      });
      
      // Step 3: Wait for validation results
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Validation timeout'));
        }, 30000);
        
        this.messagePasser.subscribeOnce('validation-results', (message) => {
          clearTimeout(timeout);
          resolve(message.content);
        });
      });
    } catch (error) {
      console.error('[ResearchValidationSystem] Cycle execution failed:', error);
      throw error;
    }
  }

  /**
   * Get current system status
   */
  getStatus() {
    return {
      researchAgentStatus: this.researchAgent.getStatus(),
      validationAgentStatus: this.validationAgent.getStatus(),
      isInitialized: this.isInitialized,
      messageQueueSize: this.messagePasser.messages.length
    };
  }

  /**
   * Shutdown the system
   */
  async shutdown() {
    console.log('[ResearchValidationSystem] Shutting down...');
    
    try {
      // Save any pending data
      await this.persistentMemory.save();
      
      // Stop both agents
      await Promise.all([
        this.researchAgent.shutdown(),
        this.validationAgent.shutdown()
      ]);
      
      console.log('[ResearchValidationSystem] System shut down successfully');
    } catch (error) {
      console.error('[ResearchValidationSystem] Shutdown failed:', error);
    }
  }
}

export default ResearchValidationSystem;