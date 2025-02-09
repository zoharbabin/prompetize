import analyticsPlugin from './plugins/analytics_plugin.js';
import Chart from 'chart.js/auto';

class AnalyticsDashboard {
  constructor() {
    this.usageChart = null;
    this.successRateChart = null;
    this.currentDateRange = 'week';
    this.initializeEventListeners();
    this.initializeCharts();
    this.loadData();
  }

  initializeEventListeners() {
    // Date range selector
    document.getElementById('dateRange').addEventListener('change', (e) => {
      const dateRange = e?.target || document.getElementById('dateRange');
      this.currentDateRange = dateRange.value;
      const customRange = document.getElementById('customDateRange');
      customRange.style.display = dateRange.value === 'custom' ? 'block' : 'none';
      this.loadData();
    });

    // Custom date range inputs
    ['startDate', 'endDate'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        if (this.currentDateRange === 'custom') {
          this.loadData();
        }
      });
    });

    // Export buttons
    document.getElementById('exportCsvBtn').addEventListener('click', (e) => {
      e = e || { target: document.getElementById('exportCsvBtn') };
      this.exportData('csv');
    });
    document.getElementById('exportJsonBtn').addEventListener('click', (e) => {
      e = e || { target: document.getElementById('exportJsonBtn') };
      this.exportData('json');
    });
  }

  initializeCharts() {
    // Usage over time chart
    const usageCtx = document.getElementById('usageChart').getContext('2d');
    this.usageChart = new Chart(usageCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Daily Usage',
          data: [],
          borderColor: '#007bff',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });

    // Success rate chart
    const successCtx = document.getElementById('successRateChart').getContext('2d');
    this.successRateChart = new Chart(successCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Success Rate (%)',
          data: [],
          borderColor: '#28a745',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  getDateRange() {
    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    switch (this.currentDateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'custom':
        startDate = new Date(document.getElementById('startDate').value);
        endDate = new Date(document.getElementById('endDate').value);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }

  async loadData() {
    const { startDate, endDate } = this.getDateRange();
    const stats = analyticsPlugin.getStatsInRange(startDate, endDate);
    
    this.updateSummaryStats(stats);
    this.updateCharts(stats);
    this.updateUsageTable(stats);
  }

  updateSummaryStats(stats) {
    let totalUses = 0;
    let totalSuccess = 0;
    let mostUsedPrompt = { id: null, uses: 0 };
    
    Object.entries(stats).forEach(([promptId, promptStats]) => {
      totalUses += promptStats.totalUses;
      totalSuccess += (promptStats.successRate * promptStats.totalUses) / 100;
      
      if (promptStats.totalUses > mostUsedPrompt.uses) {
        mostUsedPrompt = { id: promptId, uses: promptStats.totalUses };
      }
    });

    const overallSuccessRate = totalUses ? (totalSuccess / totalUses) * 100 : 0;
    const daysInRange = this.getDaysInRange();
    const avgUsesPerDay = totalUses / daysInRange;

    document.getElementById('totalUsage').textContent = totalUses.toString();
    document.getElementById('overallSuccessRate').textContent = `${overallSuccessRate.toFixed(1)}%`;
    document.getElementById('mostUsedPrompt').textContent = mostUsedPrompt.id ? 
      `Prompt ${mostUsedPrompt.id} (${mostUsedPrompt.uses} uses)` : '-';
    document.getElementById('avgUsesPerDay').textContent = avgUsesPerDay.toFixed(1);
  }

  updateCharts(stats) {
    const timeData = this.aggregateTimeData(stats);
    
    // Update usage chart
    this.usageChart.data.labels = timeData.dates;
    this.usageChart.data.datasets[0].data = timeData.usageCounts;
    this.usageChart.update();

    // Update success rate chart
    this.successRateChart.data.labels = timeData.dates;
    this.successRateChart.data.datasets[0].data = timeData.successRates;
    this.successRateChart.update();
  }

  aggregateTimeData(stats) {
    const timeData = new Map();
    const { startDate, endDate } = this.getDateRange();
    
    // Initialize all dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timeData.set(dateStr, { uses: 0, successes: 0 });
    }

    // Aggregate data by date
    Object.values(stats).forEach(promptStats => {
      promptStats.usageHistory.forEach(usage => {
        const dateStr = usage.timestamp.split('T')[0];
        if (timeData.has(dateStr)) {
          const data = timeData.get(dateStr);
          data.uses++;
          if (usage.success) data.successes++;
        }
      });
    });

    // Convert to arrays for charts
    const dates = Array.from(timeData.keys());
    const usageCounts = dates.map(date => timeData.get(date).uses);
    const successRates = dates.map(date => {
      const data = timeData.get(date);
      return data.uses ? (data.successes / data.uses) * 100 : 0;
    });

    return { dates, usageCounts, successRates };
  }

  updateUsageTable(stats) {
    const tbody = document.getElementById('usageTableBody');
    tbody.innerHTML = '';

    Object.entries(stats)
      .sort(([, a], [, b]) => b.totalUses - a.totalUses)
      .forEach(([promptId, promptStats]) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = `Prompt ${promptId}`;
        row.insertCell(1).textContent = promptStats.totalUses.toString();
        row.insertCell(2).textContent = `${promptStats.successRate.toFixed(1)}%`;
        row.insertCell(3).textContent = new Date(promptStats.lastUsed).toLocaleString();
      });
  }

  getDaysInRange() {
    const { startDate, endDate } = this.getDateRange();
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  }

  exportData(format) {
    const data = analyticsPlugin.exportData();
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      this.downloadFile(blob, 'prompetize-analytics.json');
    } else if (format === 'csv') {
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      this.downloadFile(blob, 'prompetize-analytics.csv');
    }
  }

  convertToCSV(data) {
    const headers = ['promptId', 'totalUses', 'successRate', 'lastUsed'];
    const rows = [headers];

    Object.entries(data.stats).forEach(([promptId, stats]) => {
      rows.push([
        promptId,
        stats.totalUses,
        stats.successRate.toFixed(1),
        stats.lastUsed
      ]);
    });

    return rows.map(row => row.join(',')).join('\n');
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AnalyticsDashboard();
});

export default AnalyticsDashboard;
