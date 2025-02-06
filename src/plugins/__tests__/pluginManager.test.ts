import { describe, it, expect, beforeEach } from 'vitest';
import { PluginManager, Plugin } from '../../plugins/pluginManager';

describe('PluginManager', () => {
  const manager = PluginManager.getInstance();

  function clearPlugins() {
    manager.getPlugins().forEach(plugin => {
      try {
        manager.unregisterPlugin(plugin.name);
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
  }

  beforeEach(() => {
    clearPlugins();
  });

  it('should register a new plugin', () => {
    const plugin: Plugin = {
      name: 'TestPlugin',
      init: () => {}
    };
    manager.registerPlugin(plugin);
    const plugins = manager.getPlugins();
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('TestPlugin');
  });

  it('should not allow duplicate plugins', () => {
    const plugin: Plugin = {
      name: 'DuplicatePlugin',
      init: () => {}
    };
    manager.registerPlugin(plugin);
    expect(() => manager.registerPlugin(plugin)).toThrow(Error);
  });

  it('should unregister a plugin', () => {
    const plugin: Plugin = {
      name: 'PluginToRemove',
      init: () => {}
    };
    manager.registerPlugin(plugin);
    manager.unregisterPlugin('PluginToRemove');
    expect(manager.getPlugins().find(p => p.name === 'PluginToRemove')).toBeUndefined();
  });
});