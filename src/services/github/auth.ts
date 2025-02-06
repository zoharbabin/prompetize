import * as browser from 'webextension-polyfill';
import { getKey, encryptData, decryptData } from '../localDataCache';

export interface GitHubAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface StorageData {
  githubToken?: string;
}

interface StorageArea {
  get(keys?: string | string[] | Record<string, any>): Promise<StorageData>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
}

// Test environment storage type
type TestCallback = (result?: any) => void;
interface TestStorageArea extends StorageArea {
  get(keys: string | string[] | Record<string, any>, callback?: TestCallback): Promise<StorageData>;
  set(items: Record<string, any>, callback?: TestCallback): Promise<void>;
  remove(keys: string | string[], callback?: TestCallback): Promise<void>;
}

export class GitHubAuthService {
  private static instance: GitHubAuthService;
  private config: GitHubAuthConfig;
  private storage: StorageArea & Partial<TestStorageArea>;

  private constructor(config: GitHubAuthConfig) {
    this.config = config;
    this.storage = browser.storage.local;
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
      let result: StorageData;
      
      if (process.env.NODE_ENV === 'test') {
        result = await new Promise<StorageData>((resolve, reject) => {
          try {
            const storage = this.storage as TestStorageArea;
            storage.get('githubToken', (res: StorageData) => {
              resolve(res || {});
            });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        result = await this.storage.get('githubToken');
      }

      const encryptedToken = result?.githubToken;
      if (!encryptedToken) {
        return null;
      }

      const key = await getKey();
      if (!key) {
        throw new Error('Failed to get encryption key');
      }

      const token = await decryptData(encryptedToken, key);
      return token;
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  public async logout(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'test') {
        await new Promise<void>((resolve, reject) => {
          try {
            const storage = this.storage as TestStorageArea;
            storage.remove('githubToken', () => {
              resolve();
            });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        await this.storage.remove('githubToken');
      }
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
      const key = await getKey();
      if (!key) {
        throw new Error('Failed to get encryption key');
      }

      const encrypted = await encryptData(token, key);
      const data = { githubToken: encrypted };

      if (process.env.NODE_ENV === 'test') {
        await new Promise<void>((resolve, reject) => {
          try {
            const storage = this.storage as TestStorageArea;
            storage.set(data, () => {
              resolve();
            });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        await this.storage.set(data);
      }
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