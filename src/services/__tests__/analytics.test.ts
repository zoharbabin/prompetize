import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recordEvent, getEvents, clearEvents } from '../analytics';

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

    await recordEvent(testEvent.event, testEvent.metadata);
    const events = await getEvents();
    
    expect(events.length).toBe(1);
    expect(events[0].event).toBe(testEvent.event);
    expect(events[0].metadata).toEqual(testEvent.metadata);
    expect(events[0].timestamp).toBeDefined();
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
});