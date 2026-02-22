# Autonomous Elasticsearch Evolution Agent - Multi-Agent System

## Overview

The Autonomous Elasticsearch Evolution Agent is now a complete multi-agent system that can run in multiple modes simultaneously:

- **Local Agent**: Full dashboard interface with interactive controls
- **Background Agent**: Silent operation with automated tasks
- **Cloud Agent**: Remote access with secure connections
- **Orchestrator**: Coordinates swarm behavior and federated learning

## Getting Started

### Single Agent (Quick Start)

To run a single agent with dashboard:

```bash
node start-mock-server.js
```

Visit `http://localhost:3001` to see the dashboard.

### Multi-Agent System

To run the complete multi-agent system:

```bash
node start-master-system.js
```

This will start:
- Local Agent on port 3001
- Background Agent on port 3002
- Cloud Agent on port 3003
- Orchestration Bus on port 3101

## Dashboard Features

The dashboard now includes:

- **Agent Controls**: Trigger optimization cycles, analysis, and simulations
- **Multi-Agent Orchestration**: Execute commands across all agents simultaneously
- **Agent Selection**: Choose which agents to target with commands
- **Communication Interface**: Chat with agents and send commands
- **Real-time Monitoring**: Track all agents from a single interface

## Master Control Panel

The new master control panel provides centralized orchestration capabilities:

- **Access**: `http://localhost:3001/master`
- **Features**:
  - Real-time agent status monitoring
  - Swarm command execution
  - Agent coordination controls
  - Federation management
  - Direct command execution
  - Multi-agent communication hub

## Multi-Agent Capabilities

### 1. Swarm Commands
Execute coordinated actions across multiple agents simultaneously using the "Execute Swarm Command" button.

### 2. Agent Coordination
Coordinate complex tasks between agents using the "Coordinate Agents" feature.

### 3. Federation
Share patterns and learnings between agents using the federation system.

### 4. Centralized Management
Control all agents from a single dashboard interface.

## Azure Dev Tunnel Setup

For remote access:

1. Start the master system: `node start-master-system.js`
2. In Azure Portal, forward ports:
   - Local Port 8001 → Remote Port 3001 (Local Agent)
   - Local Port 8002 → Remote Port 3002 (Background Agent)
   - Local Port 8003 → Remote Port 3003 (Cloud Agent)

## Architecture

The system consists of:

- **AgentOrchestrator**: Manages multiple agents and coordinates swarm behavior
- **MasterController**: Provides high-level orchestration and control
- **Individual Agents**: Specialized agents for different tasks and environments
- **Communication Layer**: WebSocket-based messaging between agents
- **Persistent Memory**: Shared state and learning across agents

## Configuration

Agents can be configured via [config/agents-config.js](file://c:\autonomous-elasticsearch-evolution-agent\config\agents-config.js), where you can specify:
- Resource allocation per agent type
- Communication protocols
- Orchestration settings
- Feature sets for each agent profile

## Development

To extend the multi-agent system:

1. Add new agent profiles to [config/agents-config.js](file://c:\autonomous-elasticsearch-evolution-agent\config\agents-config.js)
2. Implement specialized logic in new agent classes
3. Update the orchestrator to manage new agent types
4. Add UI controls to the dashboard for new capabilities

The system is designed to be easily extensible while maintaining consistent communication and coordination patterns.

---

*Part of the 14-phase autonomous optimization architecture with multi-agent federation capabilities*

## Master Orchestration Vision

### System Overview
- **Multi-Agent, Multi-Platform**: The system supports multiple AI agents (Optimizer, Research, Coding, ML Predictor, Simulation Engine) running in different modes: local, background, and cloud.
- **Real-Time Orchestration**: All agents, dashboards, and control panels communicate live via WebSocket, enabling instant updates and collaboration across browsers, VS Code instances, and cloud deployments.
- **Master Control Panel**: A dedicated "Agent Master Control Panel" ([master-panel.html](file://c:\autonomous-elasticsearch-evolution-agent\master-panel.html)) acts as the central hub for orchestrating, chatting with, and commanding all agents.

### Key Features
- **Universal Communication**: All agents and users communicate through a unified backend. Messages, commands, and logs are instantly broadcast to all connected panels and dashboards.
- **Agent Modes & Swarming**: Agents can run locally, in the background, or in the cloud. Swarm and federation features allow you to coordinate multiple agents and clusters.
- **Separation of Concerns**: The master panel is the "brain"—all agent communication is routed through it. Agents do not talk directly unless allowed by the master.
- **Multi-Platform, Multi-User**: Multiple users can open dashboards or master panels on different devices or VS Code instances. All see the same live data and can collaborate in real time.

### Orchestration Capabilities
- **Swarm Command Execution**: Execute coordinated commands across multiple agents simultaneously
- **Agent-to-Agent Coordination**: Facilitate collaboration between different agent types
- **Federation Management**: Enable cross-cluster pattern sharing and learning
- **Real-time Monitoring**: Track agent health, status, and performance metrics
- **Direct Command Interface**: Send specific commands to targeted agents or agent groups

The system represents a complete autonomous infrastructure solution with centralized orchestration, distributed intelligence, and collaborative capabilities.