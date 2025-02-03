import React, { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoSync: boolean;
  syncInterval: number;
  githubToken?: string;
}

const defaultSettings: Settings = {
  theme: 'system',
  autoSync: true,
  syncInterval: 30,
};

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await Browser.storage.local.get('settings');
        if (result.settings) {
          setSettings(result.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Browser.storage.local.set({ settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Prompetize Settings
      </h1>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Appearance
          </h2>
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-300">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as Settings['theme'] })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Synchronization
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSync"
                checked={settings.autoSync}
                onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="autoSync" className="ml-2 text-gray-700 dark:text-gray-300">
                Enable automatic synchronization
              </label>
            </div>

            {settings.autoSync && (
              <div className="space-y-2">
                <label className="block text-gray-700 dark:text-gray-300">
                  Sync Interval (minutes)
                </label>
                <input
                  type="number"
                  value={settings.syncInterval}
                  onChange={(e) => setSettings({ ...settings, syncInterval: parseInt(e.target.value) })}
                  min="5"
                  max="120"
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-gray-300">GitHub Token</label>
              <input
                type="password"
                value={settings.githubToken || ''}
                onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                placeholder="Enter your GitHub token"
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Required for synchronizing your prompts with GitHub
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-4">
          {saved && (
            <span className="text-green-500 dark:text-green-400">Settings saved!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Options;