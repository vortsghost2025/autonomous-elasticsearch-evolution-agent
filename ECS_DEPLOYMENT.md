# Alibaba Cloud ECS Deployment Guide

## Prerequisites
- Alibaba Cloud ECS instance (Ubuntu/CentOS recommended)
- Docker & Docker Compose (auto-installed by script)
- Open port 4000 in your security group

## Quick Deploy
1. Upload all project files to your ECS instance
2. Run the deployment script:
	 ```sh
	 bash deploy-to-ecs.sh
	 ```
3. Access the Collaboration Hub at `http://<your-ecs-ip>:4000/collab-hub.html`

## Managing Services
- To start/stop all services:
	```sh
	docker-compose up -d
	docker-compose down
	```
- To use PM2 (optional):
	```sh
	pm2 start ecosystem.config.js
	pm2 stop all
	```

## Logs & Monitoring
- Docker: `docker logs collab-hub`
- PM2: `pm2 logs`

## Troubleshooting
- Ensure port 4000 is open in both ECS firewall and security group
- Check logs for errors

## Security
- Change default passwords and secure endpoints as needed
# Deploying Autonomous Elasticsearch Evolution Agent on Alibaba Cloud ECS

This guide provides instructions for deploying the Autonomous Elasticsearch Evolution Agent system on your Alibaba Cloud Elastic Compute Service (ECS) instance.

## Prerequisites

- An active Alibaba Cloud account
- A provisioned ECS instance (any specification depending on your needs)
- SSH access to your ECS instance
- Basic knowledge of Linux commands

## Deployment Options

You have several options for deploying the system on your ECS instance:

### Option 1: Manual Deployment (Recommended)

1. Connect to your ECS instance via SSH:
```bash
ssh username@your-ecs-public-ip
```

2. Install Git and clone the repository:
```bash
# For CentOS/RHEL
sudo yum update && sudo yum install -y git

# For Ubuntu/Debian
sudo apt update && sudo apt install -y git

# Clone the repository
git clone https://github.com/your-username/autonomous-elasticsearch-evolution-agent.git
cd autonomous-elasticsearch-evolution-agent
```

3. Run the deployment script:
```bash
chmod +x deploy-to-ecs.sh
./deploy-to-ecs.sh
```

### Option 2: Docker Deployment

1. Connect to your ECS instance via SSH

2. Install Docker and Docker Compose:
```bash
# Install Docker
sudo yum update
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. Copy the project files to your ECS instance:
```bash
# Either clone the repository
git clone https://github.com/your-username/autonomous-elasticsearch-evolution-agent.git
cd autonomous-elasticsearch-evolution-agent

# Or upload your local files using scp/rsync
```

4. Deploy using Docker Compose:
```bash
docker-compose up -d
```

### Option 3: PM2 Deployment

1. Connect to your ECS instance via SSH

2. Install Node.js and PM2:
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
npm install -g pm2
```

3. Clone and set up the project:
```bash
git clone https://github.com/your-username/autonomous-elasticsearch-evolution-agent.git
cd autonomous-elasticsearch-evolution-agent
npm install
```

4. Start the services using PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Configuration for ECS

### Security Groups/Firewall

Ensure your ECS security group allows traffic on the following ports:

- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3001 (Local Agent Dashboard)
- Port 3002 (Background Agent)
- Port 3003 (Cloud Agent)
- Port 4000 (Collaboration Hub)
- Port 8000 (Azure Dev Tunnel access)

### Resource Allocation

For optimal performance on your ECS instance, consider the following:

- Minimum: 1 vCPU, 2 GB RAM (for basic operation)
- Recommended: 2 vCPU, 4 GB RAM (for full functionality)

### Persistent Storage

The system stores its state in `memory-store.json`. Ensure your ECS instance has sufficient disk space and consider mounting an additional data disk for storage if needed.

## Accessing Your Services

Once deployed, access your services using:

- **Local Agent Dashboard**: `http://YOUR_ECS_PUBLIC_IP:3001`
- **Collaboration Hub**: `http://YOUR_ECS_PUBLIC_IP:4000/collab-hub.html`
- **Background Agent**: `http://YOUR_ECS_PUBLIC_IP:3002`
- **Cloud Agent**: `http://YOUR_ECS_PUBLIC_IP:3003`

## Managing Your Deployment

### Using PM2 (if applicable)

- View running processes: `pm2 list`
- View logs: `pm2 logs`
- Restart all services: `pm2 restart all`
- Stop all services: `pm2 stop all`
- Monitor resource usage: `pm2 monit`

### Using Docker (if applicable)

- View running containers: `docker-compose ps`
- View logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Stop services: `docker-compose down`

## Monitoring and Maintenance

### Health Checks

Regularly run the health check script:
```bash
./health-check.sh
```

### Backups

Create regular backups of your data:
```bash
./backup.sh
```

Backups are stored in `/opt/backups/` with timestamps.

### Updating the System

To update to the latest version:

1. Stop the running services
2. Pull the latest code: `git pull origin main`
3. Install any new dependencies: `npm install`
4. Restart the services

## Troubleshooting

### Common Issues

1. **Port already in use**: Check if services are already running using `netstat -tulpn | grep :PORT_NUMBER`
2. **Permission errors**: Ensure you're running commands with appropriate permissions
3. **Firewall blocking**: Verify security group settings allow required ports

### Service Not Starting

1. Check logs: `pm2 logs` or `docker-compose logs`
2. Verify configuration files are correct
3. Ensure sufficient resources are available

### Memory Issues

1. Monitor resource usage with `htop` or `pm2 monit`
2. Adjust PM2 configuration to limit memory usage if needed
3. Consider upgrading your ECS instance if consistently running low on resources

## Security Considerations

1. **Change default passwords** if any exist
2. **Enable HTTPS** for production environments
3. **Restrict SSH access** to trusted IPs
4. **Regular updates** to keep the system secure
5. **Backup data** regularly

## Cost Optimization

Since you have a free ECS instance for a year:

1. Monitor resource usage to ensure optimal performance
2. Scale down during low-usage periods if needed
3. Clean up old logs and backups periodically
4. Consider using the free tier resources efficiently

## Support

If you encounter issues with your deployment:

1. Check the logs using the appropriate command for your deployment method
2. Verify all prerequisites are met
3. Confirm security group settings are correct
4. Consult the main project documentation