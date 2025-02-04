import { vi } from 'vitest';
import type { Browser } from 'webextension-polyfill';

// Export mock functions for test control
export const mockGet = vi.fn().mockResolvedValue({ githubToken: 'test-token' });
export const mockSet = vi.fn().mockResolvedValue(undefined);
export const mockRemove = vi.fn().mockResolvedValue(undefined);
export const mockLaunchWebAuthFlow = vi.fn().mockImplementation(async (details: { url: string; interactive?: boolean }) => {
  if (details.url.includes('success')) {
    return 'chrome-extension://id/callback#access_token=test-token';
  } else if (details.url.includes('fail')) {
    throw new Error('Authentication flow failed');
  }
  return 'chrome-extension://id/callback'; // No token case
});

// Create storage object
export const storage = {
  local: {
    get: mockGet,
    set: mockSet,
    remove: mockRemove,
  },
};

// Create identity object
export const identity = {
  launchWebAuthFlow: mockLaunchWebAuthFlow,
};

// Default export matching the Browser type
const browser = {
  storage,
  identity,
} as unknown as Browser;

export default browser;