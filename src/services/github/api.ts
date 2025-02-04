import { GitHubAuthService } from './auth';

export interface GitHubApiConfig {
  baseUrl: string;
  userAgent: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  owner: {
    login: string;
    id: number;
  };
}

export class GitHubApiService {
  private static instance: GitHubApiService;
  private config: GitHubApiConfig;
  private authService: GitHubAuthService;

  private constructor(config: GitHubApiConfig, authService: GitHubAuthService) {
    this.config = config;
    this.authService = authService;
  }

  public static getInstance(config?: GitHubApiConfig, authService?: GitHubAuthService): GitHubApiService {
    if (!GitHubApiService.instance) {
      if (!config || !authService) {
        throw new Error('GitHubApiService requires config and auth service for initialization');
      }
      GitHubApiService.instance = new GitHubApiService(config, authService);
    }
    return GitHubApiService.instance;
  }

  private async getHeaders(): Promise<Headers> {
    const token = await this.authService.getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    return new Headers({
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': this.config.userAgent
    });
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = await this.getHeaders();
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...Object.fromEntries(headers.entries()),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API Error: ${error.message}`);
    }

    return response;
  }

  // Repository Management
  public async createRepository(name: string, description?: string, isPrivate = false): Promise<GitHubRepository> {
    const response = await this.fetchWithAuth('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true
      })
    });

    return response.json();
  }

  public async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.fetchWithAuth(`/repos/${owner}/${repo}`);
    return response.json();
  }

  public async listUserRepositories(): Promise<GitHubRepository[]> {
    const response = await this.fetchWithAuth('/user/repos?type=owner');
    return response.json();
  }

  public async forkRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.fetchWithAuth(`/repos/${owner}/${repo}/forks`, {
      method: 'POST'
    });
    return response.json();
  }

  // File Operations
  public async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string
  ): Promise<void> {
    const contentBase64 = btoa(content);
    let currentFile;

    try {
      // Try to get the current file to get its SHA
      const response = await this.fetchWithAuth(`/repos/${owner}/${repo}/contents/${path}`);
      currentFile = await response.json();
    } catch (error) {
      // File doesn't exist, which is fine
    }

    await this.fetchWithAuth(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: contentBase64,
        sha: currentFile?.sha,
        branch: branch || undefined
      })
    });
  }

  public async getFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<{ content: string; sha: string }> {
    const response = await this.fetchWithAuth(
      `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`
    );
    const data = await response.json();
    
    return {
      content: atob(data.content),
      sha: data.sha
    };
  }

  // Branch Operations
  public async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromBranch: string
  ): Promise<void> {
    // Get the SHA of the latest commit on the source branch
    const response = await this.fetchWithAuth(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
    const { object: { sha } } = await response.json();

    // Create the new branch
    await this.fetchWithAuth(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha
      })
    });
  }

  // Pull Request Operations
  public async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<void> {
    await this.fetchWithAuth(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        head,
        base,
        body
      })
    });
  }
}

// Default configuration
export const DEFAULT_GITHUB_API_CONFIG: GitHubApiConfig = {
  baseUrl: 'https://api.github.com',
  userAgent: 'Prompetize-Extension'
};