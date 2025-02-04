import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the individual services with synchronous factory functions
vi.mock('../auth', () => ({
  GitHubAuthService: {
    getInstance: vi.fn()
  }
}));

vi.mock('../api', () => ({
  GitHubApiService: {
    getInstance: vi.fn()
  },
  DEFAULT_GITHUB_API_CONFIG: {
    baseUrl: 'https://api.github.com',
    userAgent: 'Prompetize-Extension-Test'
  }
}));

vi.mock('../repository', () => ({
  RepositoryManagementService: {
    getInstance: vi.fn()
  },
  DEFAULT_REPOSITORY_CONFIG: {
    defaultCommunityRepo: {
      owner: 'prompetize-community',
      name: 'prompts'
    }
  }
}));

import { GitHubService, GitHubServiceConfig } from '../index';
import { GitHubAuthService } from '../auth';
import { GitHubApiService, DEFAULT_GITHUB_API_CONFIG } from '../api';
import { RepositoryManagementService, DEFAULT_REPOSITORY_CONFIG } from '../repository';
import { mockStorage, mockIdentity } from './setup'; 

describe('GitHubService', () => {
  let service: GitHubService;
  const mockConfig: GitHubServiceConfig = {
    auth: {
      clientId: 'test-client-id',
      redirectUri: 'test-redirect-uri',
      scopes: ['repo', 'user']
    }
  };

  const mockAuthService = {
    authenticate: vi.fn(),
    logout: vi.fn(),
    getStoredToken: vi.fn()
  };

  const mockApiService = {
    getRepository: vi.fn(),
    createRepository: vi.fn()
  };

  const mockRepoService = {
    ensureDefaultRepositoryAccess: vi.fn(),
    listAvailableRepositories: vi.fn(),
    createPersonalRepository: vi.fn(),
    savePromptTemplate: vi.fn(),
    getPromptTemplate: vi.fn(),
    contributeToDefaultRepository: vi.fn()
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Set launchWebAuthFlow to return a URL with access_token
    mockIdentity.launchWebAuthFlow.mockResolvedValue('chrome-extension://id/callback#access_token=test-token');

    // Reset singleton instance
    // @ts-ignore - accessing private static property for testing
    GitHubService.instance = undefined;

    // Setup mock services
    (GitHubAuthService.getInstance as any).mockReturnValue(mockAuthService);
    (GitHubApiService.getInstance as any).mockReturnValue(mockApiService);
    (RepositoryManagementService.getInstance as any).mockReturnValue(mockRepoService);

    // Create new instance
    service = GitHubService.getInstance(mockConfig);
  });

  describe('getInstance', () => {
    it('should create new instance with config', () => {
      const instance = GitHubService.getInstance(mockConfig);
      expect(instance).toBeInstanceOf(GitHubService);
    });

    it('should return existing instance without config', () => {
      const instance1 = GitHubService.getInstance(mockConfig);
      const instance2 = GitHubService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should throw error when getting instance without initial config', () => {
      // @ts-ignore - accessing private static property for testing
      GitHubService.instance = undefined;
      expect(() => GitHubService.getInstance()).toThrow();
    });
  });

  describe('isInitialized', () => {
    it('should return true when instance exists', () => {
      GitHubService.getInstance(mockConfig);
      expect(GitHubService.isInitialized()).toBe(true);
    });

    it('should return false when no instance exists', () => {
      // @ts-ignore - accessing private static property for testing
      GitHubService.instance = undefined;
      expect(GitHubService.isInitialized()).toBe(false);
    });
  });

  describe('Authentication Methods', () => {
    describe('authenticate', () => {
      it('should call auth service authenticate method', async () => {
        await service.authenticate();
        expect(mockAuthService.authenticate).toHaveBeenCalled();
      });
    });

    describe('logout', () => {
      it('should call auth service logout method', async () => {
        await service.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
      });
    });

    describe('isAuthenticated', () => {
      it('should return true when token exists', async () => {
        mockAuthService.getStoredToken.mockResolvedValueOnce('test-token');
        const result = await service.isAuthenticated();
        expect(result).toBe(true);
      });

      it('should return false when no token exists', async () => {
        mockAuthService.getStoredToken.mockResolvedValueOnce(null);
        const result = await service.isAuthenticated();
        expect(result).toBe(false);
      });
    });
  });

  describe('Repository Management Methods', () => {
    describe('ensureDefaultRepositoryAccess', () => {
      it('should call repo service method', async () => {
        const mockRepo = { id: 1, name: 'test-repo' };
        mockRepoService.ensureDefaultRepositoryAccess.mockResolvedValueOnce(mockRepo);
        
        const result = await service.ensureDefaultRepositoryAccess();
        
        expect(mockRepoService.ensureDefaultRepositoryAccess).toHaveBeenCalled();
        expect(result).toEqual(mockRepo);
      });
    });

    describe('listAvailableRepositories', () => {
      it('should call repo service method', async () => {
        const mockRepos = [{ id: 1, name: 'repo1' }];
        mockRepoService.listAvailableRepositories.mockResolvedValueOnce(mockRepos);
        
        const result = await service.listAvailableRepositories();
        
        expect(mockRepoService.listAvailableRepositories).toHaveBeenCalled();
        expect(result).toEqual(mockRepos);
      });
    });

    describe('createPersonalRepository', () => {
      it('should call repo service method with correct parameters', async () => {
        const mockRepo = { id: 1, name: 'personal-repo' };
        mockRepoService.createPersonalRepository.mockResolvedValueOnce(mockRepo);
        
        const result = await service.createPersonalRepository('personal-repo', true);
        
        expect(mockRepoService.createPersonalRepository).toHaveBeenCalledWith(
          'personal-repo',
          true
        );
        expect(result).toEqual(mockRepo);
      });
    });

    describe('Template Operations', () => {
      describe('savePromptTemplate', () => {
        it('should call repo service method with correct parameters', async () => {
          await service.savePromptTemplate(
            'owner',
            'repo',
            'template',
            'content',
            true
          );
          
          expect(mockRepoService.savePromptTemplate).toHaveBeenCalledWith(
            'owner',
            'repo',
            'template',
            'content',
            true
          );
        });
      });

      describe('getPromptTemplate', () => {
        it('should call repo service method with correct parameters', async () => {
          const mockContent = '{"test": "content"}';
          mockRepoService.getPromptTemplate.mockResolvedValueOnce(mockContent);
          
          const result = await service.getPromptTemplate(
            'owner',
            'repo',
            'template'
          );
          
          expect(mockRepoService.getPromptTemplate).toHaveBeenCalledWith(
            'owner',
            'repo',
            'template'
          );
          expect(result).toEqual(mockContent);
        });
      });

      describe('contributeToDefaultRepository', () => {
        it('should call repo service method with correct parameters', async () => {
          await service.contributeToDefaultRepository(
            'template',
            'content'
          );
          
          expect(mockRepoService.contributeToDefaultRepository).toHaveBeenCalledWith(
            'template',
            'content'
          );
        });
      });
    });
  });
});