# Dockerfile for Collaboration Hub (ECS-ready)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:4000/api/stats || exit 1
CMD ["node", "collab-hub-server.js"]