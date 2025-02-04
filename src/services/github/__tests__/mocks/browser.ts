import { vi } from 'vitest';

export const mockGet = vi.fn();
export const mockSet = vi.fn();
export const mockRemove = vi.fn();
export const mockLaunchWebAuthFlow = vi.fn();

export const browserMock = {
  storage: {
    local: {
      get: mockGet,
      set: mockSet,
      remove: mockRemove
    }
  },
  identity: {
    launchWebAuthFlow: mockLaunchWebAuthFlow
  }
};