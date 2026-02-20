# Autonomous Elasticsearch Evolution Agent + AI Integration

## Overview

This project combines the Autonomous Elasticsearch Evolution Agent with AI-powered analytics capabilities. The integration enhances the autonomous system with natural language processing and advanced analytics powered by both OpenAI GPT-4 and Anthropic Claude models.

## Architecture

### Core Components

1. **Autonomous Elasticsearch Evolution Agent**
   - Implements 14-phase autonomous optimization
   - Includes persistent memory, metrics collection, and optimization logic
   - Features multi-agent communication and federation capabilities

2. **AI Agent (ES-AI-Agent)**
   - Natural language to Elasticsearch query conversion
   - Support for both Query DSL and ES|QL
   - Dual LLM support (OpenAI & Claude)
   - Result summarization capabilities

3. **Integration Layer**
   - Enhanced Research Agent with AI-powered insights
   - Optimizer with AI-enhanced proposal generation
   - Real-time dashboard with WebSocket updates

## Features

### Enhanced Research Agent
- Standard metrics analysis capabilities
- AI-powered advanced pattern recognition
- Integration with Claude/OpenAI for complex analysis
- Automatic insight generation and prioritization

### Enhanced Optimizer
- Traditional ML-based prediction
- AI-generated optimization strategies
- Hybrid approach combining traditional and AI methods
- Enhanced proposal generation with natural language understanding

### Multi-Agent Communication
- Message passing system with real-time monitoring
- Federation capabilities across clusters
- Persistent memory for state preservation

### Real-time Dashboard
- Live metrics visualization
- Optimization tracking
- Research insights display
- Agent status monitoring

## Setup

### Prerequisites
- Node.js v16 or higher
- Elasticsearch cluster (cloud or local)
- OpenAI API key (optional)
- Anthropic API key (optional)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Start the system:
   ```bash
   # For Azure Dev Tunnel (recommended)
   node start-mock-server.js
   
   # For full functionality with Elasticsearch
   npm start
   ```

## Usage

### CLI Interface
```bash
npm run cli "Show me performance trends"
```

### Web API
```bash
# Start server
npm run server

# Query the API
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me all records", "provider": "claude"}'
```

### Azure Dev Tunnel
1. Start the mock server: `node start-mock-server.js`
2. Set up port forwarding: Local Port 8000 → Remote Port 3001
3. Access dashboard at: http://localhost:8000

## API Endpoints

- `GET /health` - System health check
- `POST /ask` - Natural language query interface

## Configuration

### Environment Variables

- `ELASTIC_CLOUD_ID` - Elasticsearch cloud ID
- `ELASTIC_API_KEY` - Elasticsearch API key
- `ELASTIC_ENDPOINT` - Direct endpoint (alternative to cloud ID)
- `ELASTIC_INDEX` - Default index to query
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `DEFAULT_LLM` - Default provider ('claude' or 'openai')
- `PORT` - Server port (default: 3000)

## Integration Details

### Research Agent Enhancement
The ResearchAgent now uses the AI agent to:
- Perform advanced pattern analysis
- Generate insights beyond basic threshold checks
- Provide natural language summaries of complex metrics
- Suggest optimization strategies based on AI analysis

### Optimizer Enhancement
The ElasticsearchSearchOptimizer integrates AI capabilities to:
- Enhance optimization proposals with AI suggestions
- Generate alternative strategies using natural language processing
- Combine traditional ML predictions with AI insights
- Improve decision quality through hybrid analysis

## Development

### Adding New Features
1. Extend the AI agent with new analysis capabilities
2. Integrate with the existing message passing system
3. Update the dashboard to visualize new metrics
4. Preserve state with the persistent memory system

### Extending AI Capabilities
The AI agent can be extended to:
- Support additional query types
- Integrate with more sophisticated analytics
- Add conversation memory for complex interactions
- Implement domain-specific optimization strategies

## Deployment

For production deployment:
1. Ensure secure API key management
2. Configure appropriate resource limits
3. Set up monitoring and alerting
4. Implement proper error handling and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT