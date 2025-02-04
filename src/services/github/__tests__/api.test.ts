import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubApiService, GitHubApiConfig } from '../api';
import { GitHubAuthService } from '../auth';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth service
vi.mock('../auth', () => ({
  GitHubAuthService: {
    getInstance: vi.fn()
  }
}));

describe('GitHubApiService', () => {
  let apiService: GitHubApiService;
  const mockConfig: GitHubApiConfig = {
    baseUrl: 'https://api.github.com',
    userAgent: 'test-user-agent'
  };
  const mockToken = 'test-token';
  const mockAuthService = {
    getStoredToken: vi.fn().mockResolvedValue(mockToken)
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Reset singleton instance
    // @ts-ignore - accessing private static property for testing
    GitHubApiService.instance = undefined;

    // Setup mock auth service
    (GitHubAuthService.getInstance as any).mockReturnValue(mockAuthService);
    mockAuthService.getStoredToken.mockResolvedValue(mockToken);

    // Create new instance
    apiService = GitHubApiService.getInstance(mockConfig, mockAuthService as any);
  });

  describe('getInstance', () => {
    it('should create new instance with config and auth service', () => {
      const instance = GitHubApiService.getInstance(mockConfig, mockAuthService as any);
      expect(instance).toBeInstanceOf(GitHubApiService);
    });

    it('should return existing instance without params', () => {
      const instance1 = GitHubApiService.getInstance(mockConfig, mockAuthService as any);
      const instance2 = GitHubApiService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should throw error when getting instance without initial config', () => {
      // @ts-ignore - accessing private static property for testing
      GitHubApiService.instance = undefined;
      expect(() => GitHubApiService.getInstance()).toThrow('GitHubApiService requires config and auth service for initialization');
    });
  });

  describe('Repository Operations', () => {
    describe('createRepository', () => {
      it('should create repository successfully', async () => {
        const mockResponse = {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          private: true
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await apiService.createRepository('test-repo', 'Test description', true);

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.github.com/user/repos',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'authorization': `token ${mockToken}`,
              'accept': 'application/vnd.github.v3+json',
              'user-agent': mockConfig.userAgent
            },
            body: JSON.stringify({
              name: 'test-repo',
              description: 'Test description',
              private: true,
              auto_init: true
            })
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle API errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: 'Repository creation failed' })
        });

        await expect(apiService.createRepository('test-repo'))
          .rejects
          .toThrow('GitHub API Error: Repository creation failed');
      });
    });

    describe('getRepository', () => {
      it('should fetch repository successfully', async () => {
        const mockResponse = {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo'
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await apiService.getRepository('user', 'test-repo');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.github.com/repos/user/test-repo',
          expect.objectContaining({
            headers: {
              'authorization': `token ${mockToken}`,
              'accept': 'application/vnd.github.v3+json',
              'user-agent': mockConfig.userAgent
            }
          })
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('forkRepository', () => {
      it('should fork repository successfully', async () => {
        const mockResponse = {
          id: 2,
          name: 'test-repo-fork',
          full_name: 'user/test-repo-fork'
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await apiService.forkRepository('owner', 'repo');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.github.com/repos/owner/repo/forks',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'authorization': `token ${mockToken}`,
              'accept': 'application/vnd.github.v3+json',
              'user-agent': mockConfig.userAgent
            }
          })
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle fork API errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: 'Fork creation failed' })
        });

        await expect(apiService.forkRepository('owner', 'repo'))
          .rejects
          .toThrow('GitHub API Error: Fork creation failed');
      });
    });
  });

  describe('File Operations', () => {
    describe('createOrUpdateFile', () => {
      it('should create new file successfully', async () => {
        mockFetch
          // First call to check if file exists
          .mockResolvedValueOnce({
            ok: false,
            status: 404
          })
          // Second call to create file
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ content: { sha: 'new-sha' } })
          });

        await apiService.createOrUpdateFile(
          'user',
          'repo',
          'test.txt',
          'content',
          'Add test file'
        );

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith(
          'https://api.github.com/repos/user/repo/contents/test.txt',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('content')
          })
        );
      });

      it('should update existing file successfully', async () => {
        const existingSha = 'existing-sha';
        mockFetch
          // First call to get existing file
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ sha: existingSha })
          })
          // Second call to update file
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ content: { sha: 'new-sha' } })
          });

        await apiService.createOrUpdateFile(
          'user',
          'repo',
          'test.txt',
          'updated content',
          'Update test file'
        );

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith(
          'https://api.github.com/repos/user/repo/contents/test.txt',
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining(existingSha)
          })
        );
      });
    });
  });
});