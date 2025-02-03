import React, { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';

interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

const Popup: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const result = await Browser.storage.local.get('templates');
        setTemplates(result.templates || []);
      } catch (err) {
        setError('Failed to load templates');
        console.error('Error loading templates:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin-slow w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-[300px] h-[400px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-hidden">
      <header className="p-4 bg-blue-500 text-white">
        <h1 className="text-xl font-bold">Prompetize</h1>
      </header>

      <main className="p-4 overflow-y-auto">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No templates yet. Create your first template to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <h3 className="font-medium">{template.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {template.content}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <button
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => {
            Browser.runtime.sendMessage({ type: 'CREATE_TEMPLATE' });
          }}
        >
          Create Template
        </button>
      </footer>
    </div>
  );
};

export default Popup;