/**
 * Analytics Module Integration
 *
 * Captures and stores user events such as prompt creation and usage frequency.
 * The events are stored using Chrome's Storage API.
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  metadata: Record<string, any>;
}

const ANALYTICS_KEY = 'analyticsEvents';

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
    timestamp: Date.now(),
    metadata
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