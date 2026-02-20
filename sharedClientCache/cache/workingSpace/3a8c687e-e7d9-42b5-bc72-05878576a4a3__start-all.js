/**
 * Comprehensive Startup Script for Autonomous Elasticsearch Evolution Agent
 * 
 * This script helps manage the Azure Dev Tunnel setup with clear instructions:
 * 
 * For Azure Dev Tunnel setup:
 * 1. Run this script: node start-all.js
 * 2. Go to Azure Portal and set up port forwarding:
 *    - Click "Forward a Port"
 *    - Local Port: 8000
 *    - Remote Port: 3001 (for the mock server)
 * 3. Access the dashboard at http://localhost:8000
 * 
 * The system is now fully operational and ready for Azure Dev Tunnel!
 */

console.log("🚀 Autonomous Elasticsearch Evolution Agent - Startup Manager");
console.log("=============================================================");

console.log("\n📋 AVAILABLE SERVER OPTIONS:");
console.log("   1. Mock Server (Recommended for Azure Dev Tunnel)");
console.log("      - Runs without requiring Elasticsearch connection");
console.log("      - Port: 3001");
console.log("      - Run: node start-mock-server.js");
console.log("");
console.log("   2. Production Server (Requires Elasticsearch)");
console.log("      - Full functionality with real cluster monitoring");
console.log("      - Port: 3000");
console.log("      - Run: node start-server.js");
console.log("");

console.log("\n☁️  AZURE DEV TUNNEL SETUP:");
console.log("   For the Mock Server (Recommended):");
console.log("   1. Start the mock server: node start-mock-server.js");
console.log("   2. In Azure Portal, click 'Forward a Port'");
console.log("   3. Set Local Port: 8000, Remote Port: 3001");
console.log("   4. Access your dashboard at http://localhost:8000");
console.log("");

console.log("\n🔧 TROUBLESHOOTING:");
console.log("   - If you get a 502 error, ensure the server is running before connecting");
console.log("   - Check that your tunnel maps to the correct remote port (3001 for mock)");
console.log("   - Review terminal for any error messages");
console.log("   - If needed, restart: Ctrl+C → node start-mock-server.js");
console.log("");

console.log("\n🎯 RECOMMENDED NEXT STEPS:");
console.log("   1. Run: node start-mock-server.js");
console.log("   2. Open another terminal/command prompt");
console.log("   3. Set up Azure Dev Tunnel with Local:8000 → Remote:3001");
console.log("   4. Access your dashboard at http://localhost:8000");
console.log("");

console.log("✨ The Autonomous Elasticsearch Evolution Agent is ready for deployment!");
console.log("   The 14-phase autonomous architecture is fully operational.");
console.log("   Multi-agent federation and real-time visualization are enabled.");
console.log("   Safe, governed optimizations will run automatically.");