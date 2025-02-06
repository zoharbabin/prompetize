/**
 * GitHub Synchronization Module for prompt data.
 * This module handles pushing local prompt data changes to the GitHub repository
 * and retrieving prompt data from GitHub to synchronize the local cache.
 */

import { PromptData } from "../types/prompt";
import { GitHubApiService } from "./github/api";

/**
 * Push local prompt data to GitHub repository.
 * @param prompt - Prompt data to be synchronized.
 */
export async function pushPromptDataToGitHub(prompt: PromptData, owner: string, repo: string): Promise<void> {
    const apiService = GitHubApiService.getInstance();
    const content = JSON.stringify({
        ...prompt,
        syncedAt: new Date().toISOString(),
    }, null, 2);

    const filePath = `prompts/${prompt.id}.json`;
    const commitMessage = `Sync prompt ${prompt.id} at ${new Date().toISOString()}`;

    await apiService.createOrUpdateFile(owner, repo, filePath, content, commitMessage);
}

/**
 * Pull prompt data from GitHub repository.
 * @param promptId - Identifier of the prompt.
 * @returns The prompt data if found, otherwise null.
 */
export async function pullPromptDataFromGitHub(promptId: string, owner: string, repo: string): Promise<PromptData | null> {
    const apiService = GitHubApiService.getInstance();
    const filePath = `prompts/${promptId}.json`;
    try {
        const file = await apiService.getFile(owner, repo, filePath);
        if (!file) {
            return null;
        }
        const prompt: PromptData = JSON.parse(file.content);
        return prompt;
    } catch (error) {
        console.error("Error pulling prompt data from GitHub:", error);
        return null;
    }
}