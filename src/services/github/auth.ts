import * as browser from 'webextension-polyfill';

export interface GitHubAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface StorageData {
  githubToken?: string;
}

export class GitHubAuthService {
  private static instance: GitHubAuthService;
  private config: GitHubAuthConfig;

  private constructor(config: GitHubAuthConfig) {
    this.config = config;
  }

  public static getInstance(config?: GitHubAuthConfig): GitHubAuthService {
    if (!GitHubAuthService.instance) {
      if (!config) {
        throw new Error('GitHubAuthService requires configuration for initialization');
      }
      GitHubAuthService.instance = new GitHubAuthService(config);
    }
    return GitHubAuthService.instance;
  }

  public async authenticate(): Promise<string> {
    try {
      const authUrl = this.buildAuthUrl();
      const redirectUrl = await this.launchWebAuthFlow(authUrl);
      const token = this.extractTokenFromUrl(redirectUrl);
      await this.saveToken(token);
      return token;
    } catch (error) {
      console.error('GitHub authentication failed:', error);
      if (error instanceof Error && error.message === 'No access token found in redirect URL') {
        throw error;
      }
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  public async getStoredToken(): Promise<string | null> {
    try {
      const result = await browser.storage.local.get('githubToken') as StorageData;
      return result.githubToken || null;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  public async logout(): Promise<void> {
    try {
      await browser.storage.local.remove('githubToken');
    } catch (error) {
      console.error('Failed to logout:', error);
      throw new Error('Failed to logout from GitHub');
    }
  }

  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'token'
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  private async launchWebAuthFlow(authUrl: string): Promise<string> {
    return browser.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    });
  }

  private extractTokenFromUrl(redirectUrl: string): string {
    const url = new URL(redirectUrl);
    const hashParams = new URLSearchParams(url.hash.substring(1));
    const token = hashParams.get('access_token');

    if (!token) {
      throw new Error('No access token found in redirect URL');
    }

    return token;
  }

  private async saveToken(token: string): Promise<void> {
    try {
      await browser.storage.local.set({ githubToken: token });
    } catch (error) {
      console.error('Failed to save token:', error);
      throw new Error('Failed to save GitHub token');
    }
  }
}

// Export default scopes needed for the application
export const DEFAULT_GITHUB_SCOPES = [
  'repo',           // Full control of private repositories
  'user',           // Read/write user profile data
  'delete_repo'     // Delete repositories
];