/**
 * Startup script for Autonomous Elasticsearch Evolution Agent
 * Designed for Azure Dev Tunnel connectivity (local:8000 → remote:3000)
 * 
 * To use with Azure Dev Tunnel:
 * 1. Run this script with: node start-server.js
 * 2. Go to the Azure Portal and set up port forwarding:
 *    - Click "Forward a Port"
 *    - Local Port: 8000
 *    - Remote Port: 3000
 * 3. Access the dashboard at http://localhost:8000
 */

console.log("🚀 Starting Autonomous Elasticsearch Evolution Agent...");
console.log("===================================================");
console.log("This server is optimized for Azure Dev Tunnel connectivity");
console.log("Local Port: 8000 → Remote Port: 3000");
console.log("Access the dashboard at: http://localhost:8000");
console.log("===================================================");

// Import and run the main server
import('./server.js');

console.log("\n💡 Troubleshooting Tips:");
console.log("   - If you get a 502 error, ensure the server is running before connecting via tunnel");
console.log("   - Verify your tunnel maps local:8000 to remote:3000");
console.log("   - Check terminal for any startup errors");
console.log("   - Restart the process if needed: Ctrl+C → node start-server.js");
console.log("\n✨ The system is now ready for Azure Dev Tunnel connection!");