## Federation Negotiation Example
This example shows how proposals are negotiated and merged across clusters in Phase 10:

**Scenario:**
- Cluster A proposes: `merge_small_indices` (expected improvement: 25%, risk: LOW)
- Cluster B detects a risk and sends a `RiskSignalMessage` (risk: HIGH, reason: "Index merge may overload node-2")
- Cluster C promotes a successful pattern: `shard_rebalance` (success_rate: 0.92, average_improvement: 0.18)

**Federation Message Exchange:**
1. **Cluster A** broadcasts:
   ```json
   {
     "message_type": "ProposalPatternMessage",
     "pattern_name": "merge_small_indices",
     "success_rate": 0.75,
     "average_improvement": 0.25
   }
   ```
2. **Cluster B** broadcasts:
   ```json
   {
     "message_type": "RiskSignalMessage",
     "risk_level": "HIGH",
     "reason": "Index merge may overload node-2",
     "affected_nodes": ["node-2"],
     "recommendation": "VETO"
   }
   ```
3. **Cluster C** broadcasts:
   ```json
   {
     "message_type": "ProposalPatternMessage",
     "pattern_name": "shard_rebalance",
     "success_rate": 0.92,
     "average_improvement": 0.18
   }
   ```

**Merging Outcome:**
- The `merge_small_indices` proposal is vetoed due to Cluster B's HIGH risk signal.
- The `shard_rebalance` pattern is promoted as the new candidate action, since it has a high success rate across clusters.

**Result:**
- Final merged proposal: `shard_rebalance` (confidence: 0.91, risk: LOW, promoted by federation consensus)

This example demonstrates how cross-cluster negotiation can veto risky actions and promote proven patterns, ensuring safer and more effective optimizations.
# Copilot Instructions for Autonomous Elasticsearch Evolution Agent

## Overview
This project implements a 14-phase autonomous system for optimizing Elasticsearch clusters. It features multi-agent federation, persistent memory, and governance constraints to ensure safe, adaptive, and scalable optimization.


## Architecture
- **Core Agent:** `elasticsearch-search-optimizer.js` — Implements the main 14-phase optimization loop. Each phase is a method, chained in sequence, with explicit inputs/outputs and safety checks:
  
  | Phase | Purpose | Inputs | Outputs | Safety Checks/Notes |
  |-------|---------|--------|---------|--------------------|
  | 1     | Collect cluster metrics | ES API, previous state | Raw metrics | Validate data freshness |
  | 2     | Preprocess metrics | Raw metrics | Cleaned metrics | Sanity checks on values |
  | 3     | Detect anomalies | Cleaned metrics | Anomaly report | Alert if critical anomaly |
  | 4     | Aggregate trends | Metrics, anomaly report | Trend summary | None |
  | 5     | Identify issues | Trends, metrics | Issue/opportunity list | None |
  | 6     | Prioritize issues | Issue list | Ranked issues | None |
  | 7     | Generate candidate actions | Ranked issues | Candidate actions | None |
  | 8     | Analyze architecture & health | Metrics, actions | Health status, opportunities | Health status must not be 'red' for changes |
  | 9     | Select optimization strategy | Health, urgency | Strategy (e.g., AGGRESSIVE, BALANCED) | Strategy must match urgency |
  | 10    | Federation (cross-cluster) | Local proposals, federation messages | Shared patterns, risk signals | All messages signed, <32KB, no PII |
  | 11    | Learn cross-domain patterns | Federation data | Pattern library | None |
  | 12    | Simulate optimization scenarios | Analysis, strategy | Simulated outcomes, proposals | Simulation must not predict critical risk |
  | 13    | Rank and select proposals | Simulations | Ranked proposals | Top proposal must pass governance |
  | E     | Governance & constraints | Top proposal, analysis | Approval/rejection | Confidence ≥ 0.85, risk ≠ 'HIGH', health ≠ 'red' |
  | 14    | Apply or rollback | Approved proposal | Apply result, updated state | Rollback if apply fails or post-apply health worsens |

- **Persistent State:** `persistent-memory.js` — Stores agent state, optimization history, and enables recovery across restarts.
- **Federation:** See `PHASE_10_FEDERATION_SCHEMA.md` for message types and safety rules governing cross-cluster communication.


## Key Patterns & Conventions
- **Phase Methods:** Each phase is a method in `ElasticsearchSearchOptimizer`. Example: `phase8AnalyzeArchitecture(metrics)` returns health and opportunities. Phases chain by passing outputs as inputs to the next.
- **Safety Checks:** At each phase, critical failures (e.g., health 'red', simulation predicts risk) halt or trigger rollback.
- **Strategy Selection:** `phase9SelectStrategy()` chooses strategy based on urgency and metrics.
- **Simulation:** `phase12SimulateAndPropose()` predicts impact before applying changes.
- **Federation Messages:** All federation messages must be signed, timestamped, and <32KB. No PII/logs. See `PHASE_10_FEDERATION_SCHEMA.md`.


## Developer Workflows
- **Run Agent:** Use `node demo.js` or connect to a real cluster with `node connect-real-cluster.js` (see `VIDEO_SCRIPT.md`).
- **State Inspection:** Use `PersistentMemory` methods to inspect or modify agent state/history.
- **Debugging:** Focus on phase methods and proposal application logic. Governance checks are critical for safety.


## Governance (Phase E)
- **Confidence Scoring:** Each proposal is assigned a confidence score (0-1). Only proposals with confidence ≥ 0.85 are eligible for application.
- **Risk Classification:** Proposals are classified as LOW, MEDIUM, HIGH, or CRITICAL risk. HIGH/CRITICAL risk proposals are rejected.
- **Health Thresholds:** Cluster health must not be 'red' (critical) for any change to be applied.
- **Rejection:** Proposals are rejected if any of: confidence < 0.85, risk is HIGH/CRITICAL, or health is 'red'.
- **Rollback:** If a proposal is applied and post-apply health degrades (e.g., health turns 'red'), or if apply fails, the agent triggers rollback using persistent state.
- **Example Governance Check:**
  ```js
  if (proposal.confidence >= 0.85 && proposal.riskLevel !== 'HIGH' && analysis.healthStatus !== 'red') {
    // Approve
  } else {
    // Reject or rollback
  }
  ```



## Federation (Phase 10)
- **When Sent:** Federation messages are sent after local analysis (Phase 9) and whenever a new trend, risk, or proposal pattern is detected. Broadcasts are triggered by significant metric changes, anomaly detection, or proposal generation.
- **Merging Proposals:** Agents merge proposals by comparing received patterns and risk signals, promoting those with high success rates across clusters. Example:
  ```js
  // After receiving federation messages:
  if (pattern.success_rate > 0.8 && !localPatterns.includes(pattern.name)) {
    promotePattern(pattern);
  }
  if (riskSignal.risk_level === 'HIGH') {
    vetoLocalProposal();
  }
  ```
- **Message Types:**
  - `TrendSummaryMessage`, `RiskSignalMessage`, `ProposalPatternMessage`, `HeartbeatMessage` (see `PHASE_10_FEDERATION_SCHEMA.md`)
- **Message Example:**
  ```json
  {
    "message_type": "TrendSummaryMessage",
    "schema_version": "1.0",
    "node_id": "orchestrator-uuid",
    "timestamp": "2026-02-17T18:30:00Z",
    "signature": "sha256-hex",
    "payload": {
      "cluster_name": "production",
      "latency_trend": "IMPROVING",
      "memory_trend": "STABLE",
      "error_trend": "DEGRADING",
      "improvement_rate": 0.15,
      "observation_count": 10
    }
  }
  ```
- **Signing Rules:** All federation messages must be cryptographically signed and include a timestamp.
- **Size Limits:** Max 32KB per message.
- **Allowed Fields:** Only schema-defined fields (see `PHASE_10_FEDERATION_SCHEMA.md`).
- **Forbidden Fields:** No raw logs, no tenant IDs, no PII, no internal traces.
- **Negotiation:** Agents negotiate proposals by sharing patterns and risk signals. If a pattern is successful across clusters, it is promoted. Risk signals can veto proposals. All negotiation is via signed, schema-conformant messages.

## Simulation (Phase 12)
- **Simulated Metrics:** Simulates impact on latency, memory, error rates, and cost for each candidate proposal.
- **Confidence Computation:** Simulation confidence is based on historical outcomes, model accuracy, and variance in predicted improvements. Example:
  ```js
  proposal.confidence = Math.min(1, 0.7 + 0.2 * proposal.simulationSuccessRate);
  ```
- **Governance Integration:** Only proposals with simulated confidence ≥ 0.85 and no predicted critical risk are passed to governance. Example:
  ```js
  if (proposal.confidence >= 0.85 && proposal.simulatedRisk !== 'HIGH') {
    passToGovernance(proposal);
  }
  ```

## Rollback Logic
- **Triggers:** Rollback is triggered if proposal application fails or if post-apply health status worsens (e.g., turns 'red').
- **How Applied:** The agent restores the previous state from persistent memory and reverts any changes.
- **Logging:** All rollbacks are logged with timestamp and reason. Example:
  ```js
  if (applyResult.success === false || postApplyHealth === 'red') {
    PersistentMemory.restoreLastState();
    log('Rollback triggered', { time: Date.now(), reason: 'Health degraded' });
  }
  ```



## 14-Phase Example Trace
This example shows a full run through all 14 phases, starting from a cluster under mild stress:

**Initial State:**
- Cluster health: yellow
- Latency: 120ms (target: 80ms)
- Memory: 75% heap
- Error rate: 0.8%

**Phase-by-Phase Flow:**
1. **Collect metrics:**
  - Input: ES API
  - Output: `{ latency: 120, heap: 75, errors: 0.8, health: 'yellow' }`
2. **Preprocess metrics:**
  - Output: `{ latency: 120, heap: 75, errors: 0.8, health: 'yellow' }`
3. **Detect anomalies:**
  - Output: `[ { type: 'latency_spike', value: 120 } ]`
4. **Aggregate trends:**
  - Output: `{ latency_trend: 'DEGRADING', memory_trend: 'STABLE' }`
5. **Identify issues:**
  - Output: `[ { issue: 'high_latency', severity: 'medium' } ]`
6. **Prioritize issues:**
  - Output: `[ { issue: 'high_latency', rank: 1 } ]`
7. **Generate candidate actions:**
  - Output: `[ { action: 'merge_small_indices', est_improvement: 25 } ]`
8. **Analyze architecture & health:**
  - Output: `{ healthStatus: 'yellow', opportunities: [ 'merge_small_indices' ] }`
9. **Select strategy:**
  - Output: `{ name: 'BALANCED', parameters: { aggressiveness: 0.5 } }`
10. **Federation:**
   - Input: local proposal, federation messages
   - Output: `{ sharedPatterns: [], riskSignals: [] }`
11. **Learn cross-domain patterns:**
   - Output: `{ patterns: [] }`
12. **Simulate scenarios:**
   - Output: `[ { proposal: 'merge_small_indices', predicted_latency: 90, confidence: 0.88, risk: 'LOW' } ]`
13. **Rank/select proposals:**
   - Output: `[ { proposal: 'merge_small_indices', confidence: 0.88, risk: 'LOW' } ]`
E. **Governance:**
   - Input: top proposal
   - Output: `APPROVED` (confidence 0.88 ≥ 0.85, risk LOW, health yellow)
14. **Apply or rollback:**
   - Proposal applied
   - Post-apply health: green

**If simulation predicted risk='HIGH' or post-apply health turned red:**
  - Rollback triggered, previous state restored, event logged.

This trace illustrates how data flows, how governance filters proposals, and how rollback is triggered if safety is violated.

## References
- `elasticsearch-search-optimizer.js` — Main agent logic
- `persistent-memory.js` — State management
- `PHASE_10_FEDERATION_SCHEMA.md` — Federation protocol
- `SUBMISSION_STRATEGY.md` — Architecture and differentiators
- `VIDEO_SCRIPT.md` — Demo flow and phase commentary

---

**Feedback Requested:**
Please review for clarity and completeness. Suggest additions for undocumented workflows, conventions, or integration points.