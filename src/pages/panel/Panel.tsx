import React, { useState, useEffect } from 'react';
import Browser from 'webextension-polyfill';

interface LogEntry {
  timestamp: number;
  type: 'log' | 'error' | 'info';
  message: string;
  data?: any;
}

const Panel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'info'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Connect to the background script
    const port = Browser.runtime.connect({ name: 'panel' });

    // Listen for messages
    port.onMessage.addListener((message: LogEntry) => {
      setLogs(prev => [...prev, { ...message, timestamp: Date.now() }]);
    });

    return () => {
      port.disconnect();
    };
  }, []);

  // Filter and search logs
  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = search === '' || 
      JSON.stringify(log).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              <option value="all">All</option>
              <option value="log">Logs</option>
              <option value="error">Errors</option>
              <option value="info">Info</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex-1"
            />
          </div>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="p-4 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={log.timestamp + index}
              className={`p-3 rounded-md ${
                log.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  : log.type === 'info'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-75">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs font-medium uppercase">
                  {log.type}
                </span>
              </div>
              <div className="mt-1">
                <div className="font-medium">{log.message}</div>
                {log.data && (
                  <pre className="mt-2 text-sm overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Panel;