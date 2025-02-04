import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubAuthService, GitHubAuthConfig } from '../auth';

// Mock browser polyfill before any imports
const mockGet = vi.hoisted(() => vi.fn());
const mockSet = vi.hoisted(() => vi.fn());
const mockRemove = vi.hoisted(() => vi.fn());
const mockLaunchWebAuthFlow = vi.hoisted(() => vi.fn());

vi.mock('webextension-polyfill', () => ({
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
}));

describe('GitHubAuthService', () => {
  let authService: GitHubAuthService;
  const mockConfig: GitHubAuthConfig = {
    clientId: 'test-client-id',
    redirectUri: 'https://test-redirect-uri',
    scopes: ['repo', 'user']
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Set default mock implementations
    mockGet.mockResolvedValue({ githubToken: 'test-token' });
    mockSet.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockLaunchWebAuthFlow.mockResolvedValue('chrome-extension://id/callback#access_token=test-token');

    // Reset the singleton instance before each test
    // @ts-ignore - accessing private static property for testing
    GitHubAuthService.instance = undefined;
    authService = GitHubAuthService.getInstance(mockConfig);
  });

  describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = GitHubAuthService.getInstance(mockConfig);
      expect(instance).toBeInstanceOf(GitHubAuthService);
    });

    it('should return existing instance without config', () => {
      const instance1 = GitHubAuthService.getInstance(mockConfig);
      const instance2 = GitHubAuthService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should throw error when getting instance without initial config', () => {
      // @ts-ignore - accessing private static property for testing
      GitHubAuthService.instance = undefined;
      expect(() => GitHubAuthService.getInstance()).toThrow('GitHubAuthService requires configuration for initialization');
    });
  });

  describe('authenticate', () => {
    it('should successfully authenticate and store token', async () => {
      const mockToken = 'test-access-token';
      mockLaunchWebAuthFlow.mockResolvedValueOnce(
        `chrome-extension://id/callback#access_token=${mockToken}`
      );

      await authService.authenticate();

      expect(mockLaunchWebAuthFlow).toHaveBeenCalledWith({
        url: expect.stringContaining('github.com/login/oauth/authorize'),
        interactive: true
      });
      expect(mockSet).toHaveBeenCalledWith({
        githubToken: mockToken
      });
    });

    it('should throw error when no token in redirect URL', async () => {
      mockLaunchWebAuthFlow.mockResolvedValueOnce(
        'chrome-extension://id/callback'
      );

      await expect(authService.authenticate()).rejects.toThrow(
        'No access token found in redirect URL'
      );
    });

    it('should throw error when auth flow fails', async () => {
      mockLaunchWebAuthFlow.mockRejectedValueOnce(
        new Error('Auth flow failed')
      );

      await expect(authService.authenticate()).rejects.toThrow(
        'Failed to authenticate with GitHub'
      );
    });
  });

  describe('getStoredToken', () => {
    it('should return stored token', async () => {
      const mockToken = 'stored-token';
      mockGet.mockResolvedValueOnce({ githubToken: mockToken });

      const token = await authService.getStoredToken();
      expect(token).toBe(mockToken);
    });

    it('should return null when no token stored', async () => {
      mockGet.mockResolvedValueOnce({});

      const token = await authService.getStoredToken();
      expect(token).toBeNull();
    });

    it('should handle storage errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Storage error'));

      const token = await authService.getStoredToken();
      expect(token).toBeNull();
    });
  });

  describe('logout', () => {
    it('should remove stored token', async () => {
      mockRemove.mockResolvedValueOnce(undefined);

      await authService.logout();
      expect(mockRemove).toHaveBeenCalledWith('githubToken');
    });

    it('should handle storage errors during logout', async () => {
      mockRemove.mockRejectedValueOnce(new Error('Storage error'));

      await expect(authService.logout()).rejects.toThrow('Failed to logout from GitHub');
    });
  });
});