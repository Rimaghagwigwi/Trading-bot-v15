class Utils {

    // ===========================================
    // NOTIFICATION METHODS
    // ===========================================

    static notificationContainer = null;
    static notificationCounter = 0;
    
    static initNotificationContainer() {
        if (!Utils.notificationContainer) {
            Utils.notificationContainer = document.createElement('div');
            Utils.notificationContainer.className = 'notification-container';
            document.body.appendChild(Utils.notificationContainer);
        }
    }
    
    static createNotification(message, type = 'info', duration = 3000) {
        Utils.initNotificationContainer();
        
        const notification = document.createElement('div');
        const notificationId = ++Utils.notificationCounter;
        
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.dataset.id = notificationId;
        
        // Add notification to container
        Utils.notificationContainer.appendChild(notification);
        
        // Entry animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-remove after specified duration
        if (duration > 0) {
            setTimeout(() => {
                Utils.hideNotification(notificationId);
            }, duration);
        }
        
        return notificationId;
    }
    
    static hideNotification(notificationId) {
        const notification = document.querySelector(`[data-id="${notificationId}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    static hideAllNotifications() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            Utils.hideNotification(parseInt(notification.dataset.id));
        });
    }
    
    static showError(message, duration = 10000) {
        console.error('❌ Error:', message);
        return Utils.createNotification(message, 'error', duration);
    }

    static showSuccess(message, duration = 3000) {
        console.log('✅ Success:', message);
        return Utils.createNotification(message, 'success', duration);
    }

    static showWarning(message, duration = 5000) {
        console.warn('⚠️ Warning:', message);
        return Utils.createNotification(message, 'warning', duration);
    }

    static showLoading(message, duration = 0) {
        return Utils.createNotification(message, 'loading', duration);
    }

    static showInfo(message, duration = 3000) {
        return Utils.createNotification(message, 'info', duration);
    }

    // ===========================================
    // FORMAT METHODS
    // ===========================================

    /**
     * Normalizes a crypto symbol (BTC/USDT -> BTCUSDT)
     * @param {string} symbol - Symbol to normalize
     * @returns {string}
     */
    static normalizeSymbol(symbol) {
        return symbol.replace('/', '').toUpperCase();
    }

    /**
     * Converts a normalized symbol to readable format (BTCUSDT -> BTC/USDT)
     * @param {string} symbol - Symbol to convert
     * @returns {string}
     */
    static formatSymbol(symbol) {
        const normalized = symbol.toUpperCase();
        if (normalized.endsWith('USDC')) {
            const base = normalized.slice(0, -4);
            return `${base}/USDC`;
        }
        if (normalized.endsWith('USDT')) {
            const base = normalized.slice(0, -4);
            return `${base}/USDT`;
        }
        return normalized;
    }

    static formatTimeframe(timeframe) {
        if (timeframe.endsWith('m')) {
            timeframe = timeframe.replace('m', ' minutes');
        } else if (timeframe.endsWith('h')) {
            timeframe = timeframe.replace('h', ' hours');
        } else if (timeframe.endsWith('d')) {
            timeframe = timeframe.replace('d', ' days');
        } else if (timeframe.endsWith('w')) {
            timeframe = timeframe.replace('w', ' weeks');
        } else if (timeframe.endsWith('M')) {
            timeframe = timeframe.replace('M', ' months');
        }
        return timeframe;
    }

    // ===========================================
    // PARAMETERS CREATION METHODS
    // ===========================================

    // Populate symbol selection
    static populateSymbolCheckboxes(symbols, containerId) {
        const grid = document.getElementById(containerId);
        if (!grid || !symbols) {
            showError('Invalid container or symbols list');
            return;
        }
        grid.innerHTML = '';

        symbols.forEach(symbol => {
            const pairItem = document.createElement('label');
            pairItem.className = 'checkbox';

            pairItem.innerHTML = `
                <label class="pair-checkbox">
                    <input type="checkbox" name="trading-pair" value="${symbol}">
                    <span class="checkbox-name">${Utils.formatSymbol(symbol)}</span>
                </label>
            `;
            
            grid.appendChild(pairItem);
        });
    }

    // Populate timeframe select
    static populateTimeframeSelect(timeframes, containerId) {
        const container = document.getElementById(containerId);
        const timeframeSelect = container.querySelector('#timeframe');
        if (!timeframeSelect || !timeframes) return;

        timeframeSelect.innerHTML = '';
        timeframes.forEach(timeframe => {
            const option = document.createElement('option');
            option.value = timeframe;
            option.textContent = window.Utils.formatTimeframe(timeframe);
            timeframeSelect.appendChild(option);
        });
    }

    // Populate strategy select
    static populateStrategySelect(strategies, containerId) {
        const container = document.getElementById(containerId);
        const strategySelect = container.querySelector('#strategy');
        if (!strategySelect || !strategies) return;

        strategySelect.innerHTML = '';
        strategies.forEach(strategy => {
            const option = document.createElement('option');
            option.value = strategy.name;
            option.textContent = strategy.display_name;
            strategySelect.appendChild(option);
        });

        // Add new event listener
        strategySelect.addEventListener('change', (event) => {
            const strategy_name = event.target.value;
            const selectedStrategy = strategies.find(s => s.name === strategy_name);
            this.populateStrategyParams(selectedStrategy, containerId);
        });
    }

    // Populate strategy parameter selects
    static populateStrategyParams(strategy, containerId) {
        const container = document.getElementById(containerId);
        if (!strategy) {
            window.Utils.showError('Invalid strategy');
            return;
        }

        const params = strategy ? strategy.parameters : null;
        const paramsContainer = container.querySelector('#strategy-parameters');
        console.log('Parameters fetched:', params);

        if (params && Object.keys(params).length > 0) {
            paramsContainer.style.display = 'grid';
            paramsContainer.innerHTML = `
                <h3>Strategy Parameters</h3>
            `;
    
            Object.entries(params).forEach(([key, value]) => {
                const paramItem = document.createElement('div');
                paramItem.className = 'form-group';
                paramItem.innerHTML = `
                    <label class="form-label" for="${key}">${value.display_name}</label>
                    <input class="form-input" type="number" id="${key}" value="${value.default}" step="any">
                `;
                paramsContainer.appendChild(paramItem);
            });
        } else {
            paramsContainer.style.display = 'none';
            paramsContainer.innerHTML = '';
        }

        const riskParamsContainer = container.querySelector('#risk-parameters');
        const risk_params = strategy ? strategy.risk_parameters : null;
        console.log('Risk parameters fetched:', risk_params);

        if (risk_params && Object.keys(risk_params).length > 0) {
            riskParamsContainer.style.display = 'grid';
            riskParamsContainer.innerHTML = `
                <h3>Risk Parameters</h3>
            `;

            Object.entries(risk_params).forEach(([key, value]) => {
                const paramItem = document.createElement('div');
                paramItem.className = 'form-group';
                paramItem.innerHTML = `
                    <label class="form-label" for="${key}">${value.display_name}</label>
                    <input class="form-input" type="number" id="${key}" value="${value.default}" step="any">
                `;
                riskParamsContainer.appendChild(paramItem);
            });
        } else {
            riskParamsContainer.style.display = 'none';
            riskParamsContainer.innerHTML = '';
        }
    }
    
    // Apply default configuration
    static applyDefaultConfig(strategies, config, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !config) {
            Utils.showError('Invalid container or configuration');
            return;
        }

        const timeframeSelect = container.querySelector('#timeframe');   
        const strategySelect = container.querySelector('#strategy');
        const initialCapitalInput = container.querySelector('#initial-capital');
        const commissionInput = container.querySelector('#commission');
        const startDate = container.querySelector('#start-date');
        const endDate = container.querySelector('#end-date');

        if (timeframeSelect && config.timeframe) {
            timeframeSelect.value = config.timeframe;
        }
        if (strategySelect && config.strategy_name) {
            strategySelect.value = config.strategy_name;
            const strategy = strategies.find(s => s.name === config.strategy_name);
            window.Utils.showInfo(`Default strategy applied: ${config.strategy_name}`);
            window.Utils.populateStrategyParams(strategy, containerId);
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
            window.Utils.showSuccess(`Default dates applied: ${startValue} → ${endValue}`);
            startDate.value = startValue;
            endDate.value = endValue;
        }
    }

    static getStrategyParams(strategies, strategy_name, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            window.Utils.showError('Invalid container with ID: ' + containerId);
            return {};
        }

        const strategy = strategies.find(s => s.name === strategy_name);
        if (!strategy || !strategy.parameters) {
            console.warn('⚠️ No strategy or parameters found for:', strategy_name);
            return {};
        } else {
            console.log('Strategy found:', strategy);
        }

        const params = {};
        // Get parameter values
        console.log('strategy parameters:', strategy.parameters);
        console.log('risk parameters:', strategy.risk_parameters);
        
        Object.entries(strategy.parameters).forEach(([key, param]) => {
            const value = container.querySelector(`#${key}`).value;
            params[key] = parseFloat(value) || param.default; // Use default if input is invalid
        });
        // Get risk parameters
        Object.entries(strategy.risk_parameters || {}).forEach(([key, param]) => {
            const value = container.querySelector(`#${key}`).value;
            params[key] = parseFloat(value) || param.default; // Use default if input is invalid
        });

        return params;
    }
}

window.Utils = Utils;