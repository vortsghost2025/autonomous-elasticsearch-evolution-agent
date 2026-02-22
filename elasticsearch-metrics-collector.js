/**
 * ElasticsearchMetricsCollector
 * Gathers cluster health, index performance, and shard distribution metrics
 * from an Elasticsearch cluster
 */

import { PersistentMemory } from './persistent-memory.js';

// Import dashboard functions if available
let dashboardAvailable = false;
let broadcastMetrics = () => {};

import * as dashboard from './dashboard-server.js';
if (dashboard.broadcastMetrics) {
  broadcastMetrics = dashboard.broadcastMetrics;
  dashboardAvailable = true;
  console.log('[MetricsCollector] Connected to real-time dashboard server');
} else {
  console.log('[MetricsCollector] Dashboard server not available, continuing without real-time updates');
}

export class ElasticsearchMetricsCollector {
  constructor(esClient, options = {}) {
    this.esClient = esClient;
    this.clusterName = options.clusterName || 'default-cluster';
    this.collectionInterval = options.collectionInterval || 60000; // 1 minute
    this.metricsHistory = [];
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load metrics history from persistent memory
      const savedMetrics = await this.persistentMemory.get('metricsHistory', []);
      if (Array.isArray(savedMetrics) && savedMetrics.length > 0) {
        this.metricsHistory = savedMetrics;
        console.log(`[ElasticsearchMetricsCollector] Restored ${this.metricsHistory.length} historical metrics`);
      }
      
      this.isInitialized = true;
      console.log('[ElasticsearchMetricsCollector] Initialized with persistent memory');
    } catch (error) {
      console.error('[ElasticsearchMetricsCollector] Error during initialization:', error);
      // Continue anyway, we don't want to crash if memory restore fails
      this.isInitialized = true;
    }
  }

  /**
   * Collect comprehensive cluster metrics
   */
  async collectMetrics() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [clusterHealth, nodeStats, indexStats] = await Promise.all([
        this.getClusterHealth(),
        this.getNodeStats(),
        this.getIndexStats()
      ]);

      const timestamp = Date.now();
      const metrics = {
        timestamp,
        clusterName: this.clusterName,
        health: clusterHealth,
        nodes: nodeStats,
        indexes: indexStats,
        calculated: this.calculateDerivedMetrics(clusterHealth, nodeStats, indexStats)
      };

      this.metricsHistory.push(metrics);
      // Keep last 1000 measurements
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory.shift();
      }

      // Persist metrics to memory
      await this.persistentMemory.set('metricsHistory', this.metricsHistory);
      
      // Broadcast metrics to dashboard if available
      if (dashboardAvailable) {
        broadcastMetrics({
          healthStatus: clusterHealth.status,
          memoryUsage: metrics.calculated.memoryUsage,
          fragmentation: metrics.calculated.indexFragmentation,
          queryLatency: metrics.calculated.queryLatency,
          shardHealth: metrics.calculated.shardHealth,
          clusterName: this.clusterName,
          timestamp: Date.now()
        });
      }

      return metrics;
    } catch (error) {
      // Log the error to persistent memory
      await this.persistentMemory.logError(error);
      console.error('[ElasticsearchMetricsCollector] Error collecting metrics:', error);
      throw error;
    }
  }

  /**
   * Get cluster health status
   */
  async getClusterHealth() {
    const response = await this.esClient.cluster.health();
    
    return {
      status: response.status,  // green, yellow, red
      activeShards: response.active_shards,
      activeShardsPrimary: response.active_primary_shards,
      relocatingShards: response.relocating_shards,
      initializingShards: response.initializing_shards,
      unassignedShards: response.unassigned_shards,
      delayedUnassignedShards: response.delayed_unassigned_shards,
      numberOfNodes: response.number_of_nodes,
      numberOfDataNodes: response.number_of_data_nodes,
      activeShardsPercentAsNumber: response.active_shards_percent_as_number
    };
  }

  /**
   * Get node statistics (memory, CPU, disk)
   */
  async getNodeStats() {
    const response = await this.esClient.nodes.stats();
    
    const nodeStats = {};
    for (const [nodeId, nodeData] of Object.entries(response.nodes)) {
      nodeStats[nodeId] = {
        name: nodeData.name,
        jvmMemory: {
          heapUsedPercent: nodeData.jvm.mem.heap_used_percent,
          heapMaxInBytes: nodeData.jvm.mem.heap_max_in_bytes,
          heapUsedInBytes: nodeData.jvm.mem.heap_used_in_bytes
        },
        fsTotal: {
          total: nodeData.fs.total.total_in_bytes,
          available: nodeData.fs.total.available_in_bytes,
          free: nodeData.fs.total.free_in_bytes
        },
        indices: {
          docsCount: nodeData.indices.docs.count,
          storeSize: nodeData.indices.store.size_in_bytes,
          cacheSize: nodeData.indices.query_cache.memory_size_in_bytes
        }
      };
    }

    return nodeStats;
  }

  /**
   * Get index-level statistics
   */
  async getIndexStats() {
    const response = await this.esClient.indices.stats();
    
    const indexStats = {};
    for (const [indexName, indexData] of Object.entries(response.indices)) {
      const primaries = indexData.primaries;
      const total = indexData.total;

      indexStats[indexName] = {
        docs: {
          count: primaries.docs.count,
          deleted: primaries.docs.deleted
        },
        store: {
          size: primaries.store.size_in_bytes,
          totalSize: total.store.size_in_bytes
        },
        indexing: {
          indexTotal: primaries.indexing.index_total,
          indexTimeInMillis: primaries.indexing.index_time_in_millis,
          deleteTotal: primaries.indexing.delete_total
        },
        search: {
          queryTotal: primaries.search.query_total,
          queryTimeInMillis: primaries.search.query_time_in_millis,
          fetchTotal: primaries.search.fetch_total
        },
        segments: {
          count: primaries.segments.count,
          memoryInBytes: primaries.segments.memory_in_bytes
        }
      };
    }

    return indexStats;
  }

  /**
   * Calculate derived metrics for autonomous decision-making
   */
  calculateDerivedMetrics(health, nodeStats, indexStats) {
    // Index fragmentation: segments count / document count
    let avgFragmentation = 0;
    let totalIndexes = Object.keys(indexStats).length;
    
    for (const [indexName, stats] of Object.entries(indexStats)) {
      const docCount = Math.max(1, stats.docs.count);
      const segmentCount = stats.segments.count;
      avgFragmentation += segmentCount / docCount;
    }
    avgFragmentation = totalIndexes > 0 ? avgFragmentation / totalIndexes : 0;

    // Memory efficiency: used memory / available memory
    let avgMemoryUsage = 0;
    let nodeCount = Object.keys(nodeStats).length;

    for (const [nodeId, stats] of Object.entries(nodeStats)) {
      avgMemoryUsage += (stats.jvmMemory.heapUsedPercent / 100);
    }
    avgMemoryUsage = nodeCount > 0 ? avgMemoryUsage / nodeCount : 0;

    // Query latency efficiency (lower is better)
    let avgQueryLatency = 0;
    let totalQueries = 0;

    for (const [indexName, stats] of Object.entries(indexStats)) {
      if (stats.search.queryTotal > 0) {
        const latency = stats.search.queryTimeInMillis / stats.search.queryTotal;
        avgQueryLatency += latency;
        totalQueries++;
      }
    }
    avgQueryLatency = totalQueries > 0 ? avgQueryLatency / totalQueries : 0;

    // Shard balance: variance of shard distribution
    const shardCounts = {};
    if (health.activeShards > 0) {
      for (const [indexName, stats] of Object.entries(indexStats)) {
        // Approximate shard distribution
        shardCounts[indexName] = Math.ceil(stats.store.totalSize / (100 * 1024 * 1024)); // Assume 100MB per shard
      }
    }

    return {
      indexFragmentation: avgFragmentation,  // Lower is better
      memoryUsage: avgMemoryUsage,           // Lower is better
      queryLatency: avgQueryLatency,         // Lower is better
      shardHealth: health.activeShardsPercentAsNumber / 100,  // Higher is better
      clusterHealth: health.status === 'green' ? 1 : health.status === 'yellow' ? 0.5 : 0
    };
  }

  /**
   * Get recent metrics history
   */
  async getRecentMetrics(minutes = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metricsHistory.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Calculate metric trends (improving, stable, degrading)
   */
  async calculateTrends() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.metricsHistory.length < 2) {
      return { trend: 'UNKNOWN', changes: [] };
    }

    const recent = this.metricsHistory.slice(-10); // Last 10 measurements
    const earliest = recent[0];
    const latest = recent[recent.length - 1];

    const changes = {
      fragmentation: latest.calculated.indexFragmentation - earliest.calculated.indexFragmentation,
      memoryUsage: latest.calculated.memoryUsage - earliest.calculated.memoryUsage,
      queryLatency: latest.calculated.queryLatency - earliest.calculated.queryLatency,
      shardHealth: latest.calculated.shardHealth - earliest.calculated.shardHealth
    };

    // Determine overall trend
    const improving = Object.values(changes).filter(v => v < -0.05).length;
    const degrading = Object.values(changes).filter(v => v > 0.05).length;

    let trend = 'STABLE';
    if (degrading > improving) {
      trend = 'DEGRADING';
    } else if (improving > degrading) {
      trend = 'IMPROVING';
    }

    return { trend, changes };
  }
}

export default ElasticsearchMetricsCollector;