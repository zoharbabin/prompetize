/**
 * Plugin Manager
 *
 * Handles registration and management of plugins for Prompetize.
 *
 * ADR-007: Extensibility and Scalability Architecture
 * Provides mechanisms for third-party plugins to extend the functionality of the extension.
 */

export interface Plugin {
  name: string;
  init: () => void;
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin>;

  private constructor() {
    this.plugins = new Map();
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Registers a new plugin.
   * @param plugin The plugin to register.
   */
  public registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin with name "${plugin.name}" is already registered.`);
    }
    this.plugins.set(plugin.name, plugin);
    plugin.init();
  }

  /**
   * Unregisters an existing plugin by name.
   * @param name The name of the plugin to unregister.
   */
  public unregisterPlugin(name: string): void {
    if (!this.plugins.has(name)) {
      throw new Error(`Plugin with name "${name}" is not registered.`);
    }
    this.plugins.delete(name);
  }

  /**
   * Returns all registered plugins.
   * @returns An array of plugins.
   */
  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}