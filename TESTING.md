# Testing the Autonomous Elasticsearch Evolution Agent

This guide provides instructions for testing the Autonomous Elasticsearch Evolution Agent with AI integration.

## Quick Test

Run the simple test to verify basic functionality:

```bash
node simple-test.js
```

This test exercises:
- Research agent analysis capabilities
- Report generation
- Coding agent code generation
- Persistent memory functionality

## Full System Test with Mock Server

For a complete system test with real-time dashboard:

```bash
node start-mock-server.js
```

Then:
1. Open your browser to http://localhost:3001
2. The system will run continuous optimization cycles
3. Watch the dashboard for real-time metrics and insights

## Azure Dev Tunnel Setup

To access the system remotely:

1. Start the mock server:
```bash
node start-mock-server.js
```

2. In Azure Portal:
   - Click "Forward a Port"
   - Local Port: 8000
   - Remote Port: 3001

3. Access the dashboard at http://localhost:8000

## Integration Test

Run the integration test to verify AI agent functionality:

```bash
node test-integration.js
```

Note: This test will skip AI functionality if API keys aren't configured.

## API Testing

If you run the server version:

```bash
npm run server
```

You can test the API endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Natural language query (requires API keys)
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Analyze my cluster performance", "provider": "claude"}'
```

## Manual Testing Scenarios

### 1. Research Agent Testing
- Verify insights generation from cluster metrics
- Check pattern detection in metrics history
- Confirm persistent storage of insights

### 2. Coding Agent Testing
- Validate code snippet generation from research reports
- Check template-based optimization code generation
- Verify code persistence

### 3. Optimizer Testing
- Run optimization cycles and check results
- Verify proposal generation and selection
- Confirm ML predictor training

### 4. Multi-Agent Communication
- Check message passing between agents
- Verify communication monitoring
- Confirm event handling

## Expected Results

When testing completes successfully, you should see:
- Research agent generating 4+ insights from basic metrics
- Coding agent generating optimization code snippets
- Persistent memory storing data correctly
- All agents initializing without errors
- Communication between agents working properly

## Troubleshooting

### Missing Node Error
If you see "Missing node(s) option", this occurs when the Elasticsearch client initializes without proper configuration. This is expected in testing environments without a real ES cluster.

### API Keys Not Configured
AI features will be skipped if ANTHROPIC_API_KEY or OPENAI_API_KEY are not set in your .env file.

### Port Conflicts
If ports 3000 or 3001 are in use, stop other processes or modify the server configuration.

## Configuration for Full Functionality

To enable all features:

1. Set up Elasticsearch credentials in `.env`:
```bash
ELASTIC_CLOUD_ID=your-cloud-id
ELASTIC_API_KEY=your-api-key
```

2. Set up AI API keys in `.env`:
```bash
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

3. Install dependencies:
```bash
npm install
```

## Production Testing

For production-like testing:
1. Use real Elasticsearch cluster credentials
2. Configure with actual API keys
3. Run the full server: `npm start`
4. Monitor logs and metrics
5. Verify optimization results

The system is designed to be resilient and will operate in degraded mode when optional services are unavailable.