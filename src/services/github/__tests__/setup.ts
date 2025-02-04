import { vi } from 'vitest';
import {
  mockGet,
  mockSet,
  mockRemove,
  mockLaunchWebAuthFlow
} from '../../../__mocks__/webextension-polyfill';
import {
  DEFAULT_GITHUB_API_CONFIG,
  DEFAULT_GITHUB_SCOPES,
  DEFAULT_REPOSITORY_CONFIG,
  mockAuthServiceInstance,
  mockApiServiceInstance,
  mockRepoServiceInstance
} from '../../../../vitest-setup';

// Create mock storage and identity objects for backward compatibility
export const mockStorage = {
  local: {
    get: mockGet,
    set: mockSet,
    remove: mockRemove
  }
};

export const mockIdentity = {
  launchWebAuthFlow: mockLaunchWebAuthFlow
};

// Re-export everything for convenience
export {
  mockGet,
  mockSet,
  mockRemove,
  mockLaunchWebAuthFlow,
  DEFAULT_GITHUB_API_CONFIG,
  DEFAULT_GITHUB_SCOPES,
  DEFAULT_REPOSITORY_CONFIG,
  mockAuthServiceInstance,
  mockApiServiceInstance,
  mockRepoServiceInstance
};