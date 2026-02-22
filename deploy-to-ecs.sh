#!/bin/bash
# Automated deployment script for Alibaba Cloud ECS
set -e

# Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Open firewall port 4000 (Collab Hub)
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=4000/tcp
    firewall-cmd --reload
elif command -v ufw &> /dev/null; then
    ufw allow 4000/tcp
fi

# Pull and start services
cd "$(dirname "$0")"
docker-compose up -d --build

echo "Deployment complete! Access the Collaboration Hub at http://<your-ecs-ip>:4000/collab-hub.html"
#!/bin/bash
