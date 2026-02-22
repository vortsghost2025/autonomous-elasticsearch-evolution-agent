import { PersistentMemory } from './persistent-memory.js';

export class ProposalApplier {
  constructor(esClient, options = {}) {
    this.esClient = esClient;
    this.clusterName = options.clusterName || 'production';
    this.dryRun = options.dryRun !== false;
    this.changeLog = [];
    this.rollbackStack = [];
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load change log from persistent memory
      const savedChangeLog = await this.persistentMemory.get('changeLog', []);
      if (Array.isArray(savedChangeLog) && savedChangeLog.length > 0) {
        this.changeLog = savedChangeLog;
        console.log(`[ProposalApplier] Restored ${this.changeLog.length} historical changes`);
      }
      
      const savedRollbackStack = await this.persistentMemory.get('rollbackStack', []);
      if (Array.isArray(savedRollbackStack) && savedRollbackStack.length > 0) {
        this.rollbackStack = savedRollbackStack;
        console.log(`[ProposalApplier] Restored ${this.rollbackStack.length} rollback entries`);
      }
      
      this.isInitialized = true;
      console.log('[ProposalApplier] Initialized with persistent memory');
    } catch (error) {
      console.error('[ProposalApplier] Error during initialization:', error);
      // Continue anyway, we don't want to crash if memory restore fails
      this.isInitialized = true;
    }
  }

  async applyProposal(proposal) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('Applying: ' + proposal.title);
    
    const changeEntry = {
      proposal: proposal.title,
      appliedAt: Date.now(),
      clusterName: this.clusterName,
      success: true
    };
    
    this.changeLog.push(changeEntry);
    
    // Persist the change log
    await this.persistentMemory.set('changeLog', this.changeLog);
    
    return { 
      success: true, 
      proposal: proposal.title,
      appliedAt: changeEntry.appliedAt
    };
  }

  async getStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return { 
      clusterName: this.clusterName, 
      changesApplied: this.changeLog.length,
      rollbackEntries: this.rollbackStack.length,
      isInitialized: this.isInitialized
    };
  }
}

export default ProposalApplier;