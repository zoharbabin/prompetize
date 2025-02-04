import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepositoryManagementService, RepositoryConfig } from '../repository';
import { GitHubApiService } from '../api';

// Mock GitHubApiService
vi.mock('../api', () => ({
  GitHubApiService: {
    getInstance: vi.fn()
  }
}));

describe('RepositoryManagementService', () => {
  let repoService: RepositoryManagementService;
  const mockConfig: RepositoryConfig = {
    defaultCommunityRepo: {
      owner: 'test-org',
      name: 'test-repo'
    }
  };

  const mockUserRepos = [
    { id: 1, name: 'repo1' },
    { id: 2, name: 'repo2' }
  ];

  const mockCommunityRepo = { id: 3, name: 'community' };

  const mockApiService = {
    getRepository: vi.fn(),
    createRepository: vi.fn(),
    listUserRepositories: vi.fn(),
    createOrUpdateFile: vi.fn(),
    getFile: vi.fn(),
    createBranch: vi.fn(),
    createPullRequest: vi.fn(),
    forkRepository: vi.fn()
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset singleton instance
    // @ts-ignore - accessing private static property for testing
    RepositoryManagementService.instance = undefined;

    // Setup mock API service
    (GitHubApiService.getInstance as any).mockReturnValue(mockApiService);

    // Set default mock implementations
    mockApiService.listUserRepositories.mockResolvedValue([...mockUserRepos]);
    mockApiService.getRepository.mockResolvedValue({ ...mockCommunityRepo });
    mockApiService.forkRepository.mockResolvedValue({
      id: 4,
      name: 'test-repo-fork'
    });

    // Create new instance
    repoService = RepositoryManagementService.getInstance(mockApiService as any, mockConfig);
  });

  describe('getInstance', () => {
    it('should create new instance with config and API service', () => {
      const instance = RepositoryManagementService.getInstance(mockApiService as any, mockConfig);
      expect(instance).toBeInstanceOf(RepositoryManagementService);
    });

    it('should return existing instance without params', () => {
      const instance1 = RepositoryManagementService.getInstance(mockApiService as any, mockConfig);
      const instance2 = RepositoryManagementService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should throw error when getting instance without initial config', () => {
      // @ts-ignore - accessing private static property for testing
      RepositoryManagementService.instance = undefined;
      expect(() => RepositoryManagementService.getInstance()).toThrow('RepositoryManagementService requires API service and config for initialization');
    });
  });

  describe('ensureDefaultRepositoryAccess', () => {
    it('should return repository when access is available', async () => {
      const result = await repoService.ensureDefaultRepositoryAccess();

      expect(mockApiService.getRepository).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name
      );
      expect(result).toEqual(mockCommunityRepo);
    });

    it('should create fork when direct access fails', async () => {
      const mockError = new Error('Not found');
      mockApiService.getRepository.mockRejectedValueOnce(mockError);

      const mockForkResponse = { id: 4, name: 'test-repo-fork' };
      mockApiService.forkRepository.mockResolvedValueOnce(mockForkResponse);

      const result = await repoService.ensureDefaultRepositoryAccess();

      expect(mockApiService.forkRepository).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name
      );
      expect(result).toEqual(mockForkResponse);
    });
  });

  describe('createPersonalRepository', () => {
    it('should create personal repository successfully', async () => {
      const mockRepo = {
        id: 1,
        name: 'personal-repo',
        private: true
      };
      mockApiService.createRepository.mockResolvedValueOnce(mockRepo);

      const result = await repoService.createPersonalRepository('personal-repo', true);

      expect(mockApiService.createRepository).toHaveBeenCalledWith(
        'personal-repo',
        'Personal prompt template repository created with Prompetize',
        true
      );
      expect(result).toEqual(mockRepo);
    });
  });

  describe('listAvailableRepositories', () => {
    it('should list user repositories and include community repo if accessible', async () => {
      const expectedRepos = [{ ...mockCommunityRepo }, ...mockUserRepos];
      mockApiService.listUserRepositories.mockResolvedValueOnce([...mockUserRepos]);
      mockApiService.getRepository.mockResolvedValueOnce({ ...mockCommunityRepo });

      const result = await repoService.listAvailableRepositories();

      expect(result).toEqual(expectedRepos);
      expect(mockApiService.listUserRepositories).toHaveBeenCalled();
      expect(mockApiService.getRepository).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name
      );
    });

    it('should list only user repositories when community repo is not accessible', async () => {
      mockApiService.getRepository.mockRejectedValueOnce(new Error('Not found'));
      mockApiService.listUserRepositories.mockResolvedValueOnce([...mockUserRepos]);

      const result = await repoService.listAvailableRepositories();

      expect(result).toEqual(mockUserRepos);
      expect(mockApiService.listUserRepositories).toHaveBeenCalled();
    });
  });

  describe('contributeToDefaultRepository', () => {
    it('should create pull request with template changes', async () => {
      const templateName = 'test-template';
      const content = '{"test": "content"}';
      const timestamp = Date.now();
      vi.setSystemTime(timestamp);

      await repoService.contributeToDefaultRepository(templateName, content);

      expect(mockApiService.createBranch).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name,
        `template-${templateName}-${timestamp}`,
        'main'
      );

      expect(mockApiService.createOrUpdateFile).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name,
        `templates/${templateName}.json`,
        content,
        `Add prompt template: ${templateName}`
      );

      expect(mockApiService.createPullRequest).toHaveBeenCalledWith(
        mockConfig.defaultCommunityRepo.owner,
        mockConfig.defaultCommunityRepo.name,
        `Add prompt template: ${templateName}`,
        `template-${templateName}-${timestamp}`,
        'main',
        'Contributed via Prompetize extension'
      );
    });
  });
});