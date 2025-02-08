import pluginManager from '../plugin_manager.js';

describe('PluginManager', () => {
  beforeEach(() => {
    // Clear plugins before each test
    pluginManager.plugins.clear();
  });

  test('registers a valid plugin correctly', () => {
    const validPlugin = {
      init: async () => {},
      version: '1.0.0'
    };
    
    pluginManager.registerPlugin('test-plugin', validPlugin);
    expect(pluginManager.getPlugin('test-plugin')).toBe(validPlugin);
  });

  test('throws error when registering invalid plugin', () => {
    const invalidPlugin = {
      version: '1.0.0'
      // Missing init method
    };
    
    expect(() => {
      pluginManager.registerPlugin('invalid-plugin', invalidPlugin);
    }).toThrow('Invalid plugin format');
  });

  test('lists all registered plugins', () => {
    const plugin1 = { init: async () => {}, version: '1.0.0' };
    const plugin2 = { init: async () => {}, version: '1.0.0' };
    
    pluginManager.registerPlugin('plugin1', plugin1);
    pluginManager.registerPlugin('plugin2', plugin2);
    
    const plugins = pluginManager.listPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins).toContain('plugin1');
    expect(plugins).toContain('plugin2');
  });

  test('initializes plugin correctly', async () => {
    const mockInit = jest.fn();
    const plugin = {
      init: mockInit,
      version: '1.0.0'
    };
    
    pluginManager.registerPlugin('test-plugin', plugin);
    await pluginManager.initializePlugin('test-plugin');
    
    expect(mockInit).toHaveBeenCalled();
  });

  test('throws error when initializing non-existent plugin', async () => {
    await expect(pluginManager.initializePlugin('non-existent'))
      .rejects
      .toThrow('Plugin non-existent not found');
  });

  test('initializes all plugins', async () => {
    const mockInit1 = jest.fn();
    const mockInit2 = jest.fn();
    
    const plugin1 = { init: mockInit1, version: '1.0.0' };
    const plugin2 = { init: mockInit2, version: '1.0.0' };
    
    pluginManager.registerPlugin('plugin1', plugin1);
    pluginManager.registerPlugin('plugin2', plugin2);
    
    await pluginManager.initializeAllPlugins();
    
    expect(mockInit1).toHaveBeenCalled();
    expect(mockInit2).toHaveBeenCalled();
  });
});
