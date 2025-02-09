import githubPlugin from '../plugins/github_plugin.js';

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret'
};

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  identity: {
    getRedirectURL: jest.fn(),
    launchWebAuthFlow: jest.fn()
  }
};

// Mock fetch with proper Response objects
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    statusText: 'OK'
  })
);

describe('GitHub Plugin', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset plugin state
    githubPlugin.accessToken = null;
  });

  describe('initialization', () => {
    it('should load existing token from storage', async () => {
      const mockToken = 'test-token';
      chrome.storage.local.get.mockResolvedValue({ github_access_token: mockToken });

      await githubPlugin.init();

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['github_access_token']);
      expect(githubPlugin.accessToken).toBe(mockToken);
    });

    it('should handle missing token gracefully', async () => {
      chrome.storage.local.get.mockResolvedValue({});

      await githubPlugin.init();

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['github_access_token']);
      expect(githubPlugin.accessToken).toBeNull();
    });
  });

  describe('authentication', () => {
    it('should authenticate with GitHub successfully', async () => {
      const mockCode = 'test-code';
      const mockToken = 'test-token';
      
      // Mock the OAuth flow
      chrome.identity.getRedirectURL.mockReturnValue('chrome-extension://callback');
      chrome.identity.launchWebAuthFlow.mockResolvedValue('chrome-extension://callback?code=' + mockCode);
      
      // Mock the token exchange
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ access_token: mockToken }),
          statusText: 'OK'
        })
      );

      const result = await githubPlugin.authenticate();

      expect(result).toBe(true);
      expect(githubPlugin.accessToken).toBe(mockToken);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ github_access_token: mockToken });
    });

    it('should handle authentication failure', async () => {
      chrome.identity.launchWebAuthFlow.mockRejectedValue(new Error('Auth failed'));

      const result = await githubPlugin.authenticate();

      expect(result).toBe(false);
      expect(githubPlugin.accessToken).toBeNull();
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  describe('fetching prompts', () => {
    const mockPrompts = [
      {
        type: 'file',
        name: 'test1.json',
        sha: 'abc123',
        download_url: 'https://api.github.com/repos/test/test1.json'
      },
      {
        type: 'file',
        name: 'test2.json',
        sha: 'def456',
        download_url: 'https://api.github.com/repos/test/test2.json'
      }
    ];

    const mockPromptContents = [
      {
        content: 'Test prompt 1',
        author: 'Test Author 1',
        description: 'Test Description 1',
        tags: ['test', 'prompt']
      },
      {
        content: 'Test prompt 2',
        author: 'Test Author 2',
        description: 'Test Description 2',
        tags: ['test', 'prompt']
      }
    ];

    beforeEach(() => {
      githubPlugin.accessToken = 'test-token';
    });

    it('should fetch prompts successfully', async () => {
      // Mock the API responses
      fetch
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPrompts),
            statusText: 'OK'
          })
        )
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPromptContents[0]),
            statusText: 'OK'
          })
        )
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPromptContents[1]),
            statusText: 'OK'
          })
        );

      const prompts = await githubPlugin.fetchPrompts();

      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toEqual({
        id: mockPrompts[0].sha,
        name: 'test1',
        content: mockPromptContents[0].content,
        metadata: {
          author: mockPromptContents[0].author,
          description: mockPromptContents[0].description,
          tags: mockPromptContents[0].tags
        }
      });
    });

    it('should throw error when not authenticated', async () => {
      githubPlugin.accessToken = null;

      await expect(githubPlugin.fetchPrompts()).rejects.toThrow('Not authenticated with GitHub');
    });

    it('should handle API errors', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Not Found' })
        })
      );

      await expect(githubPlugin.fetchPrompts()).rejects.toThrow('GitHub API error: Not Found');
    });
  });

  describe('contributing prompts', () => {
    const mockPrompt = {
      name: 'test-prompt',
      content: 'Test content',
      metadata: {
        author: 'Test Author',
        description: 'Test Description',
        tags: ['test']
      }
    };

    beforeEach(() => {
      githubPlugin.accessToken = 'test-token';
    });

    it('should contribute prompt successfully', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: { sha: 'new-sha' } }),
          statusText: 'OK'
        })
      );

      const result = await githubPlugin.contributePrompt(mockPrompt);

      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/contents/prompts/test-prompt.json'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Authorization': 'token test-token',
            'Accept': 'application/vnd.github.v3+json'
          }
        })
      );
    });

    it('should throw error when not authenticated', async () => {
      githubPlugin.accessToken = null;

      await expect(githubPlugin.contributePrompt(mockPrompt)).rejects.toThrow('Not authenticated with GitHub');
    });

    it('should handle API errors', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({ message: 'Bad credentials' })
        })
      );

      await expect(githubPlugin.contributePrompt(mockPrompt)).rejects.toThrow('GitHub API error: Unauthorized');
    });
  });

  describe('utility methods', () => {
    it('should correctly report authentication status', () => {
      expect(githubPlugin.isAuthenticated()).toBe(false);
      
      githubPlugin.accessToken = 'test-token';
      expect(githubPlugin.isAuthenticated()).toBe(true);
      
      githubPlugin.accessToken = null;
      expect(githubPlugin.isAuthenticated()).toBe(false);
    });
  });
});
