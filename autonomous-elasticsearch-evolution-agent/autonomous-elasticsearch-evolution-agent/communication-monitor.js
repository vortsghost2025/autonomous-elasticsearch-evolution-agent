/**
 * CommunicationMonitor
 * Provides visibility into the message flow between agents
 * Great for debugging and transparency
 */

import { MessagePasser } from './message-passers.js';

export class CommunicationMonitor {
  constructor(messagePasser) {
    this.messagePasser = messagePasser;
    this.messageLog = [];
    this.setupMonitoring();
  }

  /**
   * Setup monitoring by subscribing to all message types
   */
  setupMonitoring() {
    this.messagePasser.subscribe('*', (message) => {
      this.logMessage(message);
    });
  }

  /**
   * Log a message to the internal log
   */
  logMessage(message) {
    const logEntry = {
      timestamp: Date.now(),
      type: message.type,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      size: JSON.stringify(message).length
    };
    
    this.messageLog.push(logEntry);
    
    // Keep only the last 1000 entries to prevent unlimited growth
    if (this.messageLog.length > 1000) {
      this.messageLog.shift();
    }
    
    console.log(`[CommunicationMonitor] ${logEntry.type} from ${logEntry.sender} to ${logEntry.receiver}`);
  }

  /**
   * Get recent messages
   */
  getRecentMessages(limit = 50) {
    return this.messageLog.slice(-limit);
  }

  /**
   * Get messages of a specific type
   */
  getMessagesOfType(type) {
    return this.messageLog.filter(msg => msg.type === type);
  }

  /**
   * Clear the message log
   */
  clearLog() {
    this.messageLog = [];
  }

  /**
   * Print a summary of the current state
   */
  printSummary() {
    console.log('📊 Communication Monitor Summary:');
    console.log(`  Total messages logged: ${this.messageLog.length}`);
    console.log(`  Unique message types: ${new Set(this.messageLog.map(m => m.type)).size}`);
    console.log(`  Last message: ${this.messageLog.length > 0 ? this.messageLog[this.messageLog.length - 1].type : 'None'}`);
  }
}

export default CommunicationMonitor;