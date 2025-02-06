/**
 * Analytics Module Integration
 *
 * Captures and stores user events such as prompt creation and usage frequency.
 * The events are stored using Chrome's Storage API.
 */

export enum AnalyticsEventType {
  PROMPT_CREATED = 'prompt_created',
  PROMPT_MODIFIED = 'prompt_modified',
  PROMPT_USED = 'prompt_used',
  PROMPT_DELETED = 'prompt_deleted',
  PROMPT_SYNCED = 'prompt_synced',
  PROMPT_ERROR = 'prompt_error'
}

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface PromptMetrics {
  totalPrompts: number;
  promptUsage: Record<string, number>;
  averageUsagePerDay: number;
  mostUsedPrompts: Array<{ promptId: string; count: number }>;
  modificationFrequency: Record<string, number>;
  syncFrequency: number;
  errorRate: number;
}

const ANALYTICS_KEY = 'analyticsEvents';
const MS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000

function getStorage() {
  return (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local)
    ? chrome.storage.local
    : {
        get: (keys: string[], callback: (result: any) => void) => { callback({}); },
        set: (obj: any, callback: () => void) => { callback(); }
      };
}

export async function recordEvent(event: string, metadata: Record<string, any> = {}): Promise<void> {
  const events = await getEvents();
  const newEvent: AnalyticsEvent = {
    event,
    timestamp: metadata.timestamp || Date.now(), // Use provided timestamp or current time
    metadata: { ...metadata, timestamp: undefined } // Remove timestamp from metadata to avoid duplication
  };
  events.push(newEvent);
  
  return new Promise((resolve, reject) => {
    getStorage().set({ [ANALYTICS_KEY]: events }, () => {
      if (chrome && chrome.runtime && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getEvents(): Promise<AnalyticsEvent[]> {
  return new Promise((resolve, reject) => {
    getStorage().get([ANALYTICS_KEY], (result: any) => {
      if (chrome && chrome.runtime && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const events = result[ANALYTICS_KEY];
        if (events && Array.isArray(events)) {
          resolve(events);
        } else {
          resolve([]);
        }
      }
    });
  });
}

export async function clearEvents(): Promise<void> {
  return new Promise((resolve, reject) => {
    getStorage().set({ [ANALYTICS_KEY]: [] }, () => {
      if (chrome && chrome.runtime && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function calculateMetrics(timeRange?: { start: number; end: number }): Promise<PromptMetrics> {
  const events = await getEvents();
  const filteredEvents = timeRange 
    ? events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
    : events;

  const promptUsage: Record<string, number> = {};
  const modificationFrequency: Record<string, number> = {};
  let syncCount = 0;
  let errorCount = 0;

  // Calculate total prompts only from creation events within the time range
  const createdPromptIds = new Set(
    filteredEvents
      .filter(e => e.event === AnalyticsEventType.PROMPT_CREATED)
      .map(e => e.metadata.promptId)
  );

  // Process events and count metrics
  filteredEvents.forEach(event => {
    const promptId = event.metadata.promptId;
    
    switch (event.event) {
      case AnalyticsEventType.PROMPT_USED:
        promptUsage[promptId] = (promptUsage[promptId] || 0) + 1;
        break;
      case AnalyticsEventType.PROMPT_MODIFIED:
        modificationFrequency[promptId] = (modificationFrequency[promptId] || 0) + 1;
        break;
      case AnalyticsEventType.PROMPT_SYNCED:
        syncCount++;
        break;
      case AnalyticsEventType.PROMPT_ERROR:
        errorCount++;
        break;
    }
  });

  const timespan = timeRange 
    ? (timeRange.end - timeRange.start) / MS_PER_DAY
    : events.length > 0
      ? (Date.now() - Math.min(...events.map(e => e.timestamp))) / MS_PER_DAY
      : 1; // Default to 1 day if no events

  const mostUsedPrompts = Object.entries(promptUsage)
    .map(([promptId, count]) => ({ promptId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate error rate differently based on whether we're using a time range
  const errorRate = timeRange
    ? (() => {
        // For time range, only consider sync and error events
        const relevantEvents = filteredEvents.filter(event => 
          event.event === AnalyticsEventType.PROMPT_SYNCED || 
          event.event === AnalyticsEventType.PROMPT_ERROR
        );
        return relevantEvents.length > 0 ? errorCount / relevantEvents.length : 0;
      })()
    : filteredEvents.length > 0 
      ? errorCount / filteredEvents.length // For all events, use total event count
      : 0;

  return {
    totalPrompts: createdPromptIds.size,
    promptUsage,
    averageUsagePerDay: Object.values(promptUsage).reduce((sum, count) => sum + count, 0) / timespan,
    mostUsedPrompts,
    modificationFrequency,
    syncFrequency: syncCount / timespan,
    errorRate
  };
}

export async function exportAnalytics(format: 'json' | 'csv' = 'json'): Promise<string> {
  const events = await getEvents();
  
  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }

  // CSV format
  const headers = ['event', 'timestamp', 'metadata'];
  const rows = events.map(event => [
    event.event,
    new Date(event.timestamp).toISOString(),
    JSON.stringify(event.metadata)
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}