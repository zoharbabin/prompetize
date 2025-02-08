import promptLibrary from './prompt_library.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Prompetize extension loaded!');

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
      listItem.textContent = prompt.name;
      promptList.appendChild(listItem);
    });
  }

  displayPrompts();
});
