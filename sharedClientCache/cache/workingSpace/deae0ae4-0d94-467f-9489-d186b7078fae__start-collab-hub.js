/**
 * Startup script for Autonomous Agent Collaboration Hub
 * Enables real-time communication between agents on multiple platforms
 * 
 * To use:
 * 1. Run this script: node start-collab-hub.js
 * 2. Access the dashboard at http://localhost:4000
 * 3. Agents on VS Code and LM Arena can connect via WebSocket or REST API
 */

console.log("🚀 Starting Autonomous Agent Collaboration Hub...");
console.log("===================================================");
console.log("This server enables real-time communication between agents");
console.log("on multiple platforms (VS Code and LM Arena)");
console.log("Port: 4000");
console.log("WebSocket: ws://localhost:4000/ws");
console.log("Access the dashboard at: http://localhost:4000");
console.log("===================================================");

// Import and run the collaboration hub server
import('./collab-hub-server.js');

console.log("\n💡 API Endpoints:");
console.log("   GET  /api/messages/vsCode    - Get VS Code agent messages");
console.log("   GET  /api/messages/lmArena   - Get LM Arena agent messages");
console.log("   POST /api/messages           - Send a new message");
console.log("");
console.log("   WebSocket: ws://localhost:4000/ws");
console.log("");
console.log("   Message Format:");
console.log('   { "platform": "vsCode", "sender": "AgentName", "content": "Message content" }');
console.log('   { "platform": "lmArena", "sender": "AgentName", "content": "Message content" }');
console.log("");
console.log("✨ The collaboration hub is now ready for multi-platform agent communication!");