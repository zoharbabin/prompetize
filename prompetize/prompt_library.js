class PromptLibrary {
  constructor() {
    this.prompts = [];
  }

  addPrompt(prompt) {
    this.prompts.push(prompt);
  }

  getPrompts() {
    return this.prompts;
  }

  getPrompt(id) {
    return this.prompts.find(prompt => prompt.id === id);
  }

  updatePrompt(id, updatedPrompt) {
    const index = this.prompts.findIndex(prompt => prompt.id === id);
    if (index !== -1) {
      this.prompts[index] = { ...this.prompts[index], ...updatedPrompt };
    }
  }

  deletePrompt(id) {
    this.prompts = this.prompts.filter(prompt => prompt.id !== id);
  }

  clearPrompts() {
    this.prompts = [];
  }
}

const promptLibrary = new PromptLibrary();

export default promptLibrary;
