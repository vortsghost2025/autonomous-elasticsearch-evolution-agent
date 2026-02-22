// Integration Examples for Collaboration Hub
// Usage: require('ws') for WebSocket, 'node-fetch' for REST

// WebSocket Example
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4000?group=vscode');
ws.on('open', () => ws.send(JSON.stringify({ sender: 'VSCodeAgent', message: 'Hello from VS Code!' })));
ws.on('message', msg => console.log('Received:', msg));

// REST Example
const fetch = require('node-fetch');
fetch('http://localhost:4000/api/messages/vscode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: 'VSCodeAgent', message: 'REST message' }) })
  .then(r => r.json()).then(console.log);

/**
 * Sample Integration Examples for Collaboration Hub
 * Shows how to integrate VS Code agents and LM Arena agents with the collaboration hub
 */

// Example 1: VS Code Agent Integration
class VSCodeAgentIntegration {
  constructor(hubUrl = 'ws://localhost:4000/ws') {
    this.hubUrl = hubUrl;
    this.socket = null;
    this.agentId = `vscode-agent-${Date.now()}`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.hubUrl);

      this.socket.onopen = () => {
        console.log(`${this.agentId} connected to collaboration hub`);
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log(`${this.agentId} disconnected from collaboration hub`);
      };
    });
  }

  sendMessage(content, sender = this.agentId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'post-message',
        platform: 'vscode-agents',
        sender,
        content,
        timestamp: new Date().toISOString()
      };

      this.socket.send(JSON.stringify(message));
      console.log(`${this.agentId} sent message: ${content}`);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  handleMessage(data) {
    if (data.type === 'new-message') {
      if (data.message.platform === 'vscode-agents' || data.message.platform === 'shared') {
        console.log(`${this.agentId} received message: ${data.message.content} from ${data.message.sender}`);
        // Process the message as needed
        this.processIncomingMessage(data.message);
      }
    }
  }

  processIncomingMessage(message) {
    // Implement your message processing logic here
    console.log(`${this.agentId} processing message:`, message);
  }
}

// Example 2: LM Arena Agent Integration
class LMArenaAgentIntegration {
  constructor(hubUrl = 'ws://localhost:4000/ws') {
    this.hubUrl = hubUrl;
    this.socket = null;
    this.agentId = `lmarena-agent-${Date.now()}`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.hubUrl);

      this.socket.onopen = () => {
        console.log(`${this.agentId} connected to collaboration hub`);
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log(`${this.agentId} disconnected from collaboration hub`);
      };
    });
  }

  sendMessage(content, sender = this.agentId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'post-message',
        platform: 'lmarena-agents',
        sender,
        content,
        timestamp: new Date().toISOString()
      };

      this.socket.send(JSON.stringify(message));
      console.log(`${this.agentId} sent message: ${content}`);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  handleMessage(data) {
    if (data.type === 'new-message') {
      if (data.message.platform === 'lmarena-agents' || data.message.platform === 'shared') {
        console.log(`${this.agentId} received message: ${data.message.content} from ${data.message.sender}`);
        // Process the message as needed
        this.processIncomingMessage(data.message);
      }
    }
  }

  processIncomingMessage(message) {
    // Implement your message processing logic here
    console.log(`${this.agentId} processing message:`, message);
  }
}

// Example 3: Shared Agent Integration (for messages between platforms)
class SharedAgentIntegration {
  constructor(hubUrl = 'ws://localhost:4000/ws') {
    this.hubUrl = hubUrl;
    this.socket = null;
    this.agentId = `shared-agent-${Date.now()}`;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.hubUrl);

      this.socket.onopen = () => {
        console.log(`${this.agentId} connected to collaboration hub`);
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log(`${this.agentId} disconnected from collaboration hub`);
      };
    });
  }

  sendMessage(content, sender = this.agentId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'post-message',
        platform: 'shared',
        sender,
        content,
        timestamp: new Date().toISOString()
      };

      this.socket.send(JSON.stringify(message));
      console.log(`${this.agentId} sent shared message: ${content}`);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  handleMessage(data) {
    if (data.type === 'new-message') {
      // Respond to all messages (from any platform)
      console.log(`${this.agentId} received shared message: ${data.message.content} from ${data.message.sender} (platform: ${data.message.platform})`);
      // Process the message as needed
      this.processIncomingMessage(data.message);
    }
  }

  processIncomingMessage(message) {
    // Implement your message processing logic here
    console.log(`${this.agentId} processing shared message:`, message);
  }
}

// Example 4: Using the integrations
async function runIntegrationExamples() {
  console.log('Starting collaboration hub integration examples...\n');

  // Example of VS Code agent integration
  const vscodeAgent = new VSCodeAgentIntegration();
  await vscodeAgent.connect();
  
  // Send a test message
  vscodeAgent.sendMessage('Hello from VS Code agent!', 'vscode-test-agent');
  
  // Example of LM Arena agent integration
  const lmArenaAgent = new LMArenaAgentIntegration();
  await lmArenaAgent.connect();
  
  // Send a test message
  lmArenaAgent.sendMessage('Hello from LM Arena agent!', 'lmarena-test-agent');
  
  // Example of shared agent integration
  const sharedAgent = new SharedAgentIntegration();
  await sharedAgent.connect();
  
  // Send a shared message
  sharedAgent.sendMessage('Hello from shared agent! This message is visible to all.', 'shared-test-agent');
  
  // Keep the process alive for demonstration
  setTimeout(() => {
    console.log('\nIntegration examples completed.');
    process.exit(0);
  }, 10000);
}

// Example 5: REST API usage
async function restApiExample() {
  const postData = {
    platform: 'vscode-agents',
    sender: 'rest-api-example',
    content: 'Message sent via REST API'
  };

  try {
    const response = await fetch('http://localhost:4000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Message posted via REST API:', result);
    } else {
      console.error('Error posting message via REST API:', response.statusText);
    }
  } catch (error) {
    console.error('Network error posting message via REST API:', error);
  }
}

// Export the classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VSCodeAgentIntegration,
    LMArenaAgentIntegration,
    SharedAgentIntegration,
    runIntegrationExamples,
    restApiExample
  };
}

// If this file is run directly, execute the examples
if (typeof require !== 'undefined' && require.main === module) {
  runIntegrationExamples();
}