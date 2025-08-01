/**
 * ChartManager - Simple chart manager for trading bot
 * Simplified version without external dependencies
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the chart manager
     */
    init() {
        console.log('📊 ChartManager initialized (simplified version)');
        this.initialized = true;
    }

    /**
     * Creates a comparison chart showing portfolio vs benchmark
     */
    async createComparisonChart(graphID, display_name, graph_data) {
        console.log(`🔄 Creating comparison chart: ${graphID}`);

        const container = document.getElementById(graphID);
        if (!container) {
            console.error(`Chart container ${graphID} not found`);
            return;
        }

        // Clean container
        container.innerHTML = '';

        // Create chart content
        const chartContent = document.createElement('div');
        chartContent.className = 'chart-content';
        chartContent.innerHTML = `
            <div class="chart-header">
                <h3>${display_name}</h3>
            </div>
            <div class="chart-placeholder">
                <div class="chart-info">
                    <p><strong>Portfolio Performance Chart</strong></p>
                    <p>Data points: ${graph_data ? Object.keys(graph_data).length : 0}</p>
                    <p>📈 Chart visualization will be implemented with a charting library</p>
                    <p>For now, displaying raw data summary:</p>
                    ${this.formatChartData(graph_data)}
                </div>
            </div>
        `;
        
        container.appendChild(chartContent);
        
        console.log(`✅ Comparison chart ${graphID} created`);
        this.charts.set(graphID, { type: 'comparison', data: graph_data });
        return container;
    }

    /**
     * Creates a candlestick chart for market data
     */
    async createCandlestickChart(graphID, display_name, graph_data) {
        console.log(`🔄 Creating candlestick chart: ${graphID}`);
        
        // Create container if it doesn't exist
        let container = document.getElementById(graphID);
        if (!container) {
            container = document.createElement('div');
            container.className = 'chart';
            container.id = graphID;
            
            const chartsContainer = document.getElementById('backtest-charts-container');
            if (chartsContainer) {
                chartsContainer.appendChild(container);
            }
        }

        // Clean container
        container.innerHTML = '';

        // Create chart content
        const chartContent = document.createElement('div');
        chartContent.className = 'chart-content';
        chartContent.innerHTML = `
            <div class="chart-header">
                <h3>${display_name} Price Chart</h3>
            </div>
            <div class="chart-placeholder">
                <div class="chart-info">
                    <p><strong>Candlestick Chart</strong></p>
                    <p>Data points: ${graph_data ? graph_data.timestamps?.length || 0 : 0}</p>
                    <p>📊 Candlestick visualization will be implemented with a charting library</p>
                    ${this.formatMarketData(graph_data)}
                </div>
            </div>
        `;
        
        container.appendChild(chartContent);
        
        console.log(`✅ Candlestick chart ${graphID} created`);
        this.charts.set(graphID, { type: 'candlestick', data: graph_data });
        return container;
    }

    /**
     * Adds trading signals to an existing chart
     */
    addSignalsToChart(graphID, signals) {
        console.log(`🎯 Adding ${signals?.length || 0} signals to chart ${graphID}`);
        
        const chartData = this.charts.get(graphID);
        if (!chartData) {
            console.warn(`Chart ${graphID} not found`);
            return;
        }

        const container = document.getElementById(graphID);
        if (!container) return;

        // Add signals info to the chart
        const signalsDiv = document.createElement('div');
        signalsDiv.className = 'signals-info';
        signalsDiv.innerHTML = `
            <h4>Trading Signals</h4>
            <p>Total signals: ${signals.length}</p>
            <div class="signals-list">
                ${signals.slice(0, 5).map(signal => `
                    <div class="signal-item ${signal.type}">
                        <span class="signal-type">${signal.type.toUpperCase()}</span>
                        <span class="signal-time">${new Date(signal.timestamp).toLocaleString()}</span>
                        <span class="signal-price">$${signal.price ? signal.price.toFixed(2) : 'N/A'}</span>
                    </div>
                `).join('')}
                ${signals.length > 5 ? `<p>... and ${signals.length - 5} more signals</p>` : ''}
            </div>
        `;
        
        container.appendChild(signalsDiv);
    }

    /**
     * Format chart data for display
     */
    formatChartData(data) {
        if (!data) return '<p>No data available</p>';
        
        const summary = [];
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key]) && data[key].length > 0) {
                const values = data[key];
                const first = values[0];
                const last = values[values.length - 1];
                summary.push(`<p><strong>${key}:</strong> ${first} → ${last} (${values.length} points)</p>`);
            }
        });
        
        return summary.length > 0 ? summary.join('') : '<p>No chart data available</p>';
    }

    /**
     * Format market data for display
     */
    formatMarketData(data) {
        if (!data || !data.timestamps) return '<p>No market data available</p>';
        
        const { timestamps, open, high, low, close } = data;
        const count = timestamps.length;
        
        if (count === 0) return '<p>No market data available</p>';
        
        const firstPrice = open ? open[0] : 'N/A';
        const lastPrice = close ? close[close.length - 1] : 'N/A';
        const timeRange = `${timestamps[0]} → ${timestamps[count - 1]}`;
        
        return `
            <div class="market-summary">
                <p><strong>Time Range:</strong> ${timeRange}</p>
                <p><strong>Price Range:</strong> $${firstPrice} → $${lastPrice}</p>
                <p><strong>Data Points:</strong> ${count}</p>
            </div>
        `;
    }

    /**
     * Removes a chart
     */
    removeChart(graphID) {
        console.log(`🗑️ Removing chart: ${graphID}`);

        this.charts.delete(graphID);

        const container = document.getElementById(graphID);
        if (container) {
            container.innerHTML = '';
        }

        console.log(`✅ Chart ${graphID} removed`);
        return true;
    }

    /**
     * Clear all charts
     */
    clearAllCharts() {
        console.log('🧹 Clearing all charts');
        this.charts.clear();
        
        // Clear chart containers
        const chartContainers = document.querySelectorAll('.chart');
        chartContainers.forEach(container => {
            container.innerHTML = '';
        });
    }
}

// Initialize chart manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chartManager = new ChartManager();
        window.chartManager.init();
    });
} else {
    window.chartManager = new ChartManager();
    window.chartManager.init();
}
