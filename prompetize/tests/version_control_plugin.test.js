import versionControlPlugin from '../plugins/version_control_plugin';
import promptLibrary from '../prompt_library';

describe('VersionControlPlugin', () => {
  beforeEach(() => {
    // Clear prompt library before each test
    promptLibrary.clearPrompts();
  });

  it('should track changes to a prompt', () => {
    const prompt = { id: 1, name: 'Test Prompt', content: 'Test Content' };
    promptLibrary.addPrompt(prompt);

    versionControlPlugin.trackChange(prompt);

    expect(versionControlPlugin.versions.get(prompt.id)).toBeDefined();
    expect(versionControlPlugin.versions.get(prompt.id).length).toBe(1);
  });

  it('should revert to a specific version of a prompt', () => {
    const prompt = { id: 1, name: 'Test Prompt', content: 'Test Content' };
    promptLibrary.addPrompt(prompt);

    versionControlPlugin.trackChange(prompt);
    const revertedPrompt = versionControlPlugin.revertToVersion(prompt.id, versionControlPlugin.versions.get(prompt.id)[0].version);

    expect(revertedPrompt).toEqual(prompt);
  });
});
