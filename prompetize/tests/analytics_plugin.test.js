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
    // Clear the Map and reset mock implementations
    analyticsPlugin.usageData.clear();
    chrome.storage.local.get.mockReset();
    chrome.storage.local.set.mockReset();
  });

  test('initializes with empty data when no stored data exists', async () => {
    chrome.storage.local.get.mockResolvedValue({});
    await analyticsPlugin.init();
    expect(analyticsPlugin.usageData.size).toBe(0);
  });

  test('initializes with stored data', async () => {
    const storedData = [[1, 5], [2, 3]]; // Prompt IDs and their usage counts
    chrome.storage.local.get.mockResolvedValue({
      analyticsData: JSON.stringify(storedData)
    });
    
    await analyticsPlugin.init();
    expect(analyticsPlugin.usageData.get(1)).toBe(5);
    expect(analyticsPlugin.usageData.get(2)).toBe(3);
  });

  test('tracks prompt usage correctly', () => {
    analyticsPlugin.trackPromptUsage(1);
    expect(analyticsPlugin.getPromptStats(1)).toBe(1);

    analyticsPlugin.trackPromptUsage(1);
    expect(analyticsPlugin.getPromptStats(1)).toBe(2);
  });

  test('returns zero for unused prompts', () => {
    expect(analyticsPlugin.getPromptStats(999)).toBe(0);
  });

  test('gets all stats correctly', () => {
    analyticsPlugin.trackPromptUsage(1);
    analyticsPlugin.trackPromptUsage(2);
    analyticsPlugin.trackPromptUsage(1);

    const stats = analyticsPlugin.getAllStats();
    expect(stats[1]).toBe(2);
    expect(stats[2]).toBe(1);
  });

  test('saves data when tracking prompt usage', () => {
    analyticsPlugin.trackPromptUsage(1);
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });
});
