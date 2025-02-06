import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  recordEvent, 
  getEvents, 
  clearEvents, 
  calculateMetrics, 
  exportAnalytics,
  AnalyticsEventType 
} from '../analytics';

let fakeStorage: Record<string, any> = {};

beforeEach(() => {
  // Reset fake storage
  fakeStorage = {};

  // Mock chrome.storage.local
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: (keys: string[], callback: (result: any) => void) => {
          const result: any = {};
          keys.forEach(key => {
            result[key] = fakeStorage[key] || [];
          });
          callback(result);
        },
        set: (obj: any, callback: () => void) => {
          fakeStorage = { ...fakeStorage, ...obj };
          callback();
        }
      }
    },
    runtime: {
      lastError: undefined
    }
  });
});

describe('Analytics Module', () => {
  it('should record an event and retrieve it', async () => {
    const testEvent = {
      event: 'testEvent',
      timestamp: Date.now(),
      metadata: { foo: 'bar' }
    };

    await recordEvent(testEvent.event, { ...testEvent.metadata, timestamp: testEvent.timestamp });
    const events = await getEvents();
    
    expect(events.length).toBe(1);
    expect(events[0].event).toBe(testEvent.event);
    expect(events[0].metadata).toEqual(testEvent.metadata);
    expect(events[0].timestamp).toBe(testEvent.timestamp);
  });

  it('should clear events', async () => {
    // Record an event first
    await recordEvent('testEvent', { foo: 'bar' });
    
    // Verify event was recorded
    let events = await getEvents();
    expect(events.length).toBe(1);
    
    // Clear events
    await clearEvents();
    
    // Verify events were cleared
    events = await getEvents();
    expect(events.length).toBe(0);
  });

  it('should handle storage errors gracefully', async () => {
    // Mock chrome.runtime.lastError
    vi.stubGlobal('chrome', {
      ...chrome,
      runtime: {
        lastError: new Error('Storage error')
      }
    });

    await expect(recordEvent('testEvent', {}))
      .rejects
      .toThrow('Storage error');
  });

  describe('Metrics Calculation', () => {
    beforeEach(async () => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      
      // Create test data with explicit timestamps
      await recordEvent(AnalyticsEventType.PROMPT_CREATED, { 
        promptId: 'prompt1', 
        timestamp: now - (2 * day) 
      });
      await recordEvent(AnalyticsEventType.PROMPT_CREATED, { 
        promptId: 'prompt2', 
        timestamp: now - (2 * day) 
      });
      await recordEvent(AnalyticsEventType.PROMPT_USED, { 
        promptId: 'prompt1', 
        timestamp: now - day 
      });
      await recordEvent(AnalyticsEventType.PROMPT_USED, { 
        promptId: 'prompt1', 
        timestamp: now - day 
      });
      await recordEvent(AnalyticsEventType.PROMPT_MODIFIED, { 
        promptId: 'prompt1', 
        timestamp: now - day 
      });
      await recordEvent(AnalyticsEventType.PROMPT_SYNCED, { 
        promptId: 'prompt1', 
        timestamp: now 
      });
      await recordEvent(AnalyticsEventType.PROMPT_ERROR, { 
        promptId: 'prompt2', 
        timestamp: now 
      });
    });

    it('should calculate metrics correctly', async () => {
      const metrics = await calculateMetrics();
      
      expect(metrics.totalPrompts).toBe(2);
      expect(metrics.promptUsage['prompt1']).toBe(2);
      expect(metrics.mostUsedPrompts[0]).toEqual({ promptId: 'prompt1', count: 2 });
      expect(metrics.modificationFrequency['prompt1']).toBe(1);
      expect(metrics.syncFrequency).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(1/7); // 1 error out of 7 total events
    });

    it('should calculate metrics for a specific time range', async () => {
      const now = Date.now();
      const dayAgo = now - (24 * 60 * 60 * 1000);
      
      const metrics = await calculateMetrics({ start: dayAgo, end: now });
      
      expect(metrics.totalPrompts).toBe(0); // No prompts created in this time range
      expect(metrics.syncFrequency).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(1/2); // 1 error out of 2 events in time range
    });
  });

  describe('Data Export', () => {
    beforeEach(async () => {
      const now = Date.now();
      await recordEvent(AnalyticsEventType.PROMPT_CREATED, { 
        promptId: 'test1',
        timestamp: now 
      });
      await recordEvent(AnalyticsEventType.PROMPT_USED, { 
        promptId: 'test1',
        timestamp: now + 1000 
      });
    });

    it('should export data as JSON', async () => {
      const json = await exportAnalytics('json');
      const parsed = JSON.parse(json);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].event).toBe(AnalyticsEventType.PROMPT_CREATED);
      expect(parsed[1].event).toBe(AnalyticsEventType.PROMPT_USED);
    });

    it('should export data as CSV', async () => {
      const csv = await exportAnalytics('csv');
      const lines = csv.split('\n');
      
      expect(lines.length).toBe(3); // header + 2 data rows
      expect(lines[0]).toBe('event,timestamp,metadata');
      expect(lines[1]).toContain(AnalyticsEventType.PROMPT_CREATED);
      expect(lines[2]).toContain(AnalyticsEventType.PROMPT_USED);
    });
  });
});