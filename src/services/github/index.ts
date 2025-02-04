import { GitHubAuthService, GitHubAuthConfig, DEFAULT_GITHUB_SCOPES } from './auth';
import { GitHubApiService, GitHubApiConfig, DEFAULT_GITHUB_API_CONFIG } from './api';
import { RepositoryManagementService, RepositoryConfig, DEFAULT_REPOSITORY_CONFIG } from './repository';

export interface GitHubServiceConfig {
  auth: GitHubAuthConfig;
  api?: GitHubApiConfig;
  repository?: RepositoryConfig;
}

export class GitHubService {
  private static instance: GitHubService;
  private authService: GitHubAuthService;
  private apiService: GitHubApiService;
  private repoService: RepositoryManagementService;

  private constructor(config: GitHubServiceConfig) {
    // Initialize authentication service
    this.authService = GitHubAuthService.getInstance({
      clientId: config.auth.clientId,
      redirectUri: config.auth.redirectUri,
      scopes: config.auth.scopes || DEFAULT_GITHUB_SCOPES
    });

    // Initialize API service
    this.apiService = GitHubApiService.getInstance(
      config.api || DEFAULT_GITHUB_API_CONFIG,
      this.authService
    );

    // Initialize repository management service
    this.repoService = RepositoryManagementService.getInstance(
      this.apiService,
      config.repository || DEFAULT_REPOSITORY_CONFIG
    );
  }

  public static getInstance(config?: GitHubServiceConfig): GitHubService {
    if (!GitHubService.instance && config) {
      GitHubService.instance = new GitHubService(config);
    } else if (!GitHubService.instance && !config) {
      throw new Error('GitHubService not initialized. Please provide a configuration.');
    }
    return GitHubService.instance;
  }

  public static isInitialized(): boolean {
    return !!GitHubService.instance;
  }

  // Authentication methods
  public async authenticate(): Promise<void> {
    await this.authService.authenticate();
  }

  public async logout(): Promise<void> {
    await this.authService.logout();
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await this.authService.getStoredToken();
    return !!token;
  }

  // Repository management methods
  public async ensureDefaultRepositoryAccess() {
    return this.repoService.ensureDefaultRepositoryAccess();
  }

  public async listAvailableRepositories() {
    return this.repoService.listAvailableRepositories();
  }

  public async createPersonalRepository(name: string, isPrivate = true) {
    return this.repoService.createPersonalRepository(name, isPrivate);
  }

  public async savePromptTemplate(
    owner: string,
    repo: string,
    templateName: string,
    content: string,
    isUpdate = false
  ) {
    return this.repoService.savePromptTemplate(owner, repo, templateName, content, isUpdate);
  }

  public async getPromptTemplate(owner: string, repo: string, templateName: string) {
    return this.repoService.getPromptTemplate(owner, repo, templateName);
  }

  public async contributeToDefaultRepository(templateName: string, content: string) {
    return this.repoService.contributeToDefaultRepository(templateName, content);
  }
}

// Re-export types and constants
export {
  GitHubAuthConfig,
  GitHubApiConfig,
  RepositoryConfig,
  DEFAULT_GITHUB_SCOPES,
  DEFAULT_GITHUB_API_CONFIG,
  DEFAULT_REPOSITORY_CONFIG
};

// Error types for GitHub integration
export class GitHubError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class GitHubAuthError extends GitHubError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'GitHubAuthError';
  }
}

export class GitHubApiError extends GitHubError {
  constructor(message: string) {
    super(message, 'API_ERROR');
    this.name = 'GitHubApiError';
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_ERROR');
    this.name = 'GitHubRateLimitError';
  }
}