# Phase 10 Federation Schema

## Overview
This schema defines the communication protocol for federated multi-agent evolution.

## Message Structure

```json
{
  "message_type": "TrendSummaryMessage|GovernanceDeltaMessage|RiskSignalMessage|ProposalPatternMessage|HeartbeatMessage",
  "schema_version": "1.0",
  "node_id": "orchestrator-uuid",
  "timestamp": "2026-02-17T18:30:00Z",
  "signature": "sha256-hex",
  "payload": { }
}
```

## Safety Rules
- No raw logs
- No tenant IDs or PII
- No internal traces
- Max 32 KB per message
- All messages must be signed
- All messages must be timestamped

## Message Types

### TrendSummaryMessage
```json
{
  "cluster_name": "production",
  "latency_trend": "IMPROVING|STABLE|DEGRADING",
  "memory_trend": "IMPROVING|STABLE|DEGRADING",
  "error_trend": "IMPROVING|STABLE|DEGRADING",
  "improvement_rate": 0.15,
  "observation_count": 10
}
```

### RiskSignalMessage
```json
{
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "reason": "description",
  "affected_nodes": ["node-1"],
  "recommendation": "ACTION"
}
```

### ProposalPatternMessage
```json
{
  "pattern_name": "small-index-consolidation",
  "success_rate": 0.89,
  "average_improvement": 0.42,
  "occurrences_across_clusters": 3
}
```

### HeartbeatMessage
```json
{
  "is_healthy": true,
  "last_optimization": "2026-02-17T18:15:00Z",
  "proposal_count": 15,
  "success_rate": 0.92
}
```

## Validation
- Schema validation required
- Signature validation required
- Timestamp within ±30 seconds
- Message size < 32 KB

**Version:** 1.0
**Status:** Phase 10 Specification
