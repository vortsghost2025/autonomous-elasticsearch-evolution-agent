const { execSync } = require('child_process');

function tryStart(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    if (e.status === 1 && /EADDRINUSE/.test(e.stderr.toString())) {
      console.log('Port conflict detected, skipping:', cmd);
    } else {
      throw e;
    }
  }
}

tryStart('pm2 start ecosystem.config.js');
// Add more startup logic as needed
/**
 * Start All Services Script
 * Launches all components of the Autonomous Elasticsearch Evolution Agent system
 * Designed for deployment on ECS with proper error handling and port management
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { createServer } from 'http';

// Configuration for services
const services = [
  {
    name: 'Collaboration Hub',
    script: 'collab-hub-server.js',
    port: 4000,
    env: { PORT: 4000 },
    id: 'collab-hub'
  },
  {
    name: 'Local Agent',
    script: 'mock-server.js',
    port: 3001,
    env: { PORT: 3001, AGENT_TYPE: 'local' },
    id: 'local-agent'
  },
  {
    name: 'Background Agent',
    script: 'start-background-agent.js',
    port: 3002,
    env: { PORT: 3002, AGENT_TYPE: 'background' },
    id: 'background-agent'
  },
  {
    name: 'Cloud Agent',
    script: 'start-cloud-agent.js',
    port: 3003,
    env: { PORT: 3003, AGENT_TYPE: 'cloud' },
    id: 'cloud-agent'
  }
];

// Track running processes
const runningProcesses = new Map();

// Check if a port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Find an available port starting from a given port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    // Don't search beyond a reasonable range
    if (port > startPort + 50) {
      throw new Error(`Could not find available port starting from ${startPort}`);
    }
  }
  return port;
}

// Start a service with error handling and port management
async function startService(service) {
  try {
    // Check if the service port is available
    const availablePort = await findAvailablePort(service.port);
    
    if (availablePort !== service.port) {
      console.log(`⚠️  Port ${service.port} unavailable, using port ${availablePort} for ${service.name}`);
    }
    
    // Update the service configuration with the available port
    const updatedEnv = { ...service.env, PORT: availablePort };
    
    // Spawn the process
    const process = spawn('node', [service.script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...updatedEnv }
    });

    // Store the process
    runningProcesses.set(service.id, {
      process,
      originalPort: service.port,
      assignedPort: availablePort,
      name: service.name
    });

    // Handle process output
    process.stdout.on('data', (data) => {
      console.log(`[${service.name}:${availablePort}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${service.name}:${availablePort}] ERROR: ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      console.log(`[${service.name}:${availablePort}] Process exited with code ${code}`);
      runningProcesses.delete(service.id);
    });

    process.on('error', (err) => {
      console.error(`[${service.name}:${availablePort}] Failed to start:`, err.message);
    });

    console.log(`✅ Started ${service.name} on port ${availablePort}`);
    return process;
  } catch (error) {
    console.error(`❌ Failed to start ${service.name}:`, error.message);
    return null;
  }
}

// Start all services
async function startAllServices() {
  console.log('🚀 Starting Autonomous Elasticsearch Evolution Agent Services...\n');
  
  // First, check if all required files exist
  const requiredFiles = [
    'collab-hub-server.js',
    'mock-server.js',
    'start-background-agent.js',
    'start-cloud-agent.js'
  ];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      console.error(`❌ Required file not found: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All required files found\n');
  
  // Start each service
  const startPromises = services.map(service => startService(service));
  const results = await Promise.all(startPromises);
  
  const successfulStarts = results.filter(result => result !== null);
  const failedStarts = services.length - successfulStarts.length;
  
  console.log(`\n📊 Summary: ${successfulStarts.length} services started successfully, ${failedStarts} failed.`);
  
  if (failedStarts > 0) {
    console.log('⚠️  Some services failed to start. Check the logs above for details.');
  } else {
    console.log('🎉 All services started successfully!');
  }
  
  console.log('\n📋 Service Status:');
  runningProcesses.forEach((info, id) => {
    console.log(`   ${info.name}: Port ${info.assignedPort} (original: ${info.originalPort})`);
  });
  
  console.log('\n🌐 Access your services at:');
  console.log('   - Local Agent Dashboard: http://localhost:3001');
  console.log('   - Collaboration Hub: http://localhost:4000/collab-hub.html');
  console.log('   - Background Agent: http://localhost:3002');
  console.log('   - Cloud Agent: http://localhost:3003');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down all services...');
    
    for (const [id, info] of runningProcesses) {
      console.log(`   Stopping ${info.name}...`);
      if (info.process && !info.process.killed) {
        info.process.kill();
      }
      runningProcesses.delete(id);
    }
    
    console.log('👋 All services stopped. Goodbye!');
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down all services...');
    
    for (const [id, info] of runningProcesses) {
      console.log(`   Stopping ${info.name}...`);
      if (info.process && !info.process.killed) {
        info.process.kill();
      }
      runningProcesses.delete(id);
    }
    
    console.log('👋 All services stopped.');
    process.exit(0);
  });
}

// Run the startup process
startAllServices().catch(error => {
  console.error('❌ Fatal error starting services:', error);
  process.exit(1);
});