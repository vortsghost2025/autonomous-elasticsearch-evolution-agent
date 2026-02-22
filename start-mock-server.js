/**
 * Startup script for Autonomous Elasticsearch Evolution Agent (Mock Version)
 * Runs the local agent dashboard on port 3001
 */

console.log("🚀 Starting Local Agent (Mock Server) on port 3001...");
console.log("======================================================");
console.log("Access the dashboard at: http://localhost:3001");
console.log("Master Control Panel:    http://localhost:3001/master");
console.log("======================================================");

// Import and run the mock server
import('./mock-server.js');

console.log("\n💡 Tips:");
console.log("   - Check terminal for any startup errors");
console.log("   - Restart: Ctrl+C → node start-mock-server.js");
console.log("\n✨ Local Agent ready!");
