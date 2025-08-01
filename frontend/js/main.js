class MainApp {
    constructor() {
        this.currentTab = 'backtest';
        this.isInitialized = false;
        this.connectionCheckInterval = null;
        this.timeUpdateInterval = null;
        
        // DOM element references
        this.tabs = {
            backtest: document.getElementById('backtest-tab'),
            liveTrading: document.getElementById('live-trading-tab')
        };
        
        this.tabContents = {
            backtest: document.getElementById('backtest-content'),
            liveTrading: document.getElementById('live-trading-content')
        };
        
        this.statusElements = {
            icon: document.getElementById('status-icon'),
            text: document.getElementById('status-text'),
            container: document.getElementById('connection-status')
        };
        
        this.timeElement = document.getElementById('current-time');
    }

    async init() {
        console.log('🚀 Initializing application...');
        
        try {
            window.Utils.initNotificationContainer();
            window.BacktestManager.init();

            // Initialize events
            this.setupEventListeners();
            
            // Initialize clock
            this.initClock();
            
            // Test backend connection
            await this.checkConnection();
            
            // Start intervals
            this.startIntervals();
            
            this.isInitialized = true;
            
            // Show welcome message
            window.Utils.showSuccess('Application initialized successfully', 5000);
            
        } catch (error) {
            window.Utils.showError('Error during application initialization', 5000);
        }
    }

    setupEventListeners() {
        const navLinks = document.querySelectorAll('[data-tab]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Update active links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        const activeLink = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeLink && !activeLink.classList.contains('dropdown-item')) {
            activeLink.classList.add('active');
        }

        this.currentTab = tabId;
    }

    initClock() {
        if (this.timeElement) {
            this.updateTime();
        }
    }

    updateTime() {
        if (this.timeElement) {
            const now = new Date();
            this.timeElement.textContent = now.toLocaleTimeString();
        }
    }

    async checkConnection() {
        // Implementation for backend connection check
        console.log('Checking backend connection...');
        // This would typically make an API call to test connection
    }

    startIntervals() {
        // Start time update interval
        if (this.timeElement) {
            this.timeUpdateInterval = setInterval(() => {
                this.updateTime();
            }, 1000);
        }

        // Start connection check interval
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, 30000); // Check every 30 seconds
    }

    stopIntervals() {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }

        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    destroy() {
        this.stopIntervals();
        this.isInitialized = false;
        console.log('Application destroyed');
    }
}

// Global dropdown toggle function (moved from HTML)
window.toggleDropdown = function(element) {
    const dropdown = element.parentElement;
    dropdown.classList.toggle('active');
};

// Global instance
window.MainApp = null;

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM loaded - Initializing...');
    
    try {
        // Create main instance
        window.MainApp = new MainApp();
        
        // Initialize application
        await window.MainApp.init();
        
    } catch (error) {
        console.error('❌ Fatal error during initialization:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fatal-error';
        errorDiv.innerHTML = `
            <h2>Initialization Error</h2>
            <p>A fatal error occurred while loading the application.</p>
            <p>Please check that the backend is running and reload the page.</p>
            <button onclick="location.reload()">Reload page</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('❌ Global JavaScript error:', event.error);
    window.Utils.showError('An unexpected error occurred. Please reload the page.');
    event.preventDefault();
    return true;
});