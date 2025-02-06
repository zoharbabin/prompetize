import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubAuthService, GitHubAuthConfig } from '../auth';

// Mock browser polyfill before any imports
const mockGet = vi.hoisted(() => vi.fn());
const mockSet = vi.hoisted(() => vi.fn());
const mockRemove = vi.hoisted(() => vi.fn());
const mockLaunchWebAuthFlow = vi.hoisted(() => vi.fn());
const mockGetKey = vi.hoisted(() => vi.fn());
const mockEncryptData = vi.hoisted(() => vi.fn());
const mockDecryptData = vi.hoisted(() => vi.fn());

// Mock localDataCache module
vi.mock('../../localDataCache', () => ({
  getKey: mockGetKey,
  encryptData: mockEncryptData,
  decryptData: mockDecryptData
}));

// Mock browser storage
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

    // Reset the singleton instance before each test
    // @ts-ignore - accessing private static property for testing
    GitHubAuthService.instance = undefined;
    
    // Setup default mock implementations
    mockGetKey.mockResolvedValue('test-key');
    mockEncryptData.mockImplementation(data => `encrypted:${data}`);
    mockDecryptData.mockImplementation(data => data.replace('encrypted:', ''));
    mockLaunchWebAuthFlow.mockResolvedValue('chrome-extension://id/callback#access_token=test-token');

    // Initialize service
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
      const encryptedToken = `encrypted:${mockToken}`;
      
      mockLaunchWebAuthFlow.mockResolvedValueOnce(
        `chrome-extension://id/callback#access_token=${mockToken}`
      );

      mockEncryptData.mockResolvedValueOnce(encryptedToken);

      mockSet.mockImplementationOnce((data, callback) => {
        if (callback) callback();
        return Promise.resolve();
      });

      const token = await authService.authenticate();
      expect(token).toBe(mockToken);
      expect(mockEncryptData).toHaveBeenCalledWith(mockToken, 'test-key');
      expect(mockSet).toHaveBeenCalledWith({ githubToken: encryptedToken }, expect.any(Function));
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
      const encryptedToken = `encrypted:${mockToken}`;

      mockGet.mockImplementationOnce((key, callback) => {
        if (callback) callback({ githubToken: encryptedToken });
        return Promise.resolve({ githubToken: encryptedToken });
      });

      mockDecryptData.mockResolvedValueOnce(mockToken);

      const token = await authService.getStoredToken();
      expect(mockDecryptData).toHaveBeenCalledWith(encryptedToken, 'test-key');
      expect(token).toBe(mockToken);
    });

    it('should return null when no token stored', async () => {
      mockGet.mockImplementationOnce((key, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      });

      const token = await authService.getStoredToken();
      expect(token).toBeNull();
    });

    it('should handle storage errors', async () => {
      mockGet.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const token = await authService.getStoredToken();
      expect(token).toBeNull();
    });
  });

  describe('logout', () => {
    it('should remove stored token', async () => {
      mockRemove.mockImplementationOnce((key, callback) => {
        if (callback) callback();
        return Promise.resolve();
      });

      await authService.logout();
      expect(mockRemove).toHaveBeenCalledWith('githubToken', expect.any(Function));
    });

    it('should handle storage errors during logout', async () => {
      mockRemove.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      await expect(authService.logout()).rejects.toThrow('Failed to logout from GitHub');
    });
  });
});