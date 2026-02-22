/**
 * Example Integration: Agent Communication with Collaboration Hub
 * Shows how agents can connect to and communicate through the collaboration hub
 */

import { WebSocket } from 'ws';
import { MessagePasser } from '../autonomous-elasticsearch-evolution-agent/message-passers.js';

class AgentCollaborationHub {
  constructor(agentName, platform = 'vsCode') {
    this.agentName = agentName;
    this.platform = platform;  // 'vsCode' or 'lmArena'
    this.webSocket = null;
    this.isConnected = false;
    this.messageQueue = [];
    this.messagePasser = new MessagePasser(); // Internal message passer
    this.subscribers = [];
  }

  /**
   * Connect to the collaboration hub
   */
  connect(hubUrl = 'ws://localhost:4000/ws') {
    return new Promise((resolve, reject) => {
      try {
        this.webSocket = new WebSocket(hubUrl);
        
        this.webSocket.on('open', () => {
          console.log(`[${this.agentName}] Connected to collaboration hub`);
          this.isConnected = true;
          
          // Process queued messages
          this.processMessageQueue();
          resolve();
        });
        
        this.webSocket.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            if (message.type === 'init') {
              // Handle initialization with existing messages
              console.log(`[${this.agentName}] Received ${message.data[this.platform + 'Messages'].length} initial messages`);
            } else if (message.type === 'newMessage') {
              // Handle new messages
              this.handleIncomingMessage(message.data);
            }
          } catch (error) {
            console.error(`[${this.agentName}] Error parsing message:`, error);
          }
        });
        
        this.webSocket.on('close', () => {
          console.log(`[${this.agentName}] Disconnected from collaboration hub`);
          this.isConnected = false;
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            console.log(`[${this.agentName}] Attempting to reconnect...`);
            this.connect(hubUrl);
          }, 5000);
        });
        
        this.webSocket.on('error', (error) => {
          console.error(`[${this.agentName}] WebSocket error:`, error);
          reject(error);
        });
      } catch (error) {
        console.error(`[${this.agentName}] Failed to connect:`, error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from the hub
   */
  handleIncomingMessage(message) {
    console.log(`[${this.agentName}] Received message from ${message.sender}: ${message.content.substring(0, 50)}...`);
    
    // Pass the message to internal message passer for other parts of the agent to consume
    this.messagePasser.sendMessage({
      type: 'hub-message',
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
      originalPlatform: message.platform
    });
    
    // Notify subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error(`[${this.agentName}] Error in subscriber callback:`, error);
      }
    });
  }

  /**
   * Send a message to the collaboration hub
   */
  sendMessage(content) {
    if (!this.isConnected) {
      // Queue the message to send when connected
      this.messageQueue.push({
        platform: this.platform,
        sender: this.agentName,
        content: content
      });
      console.log(`[${this.agentName}] Queued message for sending when connected`);
      return false;
    }
    
    const message = {
      platform: this.platform,
      sender: this.agentName,
      content: content
    };
    
    this.webSocket.send(JSON.stringify(message));
    console.log(`[${this.agentName}] Sent message to hub: ${content.substring(0, 50)}...`);
    return true;
  }

  /**
   * Process queued messages when connection is established
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.webSocket.send(JSON.stringify(message));
      console.log(`[${this.agentName}] Sent queued message: ${message.content.substring(0, 50)}...`);
    }
  }

  /**
   * Subscribe to messages from the hub
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Disconnect from the hub
   */
  disconnect() {
    if (this.webSocket) {
      this.webSocket.close();
      this.isConnected = false;
    }
  }
}

/**
 * Example usage for integrating with existing agents
 */
class ExampleAgent {
  constructor(name, platform) {
    this.name = name;
    this.platform = platform;
    this.collabHub = new AgentCollaborationHub(name, platform);
  }

  async initialize() {
    // Connect to collaboration hub
    await this.collabHub.connect();
    
    // Subscribe to messages
    this.collabHub.subscribe((message) => {
      this.handleHubMessage(message);
    });
    
    console.log(`[${this.name}] Initialized and connected to collaboration hub`);
  }

  handleHubMessage(message) {
    console.log(`[${this.name}] Processing message from ${message.sender}: ${message.content}`);
    
    // Example: Respond to specific messages
    if (message.content.toLowerCase().includes('hello')) {
      this.collabHub.sendMessage(`Hello from ${this.name}! Got your message: "${message.content.substring(0, 30)}..."`);
    }
  }

  sendWorkUpdate(update) {
    this.collabHub.sendMessage(`Work Update: ${update}`);
  }

  sendStatus(status) {
    this.collabHub.sendMessage(`Status: ${status}`);
  }
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Example: Agent Collaboration Hub Integration\n');
  
  // Create example agents
  const vsCodeAgent = new ExampleAgent('VSCode-Research-Agent', 'vsCode');
  const lmArenaAgent = new ExampleAgent('LMArena-Optimization-Agent', 'lmArena');
  
  // Initialize agents
  (async () => {
    await vsCodeAgent.initialize();
    await lmArenaAgent.initialize();
    
    // Simulate some activity
    vsCodeAgent.sendStatus('Starting research analysis...');
    lmArenaAgent.sendStatus('Beginning optimization process...');
    
    setTimeout(() => {
      vsCodeAgent.sendWorkUpdate('Found performance bottleneck in query patterns');
      lmArenaAgent.sendWorkUpdate('Preparing optimization strategy for identified bottleneck');
    }, 2000);
    
    setTimeout(() => {
      vsCodeAgent.collabHub.sendMessage('Hello LM Arena agents! I found some interesting patterns.');
    }, 4000);
    
    setTimeout(() => {
      console.log('\n✅ Example completed. Agents are communicating through the collaboration hub.');
      vsCodeAgent.collabHub.disconnect();
      lmArenaAgent.collabHub.disconnect();
    }, 8000);
  })();
}

export { AgentCollaborationHub, ExampleAgent };