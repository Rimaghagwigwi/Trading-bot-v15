/**
 * Backtest Interface Management
 * Handles configuration, execution, and display of backtest results
 */

class BacktestManager {
    constructor() {
        this.last_response = null;
        this.backtestHistory = [];
        this.charts = {};
        this.isRunning = false;
    }
    
    /**
     * Initialization of the backtest manager
     */
    async init() {

        console.log('🚀 Initializing BacktestManager...');
        try {
            // Initialize API client
            const response = await window.API.config.getConfig();
            console.log('Configuration fetched:', response.data);
            this.availableSymbols = response.data.symbols || [];
            this.availableTimeframes = response.data.timeframes || [];
            this.strategies = response.data.strategies || [];
        } catch (error) {
            console.error('❌ BacktestManager can\'t access configuration:', error);
            window.Utils.showError('❌ BacktestManager can\'t access configuration:');
            return;
        }
        
        // Fetch default configuration
        try {
            const config = await window.API.config.getDefaults();
            console.log('Default configuration fetched:', config);
            this.applyDefaultConfig(config.data);
        } catch (error) {
            window.Utils.showError('❌ Unable to fetch default configuration');
        }

        console.log('✅ BacktestManager initialized successfully');

        // Populate UI elements
        try {
            window.Utils.populateSymbolCheckboxes(this.availableSymbols, 'backtest-pairs');
        } catch (error) {
            window.Utils.showError('Unable to populate symbol checkboxes: ' + error.message);
        }

        try {
            window.Utils.populateTimeframeSelect(this.availableTimeframes, 'backtest-container');
        } catch (error) {
            window.Utils.showError('Unable to populate timeframe select: ' + error.message);
        }

        try {
            window.Utils.populateStrategySelect(this.strategies, 'backtest-container');
        } catch (error) {
            window.Utils.showError('Unable to populate strategy select: ' + error.message);
        }

        try {
            const strategy_name = document.getElementById('backtest-container').querySelector('#strategy').value;
            window.Utils.showInfo(`Selected strategy: ${strategy_name}`);
            const strategy = this.strategies.find(s => s.name === strategy_name);
            window.Utils.populateStrategyParams(strategy, 'backtest-container');
            window.Utils.showInfo(`Strategy: ${strategy}`);
        } catch (error) {
            window.Utils.showError('Unable to populate strategy parameters: ' + error.message);
        }
    }

    
    // Apply default configuration
    applyDefaultConfig(config) {
        if (!config) return;
        const timeframeSelect = document.getElementById('timeframe');   
        const strategySelect = document.getElementById('strategy');
        const initialCapitalInput = document.getElementById('initial-capital');
        const commissionInput = document.getElementById('commission');
        const startDate = document.querySelector('#start-date');
        const endDate = document.querySelector('#end-date');

        if (timeframeSelect && config.timeframe) {
            timeframeSelect.value = config.timeframe;
        }
        if (strategySelect && config.strategy) {
            strategySelect.value = config.strategy;
            this.populateStrategyParams(config.strategy);
        }
        if (initialCapitalInput && config.initial_capital) {
            initialCapitalInput.value = config.initial_capital;
        }
        if (commissionInput && config.commission_rate) {
            commissionInput.value = config.commission_rate * 100; // Convert to percentage
        }
        if (startDate && endDate && config.days) {
            const start = new Date();
            start.setDate(start.getDate() - config.days);
            const end = new Date();
            const startValue = start.toISOString().split('T')[0];
            const endValue = end.toISOString().split('T')[0];
            console.log(`Default dates applied: ${startValue} → ${endValue}`);
            startDate.value = startValue;
            endDate.value = endValue;
        }
    }

    // Get backtest configuration
    getBacktestConfig() {
        const symbols = Array.from(document.querySelectorAll('input[name="trading-pair"]:checked')).map(input => input.value);
        const timeframe = document.getElementById('timeframe').value;
        const strategy_name = document.getElementById('strategy').value;
        const strategy_params = this.getStrategyParams(strategy_name);
        const initial_capital = document.getElementById('initial-capital').value || 10000;
        const start_date = document.getElementById('start-date').value;
        const end_date = document.getElementById('end-date').value;
        const commission = parseFloat(document.getElementById('commission').value) || 0.1;

        const class_name = this.strategies.find(s => s.name === strategy_name)?.class;

        return {
            'symbols': symbols,
            'timeframe': timeframe,
            'strategy': strategy_name,
            'strategy_class': class_name,
            'strategy_params': strategy_params,
            'initial_capital': initial_capital,
            'start_date': new Date(start_date),
            'end_date': new Date(end_date),
            'commission_rate': commission / 100 // Convert to percentage
        };
    }

    getStrategyParams(strategy_name) {
        const strategy = this.strategies.find(s => s.name === strategy_name);
        console.log('Strategy found:', strategy);
        if (!strategy || !strategy.parameters) {
            console.warn('⚠️ No strategy or parameters found for:', strategy_name);
            return {};
        }
        const params = {};
        // Get parameter values
        Object.entries(strategy.parameters).forEach(([key, param]) => {
            const value = document.getElementById(key).value;
            params[key] = parseFloat(value) || param.default; // Use default if input is invalid
        });
        // Get risk parameters
        Object.entries(strategy.risk_parameters || {}).forEach(([key, param]) => {
            const value = document.getElementById(key).value;
            params[key] = parseFloat(value) || param.default; // Use default if input is invalid
        });

        return params;
    }

    // Start backtest
    startBacktest() {
        this.isRunning = true;
        console.log('✅ Starting backtest...');
        // Logic to start backtest
        const config = this.getBacktestConfig();
        if (!config.symbols || !config.timeframe || !config.strategy) {
            console.error('❌ Missing backtest configuration.');
            this.isRunning = false;
            return;
        }
        console.log('🔧 Backtest configuration:', config)
        window.API.backtest.run(config)
            .then(response => {
                if (!response.success) {
                    console.error('❌ Error in backtest response:', response);
                } else {
                    this.backtestHistory.push(response.data);
                    this.displayResults(response.data);
                }
                this.isRunning = false;
            })
            .catch(error => {
                console.error('❌ Error during backtest:', error);
                this.isRunning = false;
            });
    }

    // Start mock backtest (for testing)
    startMockBacktest() {
        this.isRunning = true;
        console.log('✅ Starting mock backtest...');
        
        const config = this.getBacktestConfig();
        if (!config.symbols || !config.timeframe || !config.strategy) {
            console.error('❌ Missing backtest configuration.');
            this.isRunning = false;
            return;
        }
        
        console.log('🔧 Mock backtest configuration:', config);
        
        // Call mock endpoint
        window.API.client.post('/api/mock-backtest', config)
            .then(response => {
                this.backtestHistory.push(response);
                this.displayResults(response);
                this.isRunning = false;
                window.Utils.showSuccess('Mock backtest completed successfully!');
            })
            .catch(error => {
                console.error('❌ Error during mock backtest:', error);
                window.Utils.showError('Mock backtest failed: ' + error.message);
                this.isRunning = false;
            });
    }

    /**
     * Display backtest results in the interface
     * @param {Object} data - API response data
     */
    displayResults(data) {
        console.log('📊 Displaying backtest results:', data);

        // Show results section
        const resultsSection = document.getElementById('backtest-results');
        resultsSection.style.display = 'block';

        // 1. Display performance metrics
        this.displayMetrics(data.metrics);

        // 2. Create chart
        this.displayChart(data.results, data.market_data);

        // 3. Add to backtest history
        this.addToBacktestHistory(data.parameters, data.results, data.metrics);

        // 4. Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // 5. Show success message
        window.Utils.showSuccess('Backtest completed successfully!');

    }

    /**
     * Display performance metrics
     * @param {Object} metrics - Calculated metrics
     */
    displayMetrics(metrics) {
        try {
            const grid = document.getElementById('metrics-cards-grid');
            if (!grid) return;

            grid.innerHTML = ''; // Reset content

            // Create metric cards
            const METRICS_CARDS = {
                'Return': [
                    { id: 'total-return', label: 'Total Return', value: metrics['return_metrics']['total_return_pct'].toFixed(2) + '%'},
                    { id: 'cagr', label: 'CAGR', value: metrics['return_metrics']['cagr_pct'].toFixed(2) + '%'}
                ],
                'Comparison with Buy and Hold': [
                    { id: 'benchmark-return', label: 'Benchmark Return', value: metrics['benchmark_metrics']['benchmark_return_pct'].toFixed(2) + '%'},
                    { id: 'outperformance', label: 'Outperformance', value: metrics['benchmark_metrics']['excess_return_pct'].toFixed(2) + '%'}
                ],
                'Risk': [
                    { id: 'sharpe-ratio', label: 'Sharpe Ratio', value: metrics['risk_metrics']['sharpe_ratio'].toFixed(2)},
                    { id: 'sortino-ratio', label: 'Sortino Ratio', value: metrics['risk_metrics']['sortino_ratio'].toFixed(2)},
                    { id: 'max-drawdown', label: 'Max Drawdown', value: metrics['drawdown_metrics']['max_drawdown_pct'].toFixed(2) + '%'},
                    { id: 'volatility', label: 'Volatility', value: metrics['risk_metrics']['volatility_pct'].toFixed(2) + '%'}
                ],
                'Trade': [
                    { id: 'total-trades', label: 'Total Trades', value: metrics['trade_metrics']['total_trades'].toFixed(0)},
                    { id: 'win-rate', label: 'Win Rate', value: metrics['trade_metrics']['win_rate_pct'].toFixed(2) + '%'},
                ]
            };
            
            // Function to determine color based on value
            function getColorClass(value, metricId) {
                // Thresholds for each metric
                const thresholds = {
                    'total-return': { win: 10, neutral: 0 },           // > 10% = win, 0-10% = neutral, < 0% = loss
                    'cagr': { win: 15, neutral: 0 },                   // > 15% = win
                    'benchmark-return': { win: 8, neutral: 0 },        // > 8% = win
                    'outperformance': { win: 5, neutral: 0 },          // > 5% = win
                    'sharpe-ratio': { win: 1.5, neutral: 1 },          // > 1.5 = win, 1-1.5 = neutral, < 1 = loss
                    'sortino-ratio': { win: 2, neutral: 1 },           // > 2 = win
                    'max-drawdown': { win: -5, neutral: -10 },         // > -5% = win, -5% to -10% = neutral, < -10% = loss
                    'volatility': { win: 15, neutral: 25 },            // < 15% = win, 15-25% = neutral, > 25% = loss
                    'win-rate': { win: 60, neutral: 50 },              // > 60% = win, 50-60% = neutral, < 50% = loss
                    'total-trades': { win: 1, neutral: 0 }             // > 1 = win, 0-1 = neutral, < 0 = loss
                };
                
                // Neutral metrics (no coloring)
                const neutralMetrics = [];

                if (neutralMetrics.includes(metricId)) {
                    return '';
                }
                
                const threshold = thresholds[metricId];
                if (!threshold) {
                    return ''; // No threshold defined
                }
                
                const numericValue = parseFloat(value.replace('%', ''));

                // Metrics where lower is better
                const lowerIsBetter = ['max-drawdown', 'volatility'];
                
                if (lowerIsBetter.includes(metricId)) {
                    if (numericValue <= threshold.win) return 'win-color';
                    if (numericValue <= threshold.neutral) return 'neutral-color';
                    return 'loss-color';
                } else {
                    if (numericValue >= threshold.win) return 'win-color';
                    if (numericValue >= threshold.neutral) return 'neutral-color';
                    return 'loss-color';
                }
            }


            //Create metric cards
            Object.entries(METRICS_CARDS).forEach(([categoryTitle, metrics]) => {
                const card = document.createElement('div');
                card.className = 'card';
                
                const header = document.createElement('div');
                header.className = 'card-header';
                header.textContent = categoryTitle;
                card.appendChild(header);
                
                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                metrics.forEach(metric => {
                    const metricElement = document.createElement('div');
                    metricElement.className = 'metric-item';
                    
                    const label = document.createElement('span');
                    label.className = 'metric-label';
                    label.textContent = metric.label;
                    
                    const value = document.createElement('span');
                    value.className = 'metric-value';
                    value.id = metric.id;
                    value.textContent = metric.value;
                    
                    metricElement.appendChild(label);
                    metricElement.appendChild(value);
                    cardBody.appendChild(metricElement);

                    // Apply color based on value
                    const colorClass = getColorClass(metric.value, metric.id);
                    if (colorClass) {
                        value.classList.add(colorClass);
                    }
                });

                card.appendChild(cardBody);
                grid.appendChild(card);
            });

        } catch (error) {
            console.error('Error displaying metrics:', error);
        }
    }

    displayChart(results, market_data) {
        const sectionID = document.getElementById('backtest-charts');
        sectionID.style.display = 'block';

        console.log(results)
        // Reset charts container
        const chartsContainer = document.getElementById('backtest-charts-container');
        chartsContainer.innerHTML = `<div class="chart" id="comparison-chart"></div>`;

        // Comparison chart
        chartManager.createComparisonChart('comparison-chart', 'Backtest Results', results.graph_data);

        // Chart for each crypto
        Object.entries(market_data).forEach(([symbol, data]) => {
            // results.trades_history = [{symbol: 'BTCUSDC', entry: 100, exit: 110, ...}, ...]
            chartManager.createCandlestickChart(`${symbol}-candle-chart`, `${symbol}`, data);
            chartManager.addSignalsToChart(`${symbol}-candle-chart`, results.trades_history.filter(trade => trade.symbol === symbol));
        });
    }

    /**
     * Add results to backtest history
     * @param {Object} results - Backtest results
     */
    addToBacktestHistory(params, results, metrics) {
        const historyTable = document.getElementById('backtest-history').getElementsByTagName('tbody')[0];
        const newRow = historyTable.insertRow(0); // Insert at first position

        // Format data
        const currentDate = new Date().toLocaleString('en-US');
        const period = `${params.start_date.split('T')[0]} → ${params.end_date.split('T')[0]}`;
        const returnValue = metrics.return_metrics.total_return_pct.toFixed(2);
        const sharpeValue = metrics.risk_metrics.sharpe_ratio?.toFixed(2) || 'N/A';

        // Create cells
        newRow.innerHTML = `
            <td>${currentDate}</td>
            <td>${params.symbols}</td>
            <td>${params.strategy}</td>
            <td>${period}</td>
            <td class="${returnValue >= 0 ? 'positive' : 'negative'}">${returnValue}%</td>
            <td class="${sharpeValue >= 1 ? 'positive' : sharpeValue >= 0 ? 'neutral' : 'negative'}">${sharpeValue}</td>
        `;

        // Limit history to 10 entries
        while (historyTable.rows.length > 10) {
            historyTable.deleteRow(historyTable.rows.length - 1);
        }
    }

    /**
     * Export results to CSV
     * @param {string} symbol - Crypto symbol
     * @param {string} strategy - Strategy name
     */
    exportResults(symbol, strategy) {
        try {
            // This function should be called with current results
            // For now, just show a message
            window.Utils.showSuccess(`Exporting results for ${symbol} - ${strategy} (to be implemented)`);
        } catch (error) {
            console.error('Error during export:', error);
            window.Utils.showError('Error exporting results');
        }
    }

    // Utility function to format percentages
    formatPercentage(value, decimals = 2) {
        return (value * 100).toFixed(decimals) + '%';
    }

    // Utility function to format currency
    formatCurrency(value, currency = 'USDT', decimals = 2) {
        return value.toFixed(decimals) + ' ' + currency;
    }
}

// Global instance
window.BacktestManager = new BacktestManager();

// Listener for backtest run button
document.getElementById('run-backtest').addEventListener('click', async () => {
    if (window.BacktestManager.isRunning) { 
        alert('A backtest is already running.');
        return;
    }   

    // Start backtest
    window.BacktestManager.startBacktest();
});

// Listener for mock backtest button
document.getElementById('run-mock-backtest').addEventListener('click', async () => {
    if (window.BacktestManager.isRunning) { 
        alert('A backtest is already running.');
        return;
    }   

    // Start mock backtest
    window.BacktestManager.startMockBacktest();
});