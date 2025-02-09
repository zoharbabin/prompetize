class AnalyticsPlugin {
  constructor() {
    this.version = '1.0.0';
    this.usageData = new Map();
    this.detailedMetrics = new Map();
  }

  async init() {
    // Load saved analytics data from storage
    const data = await chrome.storage.local.get(['analyticsData', 'detailedMetrics']);
    if (data.analyticsData) {
      this.usageData = new Map(JSON.parse(data.analyticsData));
    }
    if (data.detailedMetrics) {
      this.detailedMetrics = new Map(JSON.parse(data.detailedMetrics));
    }
  }

  // Track when a prompt is used with detailed metrics
  trackPromptUsage(promptId, success = true, metadata = {}) {
    // Update basic usage count
    const currentCount = this.usageData.get(promptId) || 0;
    this.usageData.set(promptId, currentCount + 1);

    // Record detailed metrics
    const metrics = this.detailedMetrics.get(promptId) || {
      totalUses: 0,
      successCount: 0,
      failureCount: 0,
      usageHistory: [],
      lastUsed: null
    };

    metrics.totalUses++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    // Add usage record with timestamp and metadata
    metrics.usageHistory.push({
      timestamp: new Date().toISOString(),
      success,
      ...metadata
    });

    // Keep only last 100 records to manage storage
    if (metrics.usageHistory.length > 100) {
      metrics.usageHistory = metrics.usageHistory.slice(-100);
    }

    metrics.lastUsed = new Date().toISOString();
    this.detailedMetrics.set(promptId, metrics);

    this.saveData();
  }

  // Get detailed statistics for a prompt
  getPromptStats(promptId) {
    const basicCount = this.usageData.get(promptId) || 0;
    const detailedStats = this.detailedMetrics.get(promptId);
    
    if (!detailedStats) {
      return {
        totalUses: basicCount,
        successRate: 0,
        lastUsed: null,
        usageHistory: []
      };
    }

    return {
      totalUses: detailedStats.totalUses,
      successRate: detailedStats.totalUses ? 
        (detailedStats.successCount / detailedStats.totalUses) * 100 : 0,
      lastUsed: detailedStats.lastUsed,
      usageHistory: detailedStats.usageHistory
    };
  }

  // Get all usage statistics
  getAllStats() {
    const stats = {};
    this.usageData.forEach((count, promptId) => {
      stats[promptId] = this.getPromptStats(promptId);
    });
    return stats;
  }

  // Get usage statistics for a date range
  getStatsInRange(startDate, endDate) {
    const stats = {};
    this.detailedMetrics.forEach((metrics, promptId) => {
      const filteredHistory = metrics.usageHistory.filter(record => {
        const timestamp = new Date(record.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      });

      if (filteredHistory.length > 0) {
        const successCount = filteredHistory.filter(record => record.success).length;
        stats[promptId] = {
          totalUses: filteredHistory.length,
          successRate: (successCount / filteredHistory.length) * 100,
          usageHistory: filteredHistory
        };
      }
    });
    return stats;
  }

  // Export analytics data
  exportData() {
    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      stats: this.getAllStats()
    };
  }

  // Save data to chrome storage
  async saveData() {
    await chrome.storage.local.set({
      analyticsData: JSON.stringify(Array.from(this.usageData.entries())),
      detailedMetrics: JSON.stringify(Array.from(this.detailedMetrics.entries()))
    });
  }
}

const analyticsPlugin = new AnalyticsPlugin();
export default analyticsPlugin;
