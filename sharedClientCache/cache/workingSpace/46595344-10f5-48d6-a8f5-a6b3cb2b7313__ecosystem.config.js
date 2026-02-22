module.exports = {
  apps: [
    {
      name: 'collab-hub',
      script: './collab-hub-server.js',
      watch: false,
      env: { PORT: 4000 }
    },
    // Add other agent scripts here as needed
  ]
};
module.exports = {
  apps: [{
    name: 'ae-collab-hub',
    script: './collab-hub-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }, {
    name: 'ae-local-agent',
    script: './mock-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      AGENT_TYPE: 'local',
      AGENT_PROFILE: 'local'
    }
  }, {
    name: 'ae-background-agent',
    script: './start-background-agent.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
      AGENT_TYPE: 'background',
      AGENT_PROFILE: 'background'
    }
  }, {
    name: 'ae-cloud-agent',
    script: './start-cloud-agent.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3003,
      AGENT_TYPE: 'cloud',
      AGENT_PROFILE: 'cloud'
    }
  }],
  
  deploy: {
    production: {
      user: 'root',
      host: 'your-ecs-instance-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/autonomous-elasticsearch-evolution-agent.git',
      path: '/opt/autonomous-elasticsearch-evolution-agent',
      'pre-setup': '',
      'post-setup': 'npm install',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-deploy': 'git pull origin main',
      'env': {
        NODE_ENV: 'production'
      }
    }
  }
};