/**
 * Startup script for Autonomous Elasticsearch Evolution Agent (Mock Version)
 * Designed for Azure Dev Tunnel connectivity (local:8000 → remote:3001)
 * 
 * To use with Azure Dev Tunnel:
 * 1. Run this script with: node start-mock-server.js
 * 2. Go to the Azure Portal and set up port forwarding:
 *    - Click "Forward a Port"
 *    - Local Port: 8000
 *    - Remote Port: 3001
 * 3. Access the dashboard at http://localhost:8000
 */

console.log("🚀 Starting Autonomous Elasticsearch Evolution Agent (Mock Version)...");
console.log("=====================================================================");
console.log("This server is optimized for Azure Dev Tunnel connectivity");
console.log("Local Port: 8000 → Remote Port: 3001");
console.log("Access the dashboard at: http://localhost:8000");
console.log("=====================================================================");

// Import and run the mock server
import('./mock-server.js');

console.log("\n💡 Troubleshooting Tips:");
console.log("   - If you get a 502 error, ensure the server is running before connecting via tunnel");
console.log("   - Verify your tunnel maps local:8000 to remote:3001");
console.log("   - Check terminal for any startup errors");
console.log("   - Restart the process if needed: Ctrl+C → node start-mock-server.js");
console.log("\n✨ The system is now ready for Azure Dev Tunnel connection!");