/**
 * Start All Agents Script
 * Launches local, background, and cloud agents simultaneously
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import net from 'net';

console.log('🚀 Starting Multi-Agent System');
console.log('===============================');

// Kill any existing processes on agent ports before starting
const agentPorts = [3001, 3002, 3003];
for (const port of agentPorts) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const match = result.match(/LISTENING\s+(\d+)/);
    if (match) {
      const pid = match[1];
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`🔪 Killed existing process on port ${port} (PID ${pid})`);
    }
  } catch {
    // Port not in use, continue
  }
}

// Agent configurations
const agents = [
  {
    name: 'Local Agent',
    id: 'local-agent',
    port: 3001,
    script: 'start-mock-server.js',
    description: 'Full dashboard with interactive controls'
  },
  {
    name: 'Background Agent',
    id: 'background-agent',
    port: 3002,
    script: 'start-background-agent.js',
    description: 'Silent operation with automated tasks'
  },
  {
    name: 'Cloud Agent',
    id: 'cloud-agent',
    port: 3003,
    script: 'start-cloud-agent.js',
    description: 'Remote access with secure connection'
  }
];

// Check if a port is available
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => { server.close(); resolve(true); });
    server.listen(port);
  });
}

// Create placeholder scripts if they don't exist
async function createPlaceholderScripts() {
  const bgScript = `import http from 'http';
const PORT = process.env.AGENT_PORT || 3002;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', agent: 'background', port: PORT }));
});
server.listen(PORT, () => console.log('[Background Agent] Running on port ' + PORT));
setInterval(() => {}, 30000);
`;

  const cloudScript = `import http from 'http';
const PORT = process.env.AGENT_PORT || 3003;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', agent: 'cloud', port: PORT }));
});
server.listen(PORT, () => console.log('[Cloud Agent] Running on port ' + PORT));
setInterval(() => {}, 45000);
`;

  if (!fs.existsSync('start-background-agent.js')) {
    await fs.promises.writeFile('start-background-agent.js', bgScript);
    console.log('📄 Created start-background-agent.js');
  }
  if (!fs.existsSync('start-cloud-agent.js')) {
    await fs.promises.writeFile('start-cloud-agent.js', cloudScript);
    console.log('📄 Created start-cloud-agent.js');
  }
}

// Start a single agent — resolves when the process is running (not when it exits)
function startAgent(agent) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔌 Starting ${agent.name} on port ${agent.port}...`);
    const child = spawn('node', [agent.script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        AGENT_ID: agent.id,
        AGENT_NAME: agent.name,
        AGENT_PORT: String(agent.port)
      }
    });

    let started = false;

    child.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      console.log(`[${agent.name}] ${msg}`);
      if (!started) { started = true; resolve(child); }
    });

    child.stderr.on('data', (data) => {
      console.error(`[${agent.name}] ${data.toString().trim()}`);
      if (!started) { started = true; resolve(child); }
    });

    child.on('error', (error) => {
      console.error(`[${agent.name}] Failed to start: ${error.message}`);
      if (!started) { started = true; reject(error); }
    });

    child.on('close', (code) => {
      console.log(`[${agent.name}] Process exited with code ${code}`);
    });

    // Resolve after 2 seconds even if no output
    setTimeout(() => {
      if (!started) { started = true; resolve(child); }
    }, 2000);
  });
}

// Main execution
async function startAllAgents() {
  try {
    await createPlaceholderScripts();

    const children = await Promise.all(agents.map(agent => startAgent(agent)));

    console.log('\n🌟 All agents started!');
    console.log('\n📋 Agent Status:');
    agents.forEach(agent => {
      console.log(`   ${agent.name}: http://localhost:${agent.port}`);
    });

    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n⚠️  Shutting down all agents...');
      children.forEach(c => { try { c.kill(); } catch {} });
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      children.forEach(c => { try { c.kill(); } catch {} });
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting agents:', error);
    process.exit(1);
  }
}

startAllAgents();
