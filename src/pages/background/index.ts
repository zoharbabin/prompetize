import Browser from 'webextension-polyfill';
import type { Runtime, Tabs } from 'webextension-polyfill';

interface ExtensionMessage {
  type: 'INITIALIZE' | 'GET_STORAGE';
  key?: string;
}

// Initialize extension when installed or updated
Browser.runtime.onInstalled.addListener((details: Runtime.OnInstalledDetailsType) => {
  console.log('Extension installed/updated:', details.reason);
});

// Handle messages from content scripts or popup
Browser.runtime.onMessage.addListener(async (
  message: ExtensionMessage,
  sender: Runtime.MessageSender
) => {
  console.log('Received message:', message, 'from:', sender);
  
  switch (message.type) {
    case 'INITIALIZE':
      // Handle initialization
      return { success: true };
      
    case 'GET_STORAGE':
      // Handle storage retrieval
      try {
        const data = await Browser.storage.local.get(message.key);
        return { success: true, data };
      } catch (error: unknown) {
        console.error('Storage error:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
      
    default:
      console.warn('Unknown message type:', message.type);
      return { success: false, error: 'Unknown message type' };
  }
});

// Listen for tab updates
Browser.tabs.onUpdated.addListener((
  tabId: number,
  changeInfo: Tabs.OnUpdatedChangeInfoType,
  tab: Tabs.Tab
) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});

console.log('Background script loaded');