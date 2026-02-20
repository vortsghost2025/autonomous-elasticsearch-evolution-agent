# Persistent Memory System for Autonomous Elasticsearch Evolution Agent

## Overview

The Persistent Memory System ensures that the autonomous Elasticsearch optimization agent maintains its state, history, and learned patterns across restarts. This prevents data loss when the agent resets and enables continuous learning over time.

## Key Features

### 1. Optimization History Preservation
- Stores all optimization cycles with metadata
- Maintains timestamps, results, and effectiveness metrics
- Enables historical analysis of optimization outcomes

### 2. Error Logging
- Persists error logs between agent restarts
- Prevents loss of diagnostic information
- Maintains recent error history (last 100 entries)

### 3. Learned Pattern Storage
- Saves cross-cluster patterns discovered during federation
- Maintains pattern metadata and creation timestamps
- Enables transfer of learnings between agent sessions

### 4. Metrics Continuity
- Preserves collected metrics history
- Maintains trend calculations across restarts
- Supports long-term monitoring and analysis

## Architecture

```
┌─────────────────────────────────────┐
│     Autonomous Elasticsearch        │
│       Evolution Agent               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │     Persistent Memory           │ │
│ │     (persistent-memory.js)      │ │
│ └─────────────────────────────────┘ │
│            │                        │
│            ▼                        │
│ ┌─────────────────────────────────┐ │
│ │   Memory Store (JSON file)      │ │
│ │   (memory-store.json)           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Components

### PersistentMemory Class
- Core memory management functionality
- Load/save to persistent storage
- Data access methods (get/set/delete)
- Specialized methods for agent data types

### Integration Points
- [ElasticsearchSearchOptimizer](./elasticsearch-search-optimizer.js) - stores optimization history and state
- [ElasticsearchMetricsCollector](./elasticsearch-metrics-collector.js) - preserves metrics history
- [ProposalApplier](./proposal-applier.js) - maintains change logs

## Usage

### Basic Memory Operations
```javascript
import { PersistentMemory } from './persistent-memory.js';

const memory = new PersistentMemory({ storagePath: './memory-store.json' });
await memory.load();

// Store data
await memory.set('key', { some: 'data' });

// Retrieve data
const value = await memory.get('key', 'defaultValue');

// Add to optimization history
await memory.addToOptimizationHistory({
  cycleId: 'cycle-123',
  strategy: 'PERFORMANCE_FIRST',
  result: { success: true }
});
```

### Memory Inspection
Run the memory inspector utility to view stored data:

```bash
node memory-inspector.js
```

This displays:
- Current keys in memory
- Optimization history
- Error logs
- Learned patterns
- Metrics history count

## Sample Persistent Memory Snapshot

After a typical run, the `memory-store.json` file would look like this:

```json
{
  "agentState": {
    "lastOptimization": {
      "cycleId": "demo-cycle-1",
      "strategy": {
        "name": "BALANCED",
        "parameters": {
          "aggressiveness": 0.7,
          "riskTolerance": 0.6
        }
      },
      "analysis": {
        "timestamp": 1708450000000,
        "healthStatus": "yellow",
        "issues": [],
        "opportunities": [],
        "urgencyLevel": "MEDIUM"
      },
      "proposals": [
        {
          "rank": 1,
          "title": "Merge small indexes",
          "description": "Consolidate fragmented small indexes",
          "estimatedImprovement": 0.42,
          "estimatedMemorySavings": 0.25,
          "riskLevel": "LOW",
          "confidence": 0.89
        }
      ],
      "approvedProposal": {
        "rank": 1,
        "title": "Merge small indexes",
        "description": "Consolidate fragmented small indexes",
        "estimatedImprovement": 0.42,
        "estimatedMemorySavings": 0.25,
        "riskLevel": "LOW",
        "confidence": 0.89
      },
      "result": {
        "success": true,
        "proposal": "Merge small indexes",
        "expectedImprovement": 0.42,
        "timestamp": 1708450001000
      },
      "timestamp": 1708450001000
    },
    "optimizationHistory": [
      // Array of optimization cycles
    ],
    "lastUpdated": 1708450001000
  },
  "optimizationHistory": [
    {
      "cycleId": "demo-cycle-1",
      "strategy": {
        "name": "BALANCED",
        "parameters": {
          "aggressiveness": 0.7,
          "riskTolerance": 0.6
        }
      },
      "result": {
        "success": true,
        "proposal": "Merge small indexes",
        "expectedImprovement": 0.42,
        "timestamp": 1708450001000
      },
      "timestamp": 1708450001000
    }
  ],
  "errorLog": [
    {
      "message": "Connection timeout to external service",
      "stack": "Error: Connection timeout...",
      "timestamp": 1708450002000,
      "type": "ERROR"
    }
  ],
  "learnedPatterns": [
    {
      "name": "Index consolidation reduces latency",
      "description": "Merging small indexes improves query performance",
      "effectiveness": 0.42,
      "createdAt": 1708450003000
    }
  ],
  "metricsHistory": [
    // Array of collected metrics with timestamps
  ]
}
```

This sample shows the actual data structure used to maintain continuity across agent restarts.

## Storage Format

Data is stored in JSON format in `memory-store.json`:

```json
{
  "agentState": {
    "lastOptimization": {},
    "optimizationHistory": [],
    "lastUpdated": 1234567890
  },
  "optimizationHistory": [
    {
      "cycleId": "cycle-1",
      "strategy": {},
      "result": {},
      "timestamp": 1234567890
    }
  ],
  "errorLog": [
    {
      "message": "Error message",
      "stack": "Stack trace",
      "timestamp": 1234567890,
      "type": "ERROR"
    }
  ],
  "learnedPatterns": [
    {
      "name": "Pattern name",
      "createdAt": 1234567890
    }
  ],
  "metricsHistory": [...]
}
```

## Benefits

1. **Continuous Learning**: The agent remembers past optimizations and their outcomes
2. **Robustness**: Error logs persist across restarts for diagnostics
3. **Historical Analysis**: Track performance improvements over time
4. **Federation Readiness**: Patterns learned in one session are available in future sessions
5. **State Continuity**: Agent state is preserved during updates or crashes

## Configuration

The persistent memory can be configured with options:

```javascript
const memory = new PersistentMemory({
  storagePath: './custom-path/memory-store.json'  // Custom storage location
});
```

## Security Considerations

- Memory store contains operational data but no sensitive credentials
- Ensure appropriate file permissions on memory store file
- Regular backup of memory store may be desired for production environments

## Performance Notes

- Memory store is updated after each significant operation
- Automatic cleanup of error logs prevents unlimited growth
- Metrics history is limited to 1000 entries per instance