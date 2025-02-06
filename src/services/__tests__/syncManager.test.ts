import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncPromptToGitHub, updateLocalPromptFromGitHub } from '../syncManager';
import { getPromptData, savePromptData } from '../localDataCache';
import { pushPromptDataToGitHub, pullPromptDataFromGitHub } from '../githubSync';
import { PromptData } from '../../types/prompt';

// Mock dependencies
vi.mock('../localDataCache', () => ({
  getPromptData: vi.fn(),
  savePromptData: vi.fn()
}));

vi.mock('../githubSync', () => ({
  pushPromptDataToGitHub: vi.fn(),
  pullPromptDataFromGitHub: vi.fn()
}));

describe('Sync Manager', () => {
  const mockPrompt: PromptData = {
    id: 'test-prompt-1',
    content: 'Test prompt content',
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-02-05T12:00:00Z'
  };

  const mockOwner = 'test-owner';
  const mockRepo = 'test-repo';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncPromptToGitHub', () => {
    it('should sync local prompt to GitHub', async () => {
      (getPromptData as any).mockResolvedValueOnce(mockPrompt);
      (pushPromptDataToGitHub as any).mockResolvedValueOnce(undefined);

      await syncPromptToGitHub(mockPrompt.id, mockOwner, mockRepo);

      expect(getPromptData).toHaveBeenCalledWith(mockPrompt.id);
      expect(pushPromptDataToGitHub).toHaveBeenCalledWith(mockPrompt, mockOwner, mockRepo);
    });

    it('should throw error if prompt not found locally', async () => {
      (getPromptData as any).mockResolvedValueOnce(null);

      await expect(syncPromptToGitHub(mockPrompt.id, mockOwner, mockRepo))
        .rejects
        .toThrow(`Prompt with id "${mockPrompt.id}" not found in local storage.`);
    });
  });

  describe('updateLocalPromptFromGitHub', () => {
    it('should update local prompt from GitHub', async () => {
      (pullPromptDataFromGitHub as any).mockResolvedValueOnce(mockPrompt);
      (savePromptData as any).mockResolvedValueOnce(undefined);

      await updateLocalPromptFromGitHub(mockPrompt.id, mockOwner, mockRepo);

      expect(pullPromptDataFromGitHub).toHaveBeenCalledWith(mockPrompt.id, mockOwner, mockRepo);
      expect(savePromptData).toHaveBeenCalledWith(mockPrompt);
    });

    it('should throw error if prompt not found on GitHub', async () => {
      (pullPromptDataFromGitHub as any).mockResolvedValueOnce(null);

      await expect(updateLocalPromptFromGitHub(mockPrompt.id, mockOwner, mockRepo))
        .rejects
        .toThrow(`Prompt with id "${mockPrompt.id}" not found in the GitHub repository.`);
    });
  });
});