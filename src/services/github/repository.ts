import { GitHubApiService, GitHubRepository } from './api';

export interface RepositoryConfig {
  defaultCommunityRepo: {
    owner: string;
    name: string;
  };
}

export class RepositoryManagementService {
  private static instance: RepositoryManagementService;
  private apiService: GitHubApiService;
  private config: RepositoryConfig;

  private constructor(apiService: GitHubApiService, config: RepositoryConfig) {
    this.apiService = apiService;
    this.config = config;
  }

  public static getInstance(
    apiService?: GitHubApiService,
    config?: RepositoryConfig
  ): RepositoryManagementService {
    if (!RepositoryManagementService.instance) {
      if (!apiService || !config) {
        throw new Error('RepositoryManagementService requires API service and config for initialization');
      }
      RepositoryManagementService.instance = new RepositoryManagementService(
        apiService,
        config
      );
    }
    return RepositoryManagementService.instance;
  }

  /**
   * Ensures access to the default community repository
   * Creates a fork if the user doesn't have access
   */
  public async ensureDefaultRepositoryAccess(): Promise<GitHubRepository> {
    try {
      // First try to access the community repository directly
      return await this.apiService.getRepository(
        this.config.defaultCommunityRepo.owner,
        this.config.defaultCommunityRepo.name
      );
    } catch (error) {
      // If access fails, create a fork for the user
      return this.forkDefaultRepository();
    }
  }

  /**
   * Creates a fork of the default community repository
   */
  private async forkDefaultRepository(): Promise<GitHubRepository> {
    const { owner, name } = this.config.defaultCommunityRepo;
    return this.apiService.forkRepository(owner, name);
  }

  /**
   * Creates a new personal repository for prompt templates
   */
  public async createPersonalRepository(
    name: string,
    isPrivate = true
  ): Promise<GitHubRepository> {
    return this.apiService.createRepository(
      name,
      'Personal prompt template repository created with Prompetize',
      isPrivate
    );
  }

  /**
   * Lists all repositories the user has access to
   * Includes both personal repositories and the default community repository
   */
  public async listAvailableRepositories(): Promise<GitHubRepository[]> {
    const repositories = await this.apiService.listUserRepositories();
    
    try {
      // Try to add the default community repository if accessible
      const communityRepo = await this.apiService.getRepository(
        this.config.defaultCommunityRepo.owner,
        this.config.defaultCommunityRepo.name
      );
      repositories.unshift(communityRepo);
    } catch (error) {
      // Ignore if the community repository is not accessible
      console.log('Default community repository not accessible');
    }

    return repositories;
  }

  /**
   * Saves a prompt template to the specified repository
   */
  public async savePromptTemplate(
    owner: string,
    repo: string,
    templateName: string,
    content: string,
    isUpdate = false
  ): Promise<void> {
    const path = `templates/${templateName}.json`;
    const message = isUpdate
      ? `Update prompt template: ${templateName}`
      : `Add prompt template: ${templateName}`;

    await this.apiService.createOrUpdateFile(
      owner,
      repo,
      path,
      content,
      message
    );
  }

  /**
   * Retrieves a prompt template from the specified repository
   */
  public async getPromptTemplate(
    owner: string,
    repo: string,
    templateName: string
  ): Promise<string> {
    const path = `templates/${templateName}.json`;
    const { content } = await this.apiService.getFile(owner, repo, path);
    return content;
  }

  /**
   * Creates a pull request to contribute a template to the community repository
   */
  public async contributeToDefaultRepository(
    templateName: string,
    content: string
  ): Promise<void> {
    const { owner, name } = this.config.defaultCommunityRepo;
    const branchName = `template-${templateName}-${Date.now()}`;

    // Create a new branch
    await this.apiService.createBranch(
      owner,
      name,
      branchName,
      'main' // Assuming main is the default branch
    );

    // Add the template to the new branch
    await this.savePromptTemplate(
      owner,
      name,
      templateName,
      content
    );

    // Create a pull request
    await this.apiService.createPullRequest(
      owner,
      name,
      `Add prompt template: ${templateName}`,
      branchName,
      'main',
      'Contributed via Prompetize extension'
    );
  }
}

// Default configuration
export const DEFAULT_REPOSITORY_CONFIG: RepositoryConfig = {
  defaultCommunityRepo: {
    owner: 'prompetize-community',
    name: 'prompts'
  }
};