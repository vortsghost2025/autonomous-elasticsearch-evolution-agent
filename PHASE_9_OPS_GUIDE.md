# Phase 9 Operational Guide

## System Modes & Triggers

### 1. Analysis Mode
**What it does:** Collects real-time metrics from Elasticsearch cluster

**Triggered by:**
- Scheduled (hourly by default)
- Manual operator request
- Metric threshold breach

**What to watch for:**
- Collection success rate > 95%
- Metrics freshness < 5 minutes
- No missing critical metrics

### 2. Strategy Mode
**What it does:** Selects optimization strategy based on cluster state

**Available strategies:**
- `PERFORMANCE_FIRST` — aggressive latency optimization
- `BALANCED` — tradeoff across all metrics
- `STABILITY_FOCUSED` — conservative, minimal risk
- `MAINTENANCE` — preventive tuning only

**Triggered by:**
- Analysis Mode completion
- Manual strategy override

**What to watch for:**
- Strategy selection consistency
- No oscillating between strategies
- Strategy matches cluster urgency level

### 3. Simulation Mode
**What it does:** Tests optimization scenarios safely before applying

**Scenarios tested:**
- Scenario A: Index consolidation
- Scenario B: Shard rebalancing
- Scenario C: Compression enablement
- Scenario D: Refresh interval tuning
- Scenario E: Combined approach

**Triggered by:**
- Strategy Mode completion

**What to watch for:**
- Simulation success rate > 80%
- Confidence scores stable
- No prediction mismatches

### 4. Governance Mode
**What it does:** Validates proposals against safety constraints

**Constraints checked:**
- Confidence threshold (min 85%)
- Risk level (max MEDIUM)
- Cluster health (not RED)
- Rollback capability
- No repeated failures

**Triggered by:**
- Proposal generation

**What to watch for:**
- Approval rate healthy (20-60%)
- Approval reasons clear
- Veto reasons documented

### 5. Evolution Mode
**What it does:** Applies approved optimizations to cluster

**Execution steps:**
1. Pre-flight safety checks
2. Apply changes strategically
3. Monitor for regression
4. Record changes for rollback
5. Verify improvements

**Triggered by:**
- Governance Mode approval

**What to watch for:**
- Application success rate > 95%
- No cascading failures
- Rollback mechanism tested regularly

---

## Safety Rails & Governance Boundaries

### Hard Limits (Never Exceeded)

- **Confidence**: Must be ≥ 85% OR operator overrides
- **Risk Level**: LOW only, unless MEDIUM + explicit approval
- **Cluster Health**: No changes if status is RED
- **Rollback Window**: Changes must be reversible within 5 minutes

### Soft Limits (Watchdog Enforced)

- **Query Error Rate**: If > 5%, pause evolution
- **Memory Pressure**: If JVM heap > 90%, conservative only
- **Disk Space**: If free space < 10%, no large changes
- **Network Latency**: If > 100ms to nodes, defer changes

### Boundary Conditions

- **Cold Start**: First 24 hours = MAINTENANCE only
- **Recent Failure**: If change failed < 1 hour ago, escalate
- **Drift Detection**: If metrics diverge from prediction > 15%, investigate
- **Oscillation**: If same proposal rejected twice, disable for 24h

---

## Logs & Metrics to Monitor

### Critical Logs

```
[PHASE_8] Cluster analysis complete
[PHASE_9] Strategy selected: {STRATEGY}
[PHASE_12] Simulation results: {SCENARIOS}
[PHASE_13] Proposals generated: {COUNT}
[PHASE_E] Governance check: {APPROVED|VETOED}
[APPLY] Changes applied: {DETAILS}
[ROLLBACK] Triggered: {REASON}
```

### Key Metrics

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Confidence Score | > 85% | 75-85% | < 75% |
| Success Rate | > 95% | 85-95% | < 85% |
| Approval Rate | 20-60% | 10-20%, 60-80% | < 10%, > 80% |
| Drift Ratio | < 10% | 10-20% | > 20% |
| Simulation Match | > 80% | 70-80% | < 70% |
| Rollback Rate | < 5% | 5-15% | > 15% |

---

## Health Indicators

### Green Status (All Good)
- [ ] Confidence scores stable and high (85%+)
- [ ] No vetoes in last 24 hours
- [ ] Strategy selection consistent with cluster state
- [ ] Simulation success rate > 80%
- [ ] Applied changes match predictions
- [ ] Approval rate 20-60%
- [ ] Zero rollbacks in last 7 days

### Yellow Status (Investigate)
- [ ] Confidence declining (75-85%)
- [ ] 1-2 vetoes in last 24 hours
- [ ] Strategy oscillating
- [ ] Simulation success rate 70-80%
- [ ] Predictions drift > 10%
- [ ] Approval rate < 20% or > 80%
- [ ] Minor rollbacks (< 5% rate)

### Red Status (Urgent)
- [ ] Confidence very low (< 75%)
- [ ] Repeated vetoes (3+ in 24h)
- [ ] Cluster health degrading despite changes
- [ ] Simulation success rate < 70%
- [ ] Predictions drift > 20%
- [ ] Approval rate extreme (< 10%, > 80%)
- [ ] High rollback rate (> 15%)

**Action for Red:** Pause evolution, escalate to operator

---

## Troubleshooting

### Problem: "High drift detected"
**Meaning:** Actual results don't match predictions

**Check:**
1. Cluster state changed unexpectedly?
2. Simulation model needs recalibration?
3. External factors (traffic spike, hardware issue)?

**Fix:**
1. Run manual analysis
2. Tighten simulation parameters
3. Pause evolution temporarily
4. Document drift pattern

### Problem: "Repeated vetoes"
**Meaning:** Governance rejecting same proposal multiple times

**Check:**
1. Confidence threshold too high?
2. Risk assessment too conservative?
3. Safety constraint misconfigured?

**Fix:**
1. Review rejection reasons
2. Adjust governance settings
3. Or accept more risk (deliberately)
4. Escalate if unsure

### Problem: "Simulation failures"
**Meaning:** Simulation engine can't generate valid scenarios

**Check:**
1. Cluster metrics incomplete?
2. Simulation params out of bounds?
3. Storage/memory exhausted?

**Fix:**
1. Verify metrics collection
2. Reset simulation engine
3. Check system resources
4. Reduce simulation complexity

### Problem: "No improvements detected"
**Meaning:** Changes applied but cluster state unchanged

**Check:**
1. Was change really applied?
2. Did it actually execute?
3. Need more time to take effect?

**Fix:**
1. Check execution logs
2. Verify cluster responded to commands
3. Wait longer (some changes async)
4. Manual investigation required

---

## Standard Operating Procedures (SOPs)

### Daily Checks
- [ ] Review health status (green, yellow, red?)
- [ ] Check approval rate (healthy range?)
- [ ] Monitor for rollbacks (any recent?)
- [ ] Verify no drift > 20%
- [ ] Confirm rollback capability works

### Weekly Reviews
- [ ] Analyze trends in improvement rate
- [ ] Review vetoed proposals (why rejected?)
- [ ] Check strategy distribution (balanced?)
- [ ] Audit cluster state changes
- [ ] Assess ROI (improvements vs. risk)

### Monthly Actions
- [ ] Recalibrate simulation if needed
- [ ] Review and adjust governance thresholds
- [ ] Update operational runbooks
- [ ] Conduct rollback drill (verify 5-min window)
- [ ] Share learnings with team

---

End of Phase 9 Operational Guide
