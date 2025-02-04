import { GitHubService, GitHubServiceConfig, GitHubError, GitHubRateLimitError } from '../services/github/index';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 30, // Requests per minute
  timeWindow: 60 * 1000, // 1 minute in milliseconds
};

class RateLimiter {
  private requests: number[] = [];

  public checkLimit(): boolean {
    const now = Date.now();
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT_CONFIG.timeWindow);
    
    if (this.requests.length >= RATE_LIMIT_CONFIG.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  public getTimeToReset(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, RATE_LIMIT_CONFIG.timeWindow - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

// Initialize GitHub service
const initializeGitHubService = async () => {
  const config: GitHubServiceConfig = {
    auth: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      redirectUri: chrome.identity.getRedirectURL('github'),
      scopes: ['repo', 'user', 'delete_repo']
    }
  };

  if (!config.auth.clientId) {
    console.error('GitHub client ID not configured');
    return;
  }

  return GitHubService.getInstance(config);
};

// Message handling
type MessageHandler = (request: any) => Promise<any>;

const messageHandlers: Record<string, MessageHandler> = {
  // Authentication
  async authenticate() {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    await github.authenticate();
    return { success: true };
  },

  async logout() {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    await github.logout();
    return { success: true };
  },

  async checkAuthStatus() {
    const github = await initializeGitHubService();
    if (!github) return { isAuthenticated: false };
    return { isAuthenticated: await github.isAuthenticated() };
  },

  // Repository management
  async listRepositories() {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    return await github.listAvailableRepositories();
  },

  async createPersonalRepository(request) {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    return await github.createPersonalRepository(request.name, request.isPrivate);
  },

  // Template management
  async saveTemplate(request) {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    await github.savePromptTemplate(
      request.owner,
      request.repo,
      request.templateName,
      request.content,
      request.isUpdate
    );
    return { success: true };
  },

  async getTemplate(request) {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    return {
      content: await github.getPromptTemplate(
        request.owner,
        request.repo,
        request.templateName
      )
    };
  },

  async contributeTemplate(request) {
    const github = await initializeGitHubService();
    if (!github) throw new Error('GitHub service not initialized');
    await github.contributeToDefaultRepository(
      request.templateName,
      request.content
    );
    return { success: true };
  }
};

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request.type || !messageHandlers[request.type]) {
    sendResponse({ error: 'Invalid request type' });
    return false;
  }

  // Check rate limiting
  if (!rateLimiter.checkLimit()) {
    const timeToReset = rateLimiter.getTimeToReset();
    sendResponse({
      error: new GitHubRateLimitError(
        `Rate limit exceeded. Please try again in ${Math.ceil(timeToReset / 1000)} seconds.`
      )
    });
    return false;
  }

  // Handle the request
  messageHandlers[request.type](request)
    .then(response => sendResponse({ data: response }))
    .catch(error => {
      console.error(`Error handling ${request.type}:`, error);
      sendResponse({
        error: error instanceof GitHubError
          ? error
          : new GitHubError(error.message || 'Unknown error', 'UNKNOWN_ERROR')
      });
    });

  return true; // Keep the message channel open for async response
});

// Installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open the options page for initial setup
    chrome.runtime.openOptionsPage();
  }
});