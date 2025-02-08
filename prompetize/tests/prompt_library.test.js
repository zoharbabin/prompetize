import promptLibrary from '../prompt_library.js';

describe('PromptLibrary', () => {
  beforeEach(() => {
    // Reset the prompts array before each test
    promptLibrary.prompts = [];
  });

  test('adds a prompt correctly', () => {
    const prompt = {
      id: 1,
      name: 'Test Prompt',
      content: 'Test Content'
    };
    promptLibrary.addPrompt(prompt);
    expect(promptLibrary.getPrompts()).toHaveLength(1);
    expect(promptLibrary.getPrompt(1)).toEqual(prompt);
  });

  test('gets all prompts correctly', () => {
    const prompt1 = { id: 1, name: 'Prompt 1', content: 'Content 1' };
    const prompt2 = { id: 2, name: 'Prompt 2', content: 'Content 2' };
    promptLibrary.addPrompt(prompt1);
    promptLibrary.addPrompt(prompt2);
    expect(promptLibrary.getPrompts()).toHaveLength(2);
    expect(promptLibrary.getPrompts()).toEqual([prompt1, prompt2]);
  });

  test('updates a prompt correctly', () => {
    const prompt = { id: 1, name: 'Original', content: 'Content' };
    promptLibrary.addPrompt(prompt);
    promptLibrary.updatePrompt(1, { name: 'Updated' });
    expect(promptLibrary.getPrompt(1).name).toBe('Updated');
  });

  test('deletes a prompt correctly', () => {
    const prompt = { id: 1, name: 'Test', content: 'Content' };
    promptLibrary.addPrompt(prompt);
    promptLibrary.deletePrompt(1);
    expect(promptLibrary.getPrompts()).toHaveLength(0);
  });
});
