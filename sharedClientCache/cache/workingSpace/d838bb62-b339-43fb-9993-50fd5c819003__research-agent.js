/**
 * Research Agent for Autonomous Elasticsearch Evolution System
 * Performs analysis of cluster data and generates insights for optimization
 */

import { PersistentMemory } from './persistent-memory.js';

export class ResearchAgent {
  constructor(options = {}) {
    this.agentId = options.agentId || `research-agent-${Date.now()}`;
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.insights = [];
    this.patterns = [];
    this.knowledgeBase = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load research history from persistent memory
      const savedInsights = await this.persistentMemory.get('researchInsights', []);
      if (Array.isArray(savedInsights) && savedInsights.length > 0) {
        this.insights = savedInsights;
        console.log(`[ResearchAgent] Restored ${this.insights.length} historical insights`);
      }

      const savedPatterns = await this.persistentMemory.get('learnedPatterns', []);
      if (Array.isArray(savedPatterns) && savedPatterns.length > 0) {
        this.patterns = savedPatterns;
        console.log(`[ResearchAgent] Restored ${this.patterns.length} learned patterns`);
      }

      this.isInitialized = true;
      console.log('[ResearchAgent] Initialized with persistent memory');
    } catch (error) {
      console.error('[ResearchAgent] Error during initialization:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Analyze cluster metrics and generate insights
   */
  async analyzeClusterMetrics(metrics) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const insights = [];
    const timestamp = Date.now();

    // Analyze cluster health
    if (metrics.health?.status === 'red') {
      insights.push({
        type: 'critical',
        category: 'health',
        description: 'Cluster health is RED - immediate attention required',
        severity: 'critical',
        recommendation: 'Investigate node failures and recover unassigned shards'
      });
    } else if (metrics.health?.status === 'yellow') {
      insights.push({
        type: 'warning',
        category: 'health',
        description: 'Cluster health is YELLOW - some primary shards not replicated',
        severity: 'high',
        recommendation: 'Check replica settings and node availability'
      });
    }

    // Analyze memory usage
    if (metrics.calculated?.memoryUsage > 0.85) {
      insights.push({
        type: 'optimization',
        category: 'memory',
        description: `High memory usage detected: ${(metrics.calculated.memoryUsage * 100).toFixed(1)}%`,
        severity: 'high',
        recommendation: 'Consider increasing heap size or optimizing queries'
      });
    } else if (metrics.calculated?.memoryUsage > 0.75) {
      insights.push({
        type: 'optimization',
        category: 'memory',
        description: `Moderate-high memory usage detected: ${(metrics.calculated.memoryUsage * 100).toFixed(1)}%`,
        severity: 'medium',
        recommendation: 'Review cache settings and consider optimization'
      });
    }

    // Analyze index fragmentation
    if (metrics.calculated?.indexFragmentation > 5) {
      insights.push({
        type: 'optimization',
        category: 'performance',
        description: `High index fragmentation detected: ${metrics.calculated.indexFragmentation.toFixed(2)} segments/doc`,
        severity: 'high',
        recommendation: 'Consider force merging small indexes to reduce fragmentation'
      });
    } else if (metrics.calculated?.indexFragmentation > 2) {
      insights.push({
        type: 'optimization',
        category: 'performance',
        description: `Moderate index fragmentation detected: ${metrics.calculated.indexFragmentation.toFixed(2)} segments/doc`,
        severity: 'medium',
        recommendation: 'Evaluate if merging small indexes would improve performance'
      });
    }

    // Analyze query latency
    if (metrics.calculated?.queryLatency > 1.0) { // 1 second
      insights.push({
        type: 'optimization',
        category: 'performance',
        description: `High query latency detected: ${metrics.calculated.queryLatency.toFixed(3)}s`,
        severity: 'high',
        recommendation: 'Investigate slow queries and consider mapping/index optimizations'
      });
    } else if (metrics.calculated?.queryLatency > 0.5) { // 500ms
      insights.push({
        type: 'optimization',
        category: 'performance',
        description: `Moderate query latency detected: ${metrics.calculated.queryLatency.toFixed(3)}s`,
        severity: 'medium',
        recommendation: 'Review query patterns and index configurations'
      });
    }

    // Analyze shard balance
    if (metrics.calculated?.shardHealth < 0.7) {
      insights.push({
        type: 'optimization',
        category: 'distribution',
        description: `Poor shard distribution: ${(metrics.calculated.shardHealth * 100).toFixed(1)}% balanced`,
        severity: 'medium',
        recommendation: 'Consider rerouting shards for better distribution'
      });
    }

    // Store insights
    const insightRecord = {
      timestamp,
      clusterName: metrics.clusterName,
      insights,
      summary: this.generateSummary(insights),
      metricsSnapshot: {
        healthStatus: metrics.health?.status,
        memoryUsage: metrics.calculated?.memoryUsage,
        fragmentation: metrics.calculated?.indexFragmentation,
        queryLatency: metrics.calculated?.queryLatency,
        shardHealth: metrics.calculated?.shardHealth
      }
    };

    this.insights.push(insightRecord);
    
    // Persist to memory
    await this.persistentMemory.set('researchInsights', this.insights);

    return insightRecord;
  }

  /**
   * Generate a summary of insights
   */
  generateSummary(insights) {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    
    for (const insight of insights) {
      counts[insight.severity] = (counts[insight.severity] || 0) + 1;
    }

    return {
      totalInsights: insights.length,
      criticalIssues: counts.critical,
      highPriority: counts.high,
      mediumPriority: counts.medium,
      lowPriority: counts.low
    };
  }

  /**
   * Detect patterns in cluster behavior
   */
  async detectPatterns(metricsHistory) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const patterns = [];
    const now = Date.now();

    // Look for recurring issues
    if (metricsHistory.length > 5) {
      // Check for consistent high memory usage
      const highMemoryEvents = metricsHistory.filter(m => m.calculated?.memoryUsage > 0.8);
      if (highMemoryEvents.length / metricsHistory.length > 0.7) {
        patterns.push({
          name: 'chronic_high_memory_usage',
          description: 'Consistent high memory usage (>80%) across 70%+ of observations',
          frequency: `${highMemoryEvents.length}/${metricsHistory.length}`,
          recommendedAction: 'Consider infrastructure upgrade or query optimization strategy',
          detectedAt: now
        });
      }

      // Check for recurring fragmentation
      const fragmentationEvents = metricsHistory.filter(m => m.calculated?.indexFragmentation > 3);
      if (fragmentationEvents.length / metricsHistory.length > 0.5) {
        patterns.push({
          name: 'chronic_fragmentation',
          description: 'Consistent index fragmentation (>3 segments/doc) across 50%+ of observations',
          frequency: `${fragmentationEvents.length}/${metricsHistory.length}`,
          recommendedAction: 'Implement regular index merging strategy',
          detectedAt: now
        });
      }

      // Check for performance degradation trend
      if (metricsHistory.length > 10) {
        const recentMetrics = metricsHistory.slice(-5);
        const olderMetrics = metricsHistory.slice(-10, -5);

        const recentAvgLatency = recentMetrics.reduce((sum, m) => sum + (m.calculated?.queryLatency || 0), 0) / recentMetrics.length;
        const olderAvgLatency = olderMetrics.reduce((sum, m) => sum + (m.calculated?.queryLatency || 0), 0) / olderMetrics.length;

        if (recentAvgLatency > olderAvgLatency * 1.2) { // 20% increase
          patterns.push({
            name: 'performance_degradation_trend',
            description: 'Query latency trending upward (20%+ increase in last 5 observations)',
            frequency: 'ongoing',
            recommendedAction: 'Investigate recent changes and optimize queries',
            detectedAt: now
          });
        }
      }
    }

    // Store new patterns
    for (const pattern of patterns) {
      this.patterns.push(pattern);
    }

    // Persist to memory
    await this.persistentMemory.set('learnedPatterns', this.patterns);

    return patterns;
  }

  /**
   * Generate research report for the coding agent
   */
  async generateResearchReport(metrics, metricsHistory = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Analyze current metrics
    const analysis = await this.analyzeClusterMetrics(metrics);

    // Detect patterns in history
    const patterns = await this.detectPatterns(metricsHistory);

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis.insights, patterns);

    // Create research report
    const report = {
      agentId: this.agentId,
      timestamp: Date.now(),
      clusterName: metrics.clusterName,
      analysis,
      patterns,
      recommendations,
      confidence: this.calculateConfidence(analysis, patterns)
    };

    // Store in knowledge base
    this.knowledgeBase.set(report.timestamp, report);

    return report;
  }

  /**
   * Generate recommendations based on analysis and patterns
   */
  generateRecommendations(insights, patterns) {
    const recommendations = [];

    // High priority recommendations
    const highPriorityInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
    for (const insight of highPriorityInsights) {
      recommendations.push({
        priority: insight.severity.toUpperCase(),
        category: insight.category,
        description: insight.description,
        action: insight.recommendation,
        estimatedImpact: this.estimateImpact(insight)
      });
    }

    // Pattern-based recommendations
    for (const pattern of patterns) {
      recommendations.push({
        priority: 'PATTERN',
        category: 'behavior',
        description: pattern.description,
        action: pattern.recommendedAction,
        estimatedImpact: 0.7 // High impact for systemic issues
      });
    }

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, PATTERN: 2, MEDIUM: 1, LOW: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return recommendations;
  }

  /**
   * Estimate impact of a recommendation
   */
  estimateImpact(insight) {
    switch (insight.severity) {
      case 'critical':
        return 0.9;
      case 'high':
        return 0.7;
      case 'medium':
        return 0.5;
      case 'low':
        return 0.3;
      default:
        return 0.5;
    }
  }

  /**
   * Calculate confidence in the research report
   */
  calculateConfidence(analysis, patterns) {
    // Base confidence on amount of data analyzed
    let confidence = 0.6; // Base confidence

    // Increase for each high-severity insight
    const highSeverityCount = analysis.insights.filter(i => i.severity === 'high' || i.severity === 'critical').length;
    confidence += highSeverityCount * 0.1;

    // Increase for each identified pattern
    confidence += patterns.length * 0.15;

    // Cap at 0.95
    return Math.min(0.95, confidence);
  }

  /**
   * Get research summary
   */
  async getResearchSummary() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return {
      agentId: this.agentId,
      insightsCount: this.insights.length,
      patternsCount: this.patterns.length,
      knowledgeBaseSize: this.knowledgeBase.size,
      lastAnalysis: this.insights.length > 0 ? this.insights[this.insights.length - 1].timestamp : null,
      isInitialized: this.isInitialized
    };
  }
}

export default ResearchAgent;