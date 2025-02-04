import { vi, beforeEach } from 'vitest';

// Create mock configurations
export const DEFAULT_GITHUB_API_CONFIG = {
  baseUrl: 'https://api.github.com',
  userAgent: 'test-user-agent'
};

export const DEFAULT_GITHUB_SCOPES = ['repo', 'user'];

export const DEFAULT_REPOSITORY_CONFIG = {
  defaultCommunityRepo: {
    owner: 'test-org',
    name: 'test-repo'
  }
};

// Create mock service instances with proper method binding
export const mockAuthServiceInstance = {
  authenticate: vi.fn(),
  logout: vi.fn(),
  getStoredToken: vi.fn().mockResolvedValue('test-token')
};

export const mockApiServiceInstance = {
  getRepository: vi.fn(),
  createRepository: vi.fn(),
  listUserRepositories: vi.fn(),
  createOrUpdateFile: vi.fn(),
  getFile: vi.fn(),
  createBranch: vi.fn(),
  createPullRequest: vi.fn(),
  forkRepository: vi.fn(),
  getHeaders: vi.fn().mockResolvedValue(new Headers({
    'Authorization': 'token test-token',
    'User-Agent': 'test-user-agent',
    'Accept': 'application/vnd.github.v3+json'
  })),
  fetchWithAuth: vi.fn()
};

export const mockRepoServiceInstance = {
  ensureDefaultRepositoryAccess: vi.fn(),
  listAvailableRepositories: vi.fn(),
  createPersonalRepository: vi.fn(),
  savePromptTemplate: vi.fn(),
  getPromptTemplate: vi.fn(),
  contributeToDefaultRepository: vi.fn()
};

// Reset all mocks and set default implementations before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Set default mock implementations for API service
  mockApiServiceInstance.getRepository.mockResolvedValue({
    id: 1,
    name: 'test-repo',
    full_name: 'test-org/test-repo'
  });

  mockApiServiceInstance.listUserRepositories.mockResolvedValue([
    { id: 1, name: 'repo1' },
    { id: 2, name: 'repo2' }
  ]);

  mockApiServiceInstance.forkRepository.mockResolvedValue({
    id: 3,
    name: 'test-repo-fork',
    full_name: 'user/test-repo-fork'
  });

  mockApiServiceInstance.createRepository.mockResolvedValue({
    id: 4,
    name: 'new-repo',
    full_name: 'user/new-repo'
  });

  mockApiServiceInstance.getFile.mockResolvedValue({
    content: 'test-content',
    sha: 'test-sha'
  });

  mockApiServiceInstance.createOrUpdateFile.mockResolvedValue(undefined);
  mockApiServiceInstance.createBranch.mockResolvedValue(undefined);
  mockApiServiceInstance.createPullRequest.mockResolvedValue(undefined);

  // Set default mock implementations for auth service
  mockAuthServiceInstance.getStoredToken.mockResolvedValue('test-token');
  mockAuthServiceInstance.authenticate.mockResolvedValue('test-token');
  mockAuthServiceInstance.logout.mockResolvedValue(undefined);
});