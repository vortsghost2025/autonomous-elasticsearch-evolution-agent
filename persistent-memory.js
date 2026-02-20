/**
 * Persistent Memory System for Autonomous Elasticsearch Evolution Agent
 * Maintains state between agent restarts to prevent data loss
 */

import fs from 'fs/promises';
import path from 'path';

export class PersistentMemory {
  constructor(options = {}) {
    this.storagePath = options.storagePath || './memory-store.json';
    this.data = {};
    this.isLoaded = false;
  }

  /**
   * Load memory from persistent storage
   */
  async load() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      this.data = JSON.parse(data);
      this.isLoaded = true;
      console.log(`[PersistentMemory] Loaded from ${this.storagePath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`[PersistentMemory] No existing memory file found at ${this.storagePath}, starting fresh`);
        this.data = {};
        this.isLoaded = true;
        await this.save(); // Create the file if it doesn't exist
      } else {
        console.error(`[PersistentMemory] Error loading memory:`, error);
        throw error;
      }
    }
  }

  /**
   * Save memory to persistent storage
   */
  async save() {
    if (!this.isLoaded) {
      await this.load();
    }
    
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(this.storagePath, JSON.stringify(this.data, null, 2));
      console.log(`[PersistentMemory] Saved to ${this.storagePath}`);
    } catch (error) {
      console.error(`[PersistentMemory] Error saving memory:`, error);
      throw error;
    }
  }

  /**
   * Get a value from memory
   */
  async get(key, defaultValue = null) {
    if (!this.isLoaded) {
      await this.load();
    }
    
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  /**
   * Set a value in memory
   */
  async set(key, value) {
    if (!this.isLoaded) {
      await this.load();
    }
    
    this.data[key] = value;
    await this.save();
  }

  /**
   * Delete a key from memory
   */
  async delete(key) {
    if (!this.isLoaded) {
      await this.load();
    }
    
    delete this.data[key];
    await this.save();
  }

  /**
   * Get all keys in memory
   */
  async keys() {
    if (!this.isLoaded) {
      await this.load();
    }
    
    return Object.keys(this.data);
  }

  /**
   * Clear all memory
   */
  async clear() {
    this.data = {};
    await this.save();
  }

  /**
   * Get the full data object
   */
  getData() {
    return this.data;
  }

  /**
   * Store agent state including optimization history
   */
  async storeAgentState(agentState) {
    const timestamp = Date.now();
    const stateWithTimestamp = {
      ...agentState,
      lastUpdated: timestamp
    };
    
    await this.set('agentState', stateWithTimestamp);
    return stateWithTimestamp;
  }

  /**
   * Retrieve agent state
   */
  async retrieveAgentState() {
    return await this.get('agentState', {});
  }

  /**
   * Add to optimization history
   */
  async addToOptimizationHistory(entry) {
    const history = await this.get('optimizationHistory', []);
    history.push({
      ...entry,
      timestamp: Date.now()
    });
    
    await this.set('optimizationHistory', history);
    return history;
  }

  /**
   * Get optimization history
   */
  async getOptimizationHistory(limit = 100) {
    const history = await this.get('optimizationHistory', []);
    return history.slice(-limit); // Return last N entries
  }

  /**
   * Add to error log
   */
  async logError(error) {
    const errorLog = await this.get('errorLog', []);
    errorLog.push({
      message: error.message || error,
      stack: error.stack,
      timestamp: Date.now(),
      type: 'ERROR'
    });
    
    // Keep only the last 100 errors to prevent unlimited growth
    if (errorLog.length > 100) {
      errorLog.splice(0, errorLog.length - 100);
    }
    
    await this.set('errorLog', errorLog);
    return errorLog;
  }

  /**
   * Get error log
   */
  async getErrorLog(limit = 50) {
    const errorLog = await this.get('errorLog', []);
    return errorLog.slice(-limit); // Return last N errors
  }

  /**
   * Store learned patterns
   */
  async storeLearnedPattern(pattern) {
    const patterns = await this.get('learnedPatterns', []);
    patterns.push({
      ...pattern,
      createdAt: Date.now()
    });
    
    await this.set('learnedPatterns', patterns);
    return patterns;
  }

  /**
   * Get learned patterns
   */
  async getLearnedPatterns() {
    return await this.get('learnedPatterns', []);
  }
}

export default PersistentMemory;