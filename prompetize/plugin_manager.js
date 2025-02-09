class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  registerPlugin(name, plugin) {
    if (!this.validatePlugin(plugin)) {
      throw new Error(`Invalid plugin format for ${name}`);
    }
    this.plugins.set(name, plugin);
  }

  validatePlugin(plugin) {
    // Plugin must have an init method and a version
    return plugin && 
           typeof plugin.init === 'function' && 
           typeof plugin.version === 'string';
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.keys());
  }

  async initializePlugin(name) {
    const plugin = this.getPlugin(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    await plugin.init();
  }

  async initializeAllPlugins() {
    for (const name of this.plugins.keys()) {
      await this.initializePlugin(name);
    }
  }
}

import versionControlPlugin from './plugins/version_control_plugin.js';

const pluginManager = new PluginManager();
pluginManager.registerPlugin('versionControl', versionControlPlugin);
export default pluginManager;
