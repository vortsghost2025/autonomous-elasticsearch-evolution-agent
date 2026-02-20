/**
 * Temporal Insight Engine
 * Implements self-forecasting and feedback loops for autonomous optimization
 */

import { PersistentMemory } from './persistent-memory.js';
import { MLPredictor } from './ml-predictor.js';

export class TemporalInsightEngine {
  constructor(options = {}) {
    this.persistentMemory = options.persistentMemory || new PersistentMemory(options.memoryOptions);
    this.mlPredictor = options.mlPredictor || new MLPredictor();
    this.forecastHistory = [];
    this.feedbackLoop = [];
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load forecast history from persistent memory
      const savedForecasts = await this.persistentMemory.get('forecastHistory', []);
      if (Array.isArray(savedForecasts) && savedForecasts.length > 0) {
        this.forecastHistory = savedForecasts;
        console.log(`[TemporalInsightEngine] Restored ${this.forecastHistory.length} historical forecasts`);
      }
      
      // Load feedback loop data
      const savedFeedback = await this.persistentMemory.get('feedbackLoop', []);
      if (Array.isArray(savedFeedback) && savedFeedback.length > 0) {
        this.feedbackLoop = savedFeedback;
        console.log(`[TemporalInsightEngine] Restored ${this.feedbackLoop.length} feedback entries`);
      }
      
      this.isInitialized = true;
      console.log('[TemporalInsightEngine] Initialized with persistent memory');
    } catch (error) {
      console.error('[TemporalInsightEngine] Error during initialization:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Generate a temporal forecast based on current metrics and historical patterns
   */
  async generateForecast(currentMetrics, timeHorizon = '24h') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Use ML predictor to forecast outcomes
    const prediction = await this.mlPredictor.predictOutcome(
      { 
        title: 'Autonomous Optimization Cycle',
        riskLevel: 'LOW',
        confidence: 0.85
      }, 
      currentMetrics
    );

    // Create forecast object
    const forecast = {
      id: `forecast-${Date.now()}`,
      timestamp: Date.now(),
      timeHorizon,
      predictedImprovement: prediction.predictedImprovement,
      confidence: prediction.confidence,
      riskAdjustedImprovement: prediction.riskAdjustedImprovement,
      estimatedTimeToAchieve: prediction.estimatedTimeToAchieve,
      probabilityOfSuccess: prediction.probabilityOfSuccess,
      recommendations: this.generateRecommendations(prediction, currentMetrics),
      sourceMetrics: currentMetrics
    };

    // Store in history
    this.forecastHistory.push(forecast);
    if (this.forecastHistory.length > 1000) {
      this.forecastHistory.shift();
    }

    // Persist to memory
    await this.persistentMemory.set('forecastHistory', this.forecastHistory);

    return forecast;
  }

  /**
   * Generate recommendations based on forecast results
   */
  generateRecommendations(prediction, metrics) {
    const recommendations = [];
    
    if (prediction.predictedImprovement > 0.3) {
      recommendations.push({
        type: 'high_impact',
        description: 'High potential improvement detected. Consider implementing immediately.',
        action: 'Apply optimization proposal'
      });
    }
    
    if (prediction.riskAdjustedImprovement < 0.2) {
      recommendations.push({
        type: 'low_risk',
        description: 'Low risk-adjusted improvement. Consider testing in staging first.',
        action: 'Run simulation in test environment'
      });
    }
    
    if (metrics.memoryUsage > 0.8 && prediction.predictedImprovement > 0.4) {
      recommendations.push({
        type: 'critical',
        description: 'High memory usage with significant improvement potential. Immediate attention recommended.',
        action: 'Prioritize memory optimization'
      });
    }
    
    return recommendations;
  }

  /**
   * Process feedback from optimization results to improve future predictions
   */
  async processFeedback(optimizationResult, actualResults) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Calculate prediction accuracy
    const predictionAccuracy = this.calculatePredictionAccuracy(optimizationResult, actualResults);
    
    // Add feedback entry
    const feedbackEntry = {
      id: `feedback-${Date.now()}`,
      timestamp: Date.now(),
      optimizationId: optimizationResult.id,
      predictionAccuracy,
      actualResults,
      expectedResults: optimizationResult.expectedResults,
      lessonsLearned: this.extractLessons(optimizationResult, actualResults)
    };

    this.feedbackLoop.push(feedbackEntry);
    if (this.feedbackLoop.length > 500) {
      this.feedbackLoop.shift();
    }

    // Update ML predictor with new data
    await this.mlPredictor.train([
      {
        ...optimizationResult,
        actualResults,
        predictionAccuracy
      }
    ]);

    // Persist feedback
    await this.persistentMemory.set('feedbackLoop', this.feedbackLoop);

    return feedbackEntry;
  }

  /**
   * Calculate prediction accuracy
   */
  calculatePredictionAccuracy(optimizationResult, actualResults) {
    const predictedImprovement = optimizationResult.predictedImprovement || 0;
    const actualImprovement = actualResults.improvement || 0;
    
    // Normalize to percentage difference
    const accuracy = Math.abs((predictedImprovement - actualImprovement) / (predictedImprovement + 0.001));
    
    return 1 - accuracy; // Higher is better
  }

  /**
   * Extract lessons learned from optimization results
   */
  extractLessons(optimizationResult, actualResults) {
    const lessons = [];
    
    if (actualResults.improvement > optimizationResult.predictedImprovement * 1.2) {
      lessons.push('Optimization performed better than predicted. Consider adjusting confidence thresholds.');
    }
    
    if (actualResults.improvement < optimizationResult.predictedImprovement * 0.8) {
      lessons.push('Optimization underperformed. Investigate external factors or model limitations.');
    }
    
    if (actualResults.sideEffects && actualResults.sideEffects.length > 0) {
      lessons.push(`Unexpected side effects observed: ${actualResults.sideEffects.join(', ')}. Add these to risk assessment.`);
    }
    
    return lessons;
  }

  /**
   * Get recent forecasts
   */
  getRecentForecasts(limit = 10) {
    return this.forecastHistory.slice(-limit);
  }

  /**
   * Get feedback summary
   */
  getFeedbackSummary() {
    if (this.feedbackLoop.length === 0) {
      return { averageAccuracy: 0, totalEntries: 0 };
    }
    
    const totalAccuracy = this.feedbackLoop.reduce((sum, entry) => sum + entry.predictionAccuracy, 0);
    const averageAccuracy = totalAccuracy / this.feedbackLoop.length;
    
    return {
      averageAccuracy,
      totalEntries: this.feedbackLoop.length,
      recentTrends: this.analyzeTrends()
    };
  }

  /**
   * Analyze trends in feedback data
   */
  analyzeTrends() {
    if (this.feedbackLoop.length < 5) {
      return { trend: 'insufficient_data' };
    }
    
    const recentAccuracy = this.feedbackLoop.slice(-5).map(entry => entry.predictionAccuracy);
    const avgRecent = recentAccuracy.reduce((sum, acc) => sum + acc, 0) / recentAccuracy.length;
    const avgHistorical = this.feedbackLoop.slice(0, -5).map(entry => entry.predictionAccuracy)
      .reduce((sum, acc) => sum + acc, 0) / this.feedbackLoop.slice(0, -5).length;
    
    if (avgRecent > avgHistorical) {
      return { trend: 'improving' };
    } else if (avgRecent < avgHistorical) {
      return { trend: 'deteriorating' };
    } else {
      return { trend: 'stable' };
    }
  }
}