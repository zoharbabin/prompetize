import analyticsPlugin from '../plugins/analytics_plugin.js';
import { jest } from '@jest/globals';

// Mock chrome.storage.local
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

describe('AnalyticsPlugin', () => {
  beforeEach(() => {
    // Clear data and reset mock implementations
    analyticsPlugin.usageData.clear();
    analyticsPlugin.detailedMetrics.clear();
    chrome.storage.local.get.mockReset();
    chrome.storage.local.set.mockReset();
    
    // Mock Date.now for consistent timestamps
    jest.useFakeTimers();
    const mockDate = new Date('2025-02-09T00:00:00Z');
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('initializes with empty data when no stored data exists', async () => {
      chrome.storage.local.get.mockResolvedValue({});
      await analyticsPlugin.init();
      expect(analyticsPlugin.usageData.size).toBe(0);
      expect(analyticsPlugin.detailedMetrics.size).toBe(0);
    });

    test('initializes with stored data', async () => {
      const storedData = [[1, 5], [2, 3]];
      const storedMetrics = [[1, {
        totalUses: 5,
        successCount: 4,
        failureCount: 1,
        usageHistory: [],
        lastUsed: '2025-02-08T00:00:00Z'
      }]];

      chrome.storage.local.get.mockResolvedValue({
        analyticsData: JSON.stringify(storedData),
        detailedMetrics: JSON.stringify(storedMetrics)
      });
      
      await analyticsPlugin.init();
      expect(analyticsPlugin.usageData.get(1)).toBe(5);
      expect(analyticsPlugin.detailedMetrics.get(1).successCount).toBe(4);
    });
  });

  describe('Usage Tracking', () => {
    test('tracks basic prompt usage correctly', () => {
      analyticsPlugin.trackPromptUsage(1);
      const stats = analyticsPlugin.getPromptStats(1);
      expect(stats.totalUses).toBe(1);
      expect(stats.successRate).toBe(100);
    });

    test('tracks success and failure correctly', () => {
      analyticsPlugin.trackPromptUsage(1, true);
      analyticsPlugin.trackPromptUsage(1, false);
      analyticsPlugin.trackPromptUsage(1, true);
      
      const stats = analyticsPlugin.getPromptStats(1);
      expect(stats.totalUses).toBe(3);
      expect(stats.successRate).toBeCloseTo(66.67, 2);
    });

    test('tracks metadata correctly', () => {
      const metadata = { duration: 500, context: 'test' };
      analyticsPlugin.trackPromptUsage(1, true, metadata);
      
      const stats = analyticsPlugin.getPromptStats(1);
      const lastUsage = stats.usageHistory[0];
      expect(lastUsage.duration).toBe(500);
      expect(lastUsage.context).toBe('test');
    });

    test('limits usage history to 100 records', () => {
      for (let i = 0; i < 150; i++) {
        analyticsPlugin.trackPromptUsage(1, true, { index: i });
      }
      
      const stats = analyticsPlugin.getPromptStats(1);
      expect(stats.usageHistory.length).toBe(100);
      expect(stats.usageHistory[99].index).toBe(149);
    });
  });

  describe('Statistics Retrieval', () => {
    test('returns default stats for unused prompts', () => {
      const stats = analyticsPlugin.getPromptStats(999);
      expect(stats).toEqual({
        totalUses: 0,
        successRate: 0,
        lastUsed: null,
        usageHistory: []
      });
    });

    test('gets all stats correctly', () => {
      analyticsPlugin.trackPromptUsage(1, true);
      analyticsPlugin.trackPromptUsage(2, false);
      
      const stats = analyticsPlugin.getAllStats();
      expect(stats[1].successRate).toBe(100);
      expect(stats[2].successRate).toBe(0);
    });

    test('gets stats in date range', () => {
      // Create usage data across different dates
      jest.setSystemTime(new Date('2025-02-08T00:00:00Z'));
      analyticsPlugin.trackPromptUsage(1, true);
      
      jest.setSystemTime(new Date('2025-02-09T00:00:00Z'));
      analyticsPlugin.trackPromptUsage(1, true);
      
      const startDate = new Date('2025-02-09T00:00:00Z');
      const endDate = new Date('2025-02-10T00:00:00Z');
      const stats = analyticsPlugin.getStatsInRange(startDate, endDate);
      
      expect(stats[1].totalUses).toBe(1);
    });
  });

  describe('Data Export', () => {
    test('exports data in correct format', () => {
      analyticsPlugin.trackPromptUsage(1, true);
      const exported = analyticsPlugin.exportData();
      
      expect(exported).toHaveProperty('version');
      expect(exported).toHaveProperty('exportDate');
      expect(exported).toHaveProperty('stats');
      expect(exported.stats[1].totalUses).toBe(1);
    });
  });

  describe('Storage', () => {
    test('saves both usage data and detailed metrics', () => {
      analyticsPlugin.trackPromptUsage(1, true);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          analyticsData: expect.any(String),
          detailedMetrics: expect.any(String)
        })
      );
    });
  });
});
