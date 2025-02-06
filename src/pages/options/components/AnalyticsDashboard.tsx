import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { calculateMetrics, exportAnalytics, PromptMetrics } from '../../../services/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TimeRange {
  start: number;
  end: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PromptMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const getTimeRange = (): TimeRange | undefined => {
    const now = Date.now();
    switch (timeRange) {
      case 'week':
        return {
          start: now - 7 * 24 * 60 * 60 * 1000,
          end: now,
        };
      case 'month':
        return {
          start: now - 30 * 24 * 60 * 60 * 1000,
          end: now,
        };
      case 'all':
        return undefined;
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const range = getTimeRange();
      const data = await calculateMetrics(range);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const data = await exportAnalytics(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompetize-analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    );
  }

  const usageData = {
    labels: metrics.mostUsedPrompts.map(p => p.promptId),
    datasets: [
      {
        label: 'Usage Count',
        data: metrics.mostUsedPrompts.map(p => p.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const modificationData = {
    labels: Object.keys(metrics.modificationFrequency),
    datasets: [
      {
        label: 'Modifications',
        data: Object.values(metrics.modificationFrequency),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
      },
    ],
  };

  const errorRateData = {
    labels: ['Successful', 'Errors'],
    datasets: [
      {
        data: [1 - metrics.errorRate, metrics.errorRate],
        backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(239, 68, 68, 0.5)'],
        borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selection */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded ${
              timeRange === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All Time
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Total Prompts
          </h3>
          <p className="text-3xl font-bold text-blue-500">{metrics.totalPrompts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Average Usage/Day
          </h3>
          <p className="text-3xl font-bold text-blue-500">
            {metrics.averageUsagePerDay.toFixed(1)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Sync Frequency/Day
          </h3>
          <p className="text-3xl font-bold text-blue-500">
            {metrics.syncFrequency.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Most Used Prompts
          </h3>
          <Bar
            data={usageData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Modification Frequency
          </h3>
          <Bar
            data={modificationData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Error Rate
        </h3>
        <div className="w-64 mx-auto">
          <Pie
            data={errorRateData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;