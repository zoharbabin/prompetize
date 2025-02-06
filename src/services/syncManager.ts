/**
 * Sync Manager
 *
 * Coordinates local prompt data with the GitHub repository.
 * Provides functions to sync local prompt data to GitHub and update local data from GitHub.
 *
 * ADR-003: Local Storage and Data Management
 * Implements synchronization mechanisms between local storage (using Chrome's Storage API with encryption)
 * and GitHub repositories.
 */

import { getPromptData, savePromptData } from "./localDataCache";
import { pushPromptDataToGitHub, pullPromptDataFromGitHub } from "./githubSync";
import { PromptData } from "../types/prompt";

/**
 * Synchronizes a local prompt to the GitHub repository.
 * @param promptId - The unique identifier of the prompt.
 * @param owner - GitHub repository owner.
 * @param repo - GitHub repository name.
 * @returns A promise that resolves when the sync is complete.
 * @throws An error if the prompt is not found in local storage.
 */
export async function syncPromptToGitHub(promptId: string, owner: string, repo: string): Promise<void> {
  const prompt: PromptData | null = await getPromptData(promptId);
  if (!prompt) {
    throw new Error(`Prompt with id "${promptId}" not found in local storage.`);
  }
  await pushPromptDataToGitHub(prompt, owner, repo);
}

/**
 * Updates local prompt data from the GitHub repository.
 * @param promptId - The unique identifier of the prompt.
 * @param owner - GitHub repository owner.
 * @param repo - GitHub repository name.
 * @returns A promise that resolves when the local data is updated.
 * @throws An error if the prompt is not found in the GitHub repository.
 */
export async function updateLocalPromptFromGitHub(promptId: string, owner: string, repo: string): Promise<void> {
  const prompt: PromptData | null = await pullPromptDataFromGitHub(promptId, owner, repo);
  if (!prompt) {
    throw new Error(`Prompt with id "${promptId}" not found in the GitHub repository.`);
  }
  await savePromptData(prompt);
}
