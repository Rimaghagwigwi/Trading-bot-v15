/**
 * API.js - Communication with Flask backend
 * Handles all interactions with REST endpoints
 */

class ApiClient {
    constructor(baseUrl = window.location.origin) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Initializes the API client (connection check)
     */
    async init() {
        console.log('🚀 Initializing API client...');
        
        const connectionTest = await this.testConnection();
        
        if (connectionTest.success) {
            console.log('✅ API connection established');
            return true;
        } else {
            console.error('❌ Unable to connect to backend');
            return false;
        }
    }

    /**
     * Generic method for HTTP requests
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: this.defaultHeaders,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Check if response is OK
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Generic HTTP methods
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ==========================================
    // BACKTEST ENDPOINTS
    // ==========================================

    /**
     * Gets the list of available strategies
     */
    async getStrategies() {
        return this.get('/api/strategies');
    }

    /**
     * Gets historical market data
     */
    async getMarketData(symbol, timeframe, startDate, endDate) {
        // Basic parameter validation
        if (!symbol) {
            throw new Error('Symbol is required');
        }
        if (!timeframe) {
            throw new Error('Timeframe is required');
        }

        const params = {
            symbol: window.Utils ? window.Utils.normalizeSymbol(symbol) : symbol.toUpperCase(),
            timeframe,
            start_date: startDate,
            end_date: endDate
        };

        return this.get('/api/market-data', params);
    }

    /**
     * Runs a backtest
     */
    async runBacktest(config) {
        // Config validation
        if (!this.validateBacktestConfig(config)) {
            throw new Error('Invalid backtest configuration');
        }

        // Normalize symbols if Utils is available
        if (window.Utils && window.Utils.normalizeSymbol) {
            config.symbols = config.symbols.map(window.Utils.normalizeSymbol);
        }

        return this.post('/api/backtest', config);
    }

    /**
     * Gets backtest history
     */
    async getBacktestHistory(limit = 50) {
        return this.get('/api/backtest/history', { limit });
    }

    /**
     * Gets details of a specific backtest
     */
    async getBacktestDetails(backtestId) {
        return this.get(`/api/backtest/${backtestId}`);
    }

    // ==========================================
    // SYSTEM ENDPOINTS
    // ==========================================

    /**
     * Checks system health
     */
    async getHealth() {
        return this.get('/health');
    }

    /**
     * Gets all possible configurations
     */
    async getConfig() {
        return this.get('/api/config');
    }

    /**
     * Gets default configuration parameters
     */
    async getDefaults() {
        return this.get('/api/config/defaults');
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Handles API errors with user messages
     */
    handleApiError(error, context = '') {
        const errorMessage = error.message || 'Unknown error';
        const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
        
        console.error('API Error:', fullMessage);
        
        // Show error to user
        if (Utils.showError) {
            Utils.showError(fullMessage);
        }
        
        return {
            success: false,
            error: fullMessage,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validates backtest configuration
     */
    validateBacktestConfig(config) {
        if (!config) return false;
        if (!config.symbols || !Array.isArray(config.symbols) || config.symbols.length === 0) return false;
        if (!config.strategy) return false;
        if (!config.timeframe) return false;
        return true;
    }

    /**
     * Wrapper for API calls with error handling
     */
    async safeApiCall(apiMethod, context = '', showLoading = true) {
        let notifID = null;
        try {
            if (showLoading && window.Utils && window.Utils.showLoading) {
                notifID = window.Utils.showLoading(`${context}...`);
            }

            const result = await apiMethod();

            if (notifID && window.Utils && window.Utils.hideNotification) {
                window.Utils.hideNotification(notifID);
            }
            
            return {
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            if (notifID && window.Utils && window.Utils.hideNotification) {
                window.Utils.hideNotification(notifID);
            }
            if (window.Utils && window.Utils.showError) {
                window.Utils.showError(`Error during ${context}: ${error.message}`);
            }
            
            return this.handleApiError(error, context);
        }
    }

    /**
     * Tests connection with backend
     */
    async testConnection() {
        return this.safeApiCall(
            () => this.getHealth(),
            'Connection test'
        );
    }
}

// ==========================================
// INSTANCES AND EXPORTS
// ==========================================

// Global instance of API client
const apiClient = new ApiClient();

// Export to global window object for use in other files
window.API = {
    client: apiClient,
    
    // Shortcut methods for common operations
    backtest: {
        getMarketData: (symbol, timeframe, startDate, endDate) => 
            apiClient.safeApiCall(() => apiClient.getMarketData(symbol, timeframe, startDate, endDate), 'Fetching market data'),
        run: (config) => apiClient.safeApiCall(() => apiClient.runBacktest(config), 'Running backtest'),
        getHistory: (limit) => apiClient.safeApiCall(() => apiClient.getBacktestHistory(limit), 'Fetching history'),
        getDetails: (id) => apiClient.safeApiCall(() => apiClient.getBacktestDetails(id), 'Fetching details')
    },
    
    live: {
        getStatus: () => apiClient.safeApiCall(() => apiClient.getLiveStatus(), 'Fetching status'),
        start: (config) => apiClient.safeApiCall(() => apiClient.startLiveTrading(config), 'Starting trading'),
        stop: () => apiClient.safeApiCall(() => apiClient.stopLiveTrading(), 'Stopping trading'),
        getPortfolio: () => apiClient.safeApiCall(() => apiClient.getPortfolio(), 'Fetching portfolio'),
        getTrades: (limit) => apiClient.safeApiCall(() => apiClient.getTradeHistory(limit), 'Fetching trades'),
        getLogs: (limit) => apiClient.safeApiCall(() => apiClient.getLiveLogs(limit), 'Fetching logs'),
        updateParameters: (params) => apiClient.safeApiCall(() => apiClient.updateLiveParameters(params), 'Updating trading parameters')
    },
    
    config: {
        getConfig: () => apiClient.safeApiCall(() => apiClient.getConfig(), 'Fetching configuration'),
        getDefaults: () => apiClient.safeApiCall(() => apiClient.getDefaults(), 'Fetching default configuration')
    },
    
    // Utility methods
    testConnection: () => apiClient.testConnection(),
    init: () => apiClient.init()
};