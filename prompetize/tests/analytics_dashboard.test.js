import { jest } from '@jest/globals';
import analyticsPlugin from '../plugins/analytics_plugin.js';
import AnalyticsDashboard from '../analytics_dashboard.js';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    data: {
      labels: [],
      datasets: [{
        data: []
      }]
    }
  }));
});

// Mock chrome API with all required functionality
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  windows: {
    create: jest.fn()
  },
  runtime: {
    getURL: jest.fn()
  }
};

// Mock DOM elements and functions
document.getElementById = jest.fn();
document.createElement = jest.fn();
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe('Analytics Dashboard', () => {
  let mockDateRange;
  let mockCustomRange;
  let mockTotalUsage;
  let mockSuccessRate;
  let mockMostUsedPrompt;
  let mockAvgUsesPerDay;
  let mockTableBody;
  let mockUsageChart;
  let mockSuccessRateChart;

  beforeEach(() => {
    jest.useFakeTimers();
    const mockDate = new Date('2025-02-09T00:00:00Z');
    jest.setSystemTime(mockDate);

    // Reset chrome mock implementations
    chrome.storage.local.get.mockReset();
    chrome.storage.local.set.mockReset();
    chrome.storage.local.get.mockResolvedValue({});

    // Mock DOM elements with event listeners
    const createMockElement = (initialProps = {}) => ({
      addEventListener: jest.fn((event, handler) => {
        createMockElement.handlers = createMockElement.handlers || {};
        createMockElement.handlers[event] = handler;
      }),
      ...initialProps
    });

    // Create mock elements
    mockDateRange = createMockElement({ value: 'week' });
    mockCustomRange = { style: { display: 'none' } };
    mockTotalUsage = { textContent: '' };
    mockSuccessRate = { textContent: '' };
    mockMostUsedPrompt = { textContent: '' };
    mockAvgUsesPerDay = { textContent: '' };
    mockTableBody = { innerHTML: '', insertRow: jest.fn() };
    mockUsageChart = { getContext: jest.fn() };
    mockSuccessRateChart = { getContext: jest.fn() };

    // Create mock elements for date inputs
    const startDateInput = createMockElement({ value: '2025-02-01' });
    const endDateInput = createMockElement({ value: '2025-02-09' });
    const exportJsonBtn = createMockElement();
    const exportCsvBtn = createMockElement();

    // Mock getElementById for all possible elements
    document.getElementById = jest.fn((id) => {
      const elements = {
        'dateRange': mockDateRange,
        'customDateRange': mockCustomRange,
        'totalUsage': mockTotalUsage,
        'overallSuccessRate': mockSuccessRate,
        'mostUsedPrompt': mockMostUsedPrompt,
        'avgUsesPerDay': mockAvgUsesPerDay,
        'usageTableBody': mockTableBody,
        'usageChart': mockUsageChart,
        'successRateChart': mockSuccessRateChart,
        'startDate': startDateInput,
        'endDate': endDateInput,
        'exportJsonBtn': exportJsonBtn,
        'exportCsvBtn': exportCsvBtn
      };
      return elements[id] || null;
    });

    // Mock table row and cells
    const mockRow = {
      insertCell: jest.fn().mockReturnValue({ textContent: '' })
    };
    mockTableBody.insertRow.mockReturnValue(mockRow);

    // Reset analytics plugin data
    analyticsPlugin.usageData.clear();
    analyticsPlugin.detailedMetrics.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Date Range Selection', () => {
    test('updates custom range visibility when date range changes', () => {
      // Create dashboard instance to register handlers
      new AnalyticsDashboard();
      
      // Get the registered change handler
      const changeHandler = mockDateRange.addEventListener.mock.calls[0][1];
      
      // Simulate date range change to custom
      mockDateRange.value = 'custom';
      changeHandler({ target: mockDateRange });
      expect(mockCustomRange.style.display).toBe('block');

      // Simulate date range change to week
      mockDateRange.value = 'week';
      changeHandler({ target: mockDateRange });
      expect(mockCustomRange.style.display).toBe('none');
    });
  });

  describe('Data Loading', () => {
    test('loads and displays correct statistics', async () => {
      // Add some test data
      await analyticsPlugin.init();
      analyticsPlugin.trackPromptUsage(1, true);
      analyticsPlugin.trackPromptUsage(1, true);
      analyticsPlugin.trackPromptUsage(2, false);

      // Create an instance of AnalyticsDashboard
      const dashboard = new AnalyticsDashboard();
      await dashboard.loadData();

      // Check summary stats
      expect(mockTotalUsage.textContent).toBe('3');
      expect(mockSuccessRate.textContent).toBe('66.7%');
      expect(mockMostUsedPrompt.textContent).toBe('Prompt 1 (2 uses)');
    });
  });

  describe('Export Functionality', () => {
    test('exports data in correct format', async () => {
      // Mock Blob and URL
      const mockBlob = function(content, options) {
        mockBlob.calls.push({ content, options });
        return { type: options.type };
      };
      mockBlob.calls = [];
      
      const mockURL = {
        createObjectURL: jest.fn().mockReturnValue('mock-url'),
        revokeObjectURL: jest.fn()
      };
      
      global.Blob = mockBlob;
      global.URL = mockURL;

      // Mock document.createElement for the download link
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      document.createElement.mockReturnValue(mockLink);

      await analyticsPlugin.init();
      analyticsPlugin.trackPromptUsage(1, true);
      
      // Create mock export buttons with event listeners
      const exportJsonBtn = { addEventListener: jest.fn() };
      const exportCsvBtn = { addEventListener: jest.fn() };
      
      // Create mock date inputs with event listeners
      const startDateInput = { addEventListener: jest.fn(), value: '2025-02-01' };
      const endDateInput = { addEventListener: jest.fn(), value: '2025-02-09' };

      // Update getElementById mock to include all necessary elements
      const elements = {
        'dateRange': mockDateRange,
        'customDateRange': mockCustomRange,
        'exportJsonBtn': exportJsonBtn,
        'exportCsvBtn': exportCsvBtn,
        'startDate': startDateInput,
        'endDate': endDateInput,
        'totalUsage': mockTotalUsage,
        'overallSuccessRate': mockSuccessRate,
        'mostUsedPrompt': mockMostUsedPrompt,
        'avgUsesPerDay': mockAvgUsesPerDay,
        'usageTableBody': mockTableBody,
        'usageChart': mockUsageChart,
        'successRateChart': mockSuccessRateChart
      };
      
      document.getElementById.mockImplementation(id => elements[id] || null);

      // Create dashboard instance to register handlers
      const dashboard = new AnalyticsDashboard();

      // Get the export handlers that were registered
      const jsonHandler = exportJsonBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1];
      const csvHandler = exportCsvBtn.addEventListener.mock.calls.find(call => call[0] === 'click')[1];

      // Trigger export handlers with mock events
      jsonHandler({ target: exportJsonBtn });
      csvHandler({ target: exportCsvBtn });

      // Verify JSON export
      expect(mockBlob.calls[0].options.type).toBe('application/json');
      expect(JSON.parse(mockBlob.calls[0].content[0])).toHaveProperty('version');
      expect(JSON.parse(mockBlob.calls[0].content[0])).toHaveProperty('stats');

      // Verify CSV export
      expect(mockBlob.calls[1].options.type).toBe('text/csv');
      expect(mockBlob.calls[1].content[0]).toContain('promptId,totalUses,successRate,lastUsed');
    });
  });

  describe('Chart Updates', () => {
    test('updates charts with correct data', async () => {
      await analyticsPlugin.init();
      
      // Add test data across different dates
      jest.setSystemTime(new Date('2025-02-08T00:00:00Z'));
      analyticsPlugin.trackPromptUsage(1, true);
      
      jest.setSystemTime(new Date('2025-02-09T00:00:00Z'));
      analyticsPlugin.trackPromptUsage(1, false);

      // Mock canvas context
      const mockContext = { canvas: {} };
      mockUsageChart.getContext.mockReturnValue(mockContext);
      mockSuccessRateChart.getContext.mockReturnValue(mockContext);

      // Create dashboard instance and initialize charts
      const dashboard = new AnalyticsDashboard();
      await dashboard.loadData();

      // Verify chart initialization
      expect(mockUsageChart.getContext).toHaveBeenCalledWith('2d');
      expect(mockSuccessRateChart.getContext).toHaveBeenCalledWith('2d');
    });
  });
});
