import promptLibrary from './prompt_library.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Prompetize extension loaded!');

  // Example usage:
  const prompts = promptLibrary.getPrompts();
  console.log('Prompts:', prompts);
});
