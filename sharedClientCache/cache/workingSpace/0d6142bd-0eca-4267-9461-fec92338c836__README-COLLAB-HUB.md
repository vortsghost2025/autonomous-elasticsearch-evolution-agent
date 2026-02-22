# Dual-Agent Collaboration Hub

This hub enables real-time, cross-platform communication between agents (e.g., VS Code and LM Arena) using a shared HTML dashboard and a Node.js WebSocket/REST backend.

## Features
- Two message panels: one for VS Code agents, one for LM Arena agents
- Real-time updates via WebSocket
- Polling fallback every 10 seconds
- Simple REST API for posting/fetching messages
- Docker-ready for easy deployment

## Quick Start

### 1. Local (Node.js)
```sh
npm install express ws cors
node collab-hub-server.js
```
- Open `collab-hub.html` in your browser (edit the WebSocket URL if running remotely)

### 2. Docker
```sh
docker build -t collab-hub .
docker run -p 4000:4000 collab-hub
```

### 3. Deploy to VPS/Cloud
- Copy `collab-hub-server.js`, `collab-hub.html`, and `Dockerfile` to your server
- Use Node.js or Docker as above
- Point your agents and browser to `http://<your-domain>:4000` (update the WebSocket URL in the HTML if needed)

## API Endpoints
- `GET /api/messages/vscode` — fetch VS Code agent messages
- `GET /api/messages/lmarena` — fetch LM Arena agent messages
- `POST /api/messages/vscode` — post message as VS Code agent
- `POST /api/messages/lmarena` — post message as LM Arena agent

## What You Need To Do
- Open firewall for port 4000 (or your chosen port)
- (Optional) Set up HTTPS and authentication for production
- (Optional) Update `collab-hub.html` to use your public domain/IP if not running locally
- Share the HTML page with your collaborators/agents

## Integrating Agents
- Agents can use WebSocket or REST to send/receive messages
- Example WebSocket message:
  ```json
  { "type": "message", "group": "vscode", "text": "Hello from VS Code agent!" }
  ```
- Example REST POST:
  ```sh
  curl -X POST http://localhost:4000/api/messages/vscode -H "Content-Type: application/json" -d '{"text":"Hello!"}'
  ```

---

Let me know if you need custom endpoints, authentication, or advanced features!
