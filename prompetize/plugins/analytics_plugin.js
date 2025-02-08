class AnalyticsPlugin {
  constructor() {
    this.version = '1.0.0';
    this.usageData = new Map();
  }

  async init() {
    // Load any saved analytics data from storage
    const data = await chrome.storage.local.get('analyticsData');
    if (data.analyticsData) {
      this.usageData = new Map(JSON.parse(data.analyticsData));
    }
  }

  // Track when a prompt is used
  trackPromptUsage(promptId) {
    const currentCount = this.usageData.get(promptId) || 0;
    this.usageData.set(promptId, currentCount + 1);
    this.saveData();
  }

  // Get usage statistics for a prompt
  getPromptStats(promptId) {
    return this.usageData.get(promptId) || 0;
  }

  // Get all usage statistics
  getAllStats() {
    return Object.fromEntries(this.usageData);
  }

  // Save data to chrome storage
  async saveData() {
    await chrome.storage.local.set({
      analyticsData: JSON.stringify(Array.from(this.usageData.entries()))
    });
  }
}

const analyticsPlugin = new AnalyticsPlugin();
export default analyticsPlugin;
