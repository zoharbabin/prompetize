import promptLibrary from './prompt_library.js';
import pluginManager from './plugin_manager.js';
import analyticsPlugin from './plugins/analytics_plugin.js';
import versionControlPlugin from './plugins/version_control_plugin.js';

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Prompetize extension loaded!');

  // Register and initialize analytics plugin
  pluginManager.registerPlugin('analytics', analyticsPlugin);
  await pluginManager.initializePlugin('analytics');

  // Example usage:
  const prompts = promptLibrary.getPrompts();
  console.log('Prompts:', prompts);

  const addPromptBtn = document.getElementById('addPromptBtn');
  addPromptBtn.addEventListener('click', function() {
    const promptName = prompt('Enter prompt name:');
    const promptContent = prompt('Enter prompt content:');
    if (promptName && promptContent) {
      const newPrompt = {
        id: Date.now(),
        name: promptName,
        content: promptContent
      };
      promptLibrary.addPrompt(newPrompt);
      console.log('New prompt added:', newPrompt);
      console.log('Prompts:', promptLibrary.getPrompts());
      displayPrompts();
    }
  });

  function displayPrompts() {
    const promptList = document.getElementById('promptList');
    promptList.innerHTML = '';
    const prompts = promptLibrary.getPrompts();
    prompts.forEach(prompt => {
      const listItem = document.createElement('li');
      const usageCount = analyticsPlugin.getPromptStats(prompt.id);
      
      listItem.innerHTML = `
        <span class="prompt-name">${prompt.name}</span>
        <span class="usage-count">(Used: ${usageCount} times)</span>
        <button class="use-prompt-btn" data-id="${prompt.id}">Use</button>
      `;
      
      promptList.appendChild(listItem);
      
      // Add click handler for the Use button
      const useBtn = listItem.querySelector('.use-prompt-btn');
      useBtn.addEventListener('click', () => {
        analyticsPlugin.trackPromptUsage(prompt.id);
        displayPrompts(); // Refresh the display to show updated count
      });
    });
  }

  displayPrompts();

  const trackChangesBtn = document.getElementById('trackChangesBtn');
  trackChangesBtn.addEventListener('click', function() {
    const selectedPrompt = promptLibrary.getPrompts()[0]; // Assuming the first prompt is selected
    if (selectedPrompt) {
      pluginManager.getPlugin('versionControl').trackChange(selectedPrompt);
      alert('Changes tracked!');
    } else {
      alert('No prompt selected!');
    }
  });

  const revertVersionBtn = document.getElementById('revertVersionBtn');
  revertVersionBtn.addEventListener('click', function() {
    const selectedPrompt = promptLibrary.getPrompts()[0]; // Assuming the first prompt is selected
    if (selectedPrompt) {
      const version = prompt('Enter version to revert to:');
      if (version) {
        const revertedPrompt = pluginManager.getPlugin('versionControl').revertToVersion(selectedPrompt.id, version);
        if (revertedPrompt) {
          promptLibrary.updatePrompt(selectedPrompt.id, revertedPrompt);
          displayPrompts();
          alert(`Reverted to version ${version}!`);
        } else {
          alert(`Version ${version} not found for prompt ${selectedPrompt.name}!`);
        }
      } else {
        alert('No version entered!');
      }
    } else {
      alert('No prompt selected!');
    }
  });
});
