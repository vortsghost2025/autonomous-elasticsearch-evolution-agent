/**
 * MessagePasser
 * A lightweight in-memory message queue for agent-to-agent communication
 * No external APIs or paid services required
 */

export class MessagePasser {
  constructor() {
    this.messages = [];
    this.subscribers = new Map();
  }

  /**
   * Send a message to the queue
   */
  sendMessage(message) {
    this.messages.push(message);
    console.log(`[MessagePasser] Sent message: ${message.type}`);
    
    // Notify subscribers of the new message
    this.notifySubscribers(message);
  }

  /**
   * Subscribe to messages of a specific type
   */
  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type).push(callback);
  }

  /**
   * Unsubscribe from messages of a specific type
   */
  unsubscribe(type, callback) {
    if (this.subscribers.has(type)) {
      const callbacks = this.subscribers.get(type);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Get all messages of a specific type
   */
  getMessagesOfType(type) {
    return this.messages.filter(msg => msg.type === type);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.messages = [];
  }

  /**
   * Notify all subscribers of a new message
   */
  notifySubscribers(message) {
    const type = message.type;
    if (this.subscribers.has(type)) {
      this.subscribers.get(type).forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`[MessagePasser] Error in subscriber callback:`, error);
        }
      });
    }
  }
}

export default MessagePasser;