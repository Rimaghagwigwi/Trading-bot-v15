# 🛠️ Setup Guide - Trading Bot v15

## ⚠️ **Current Issues Warning**

> **Important**: This project currently has several critical issues that prevent it from running out of the box. This guide provides workarounds to get you started.

## 🚨 **Quick Fix for Critical Issues**

### Step 1: Fix Dependencies

The `requirements.txt` file has installation issues. Use this workaround:

```bash
# DON'T run: pip install -r requirements.txt (it fails!)

# Instead, install manually:
pip install --user python-dotenv>=1.0.0
pip install --user flask==2.3.3
pip install --user flask-cors>=4.0.0
pip install --user requests>=2.31.0
pip install --user python-binance==1.0.19
pip install --user pandas>=2.1.1
pip install --user numpy==1.26.4

# Skip TA-Lib for now (causes timeout issues)
# We'll implement technical indicators manually
```

### Step 2: Create Missing Utils Modules

```bash
# Create the missing utils directory and files
mkdir -p backend/utils
touch backend/utils/__init__.py
```

Create `backend/utils/logger.py`:
```python
import logging
import sys
from datetime import datetime

def setup_logger(name, level=logging.INFO):
    """Setup logger with basic configuration"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger

def get_logger(name):
    """Get logger instance"""
    return setup_logger(name)
```

Create `backend/utils/validators.py`:
```python
import re
from datetime import datetime
import pandas as pd

def validate_symbol(symbol):
    """Validate trading symbol format"""
    if not symbol or not isinstance(symbol, str):
        return False
    # Basic validation for crypto pairs
    return bool(re.match(r'^[A-Z]{2,10}USDT?$|^[A-Z]{2,10}USDC$', symbol.upper()))

def validate_timeframe(timeframe):
    """Validate timeframe format"""
    valid_timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']
    return timeframe in valid_timeframes

def validate_date(date_str):
    """Validate date string"""
    try:
        pd.Timestamp(date_str)
        return True
    except:
        return False

def validate_amount(amount):
    """Validate trading amount"""
    try:
        float_amount = float(amount)
        return float_amount > 0
    except:
        return False
```

Create `backend/utils/helpers.py`:
```python
import pandas as pd
from datetime import datetime, timedelta

def format_currency(amount, currency='USDT'):
    """Format currency amount"""
    return f"{amount:.2f} {currency}"

def calculate_percentage(value, total):
    """Calculate percentage"""
    if total == 0:
        return 0
    return (value / total) * 100

def get_default_date_range(days=30):
    """Get default date range"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def safe_divide(numerator, denominator, default=0):
    """Safe division to avoid division by zero"""
    try:
        return numerator / denominator if denominator != 0 else default
    except:
        return default
```

### Step 3: Create Environment Configuration

Create `.env.example`:
```env
# Binance API Configuration
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET_KEY=your_binance_secret_key_here

# Application Configuration
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=INFO

# Flask Configuration
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# Trading Configuration
DEFAULT_INITIAL_CAPITAL=10000
DEFAULT_COMMISSION_RATE=0.001
DEFAULT_TIMEFRAME=1h
```

Copy to create your actual `.env` file:
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### Step 4: Update app.py to Load Environment

Add this to the top of `backend/app.py` (after imports):
```python
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
```

## 🚀 **Installation Steps**

### Prerequisites

- Python 3.8+ (tested with 3.12)
- Git
- A Binance account with API keys (for live trading)

### 1. Clone Repository

```bash
git clone https://github.com/Rimaghagwigwi/Trading-bot-v15.git
cd Trading-bot-v15
```

### 2. Set Up Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv trading-bot-env

# Activate it
# On Windows:
trading-bot-env\Scripts\activate
# On macOS/Linux:
source trading-bot-env/bin/activate
```

### 3. Install Dependencies (with fixes)

```bash
# Install dependencies manually (see Step 1 above)
# OR use this script:
bash scripts/install_deps.sh  # We'll create this
```

### 4. Apply Critical Fixes

```bash
# Run the setup script
python scripts/setup_fixes.py  # We'll create this
```

### 5. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env  # or use your favorite editor
```

### 6. Test Installation

```bash
# Test basic imports
python -c "from backend.app import create_app; print('✅ Backend imports OK')"

# Test Flask app creation
python -c "from backend.app import create_app; app = create_app(); print('✅ Flask app created OK')"
```

### 7. Run the Application

```bash
python run.py
```

If everything works, you should see:
```
🚀 Launching the Crypto Trading Bot...
📊 Backtest interface available at: http://localhost:5000
⚠️  Development mode - Local use only
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
```

## 🧪 **Testing the Setup**

### 1. Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Should return JSON with status: "healthy"
```

### 2. Test Frontend

Open browser and go to: `http://localhost:5000`

You should see the trading bot interface with two tabs:
- Backtest (should work)
- Live Trading (placeholder)

### 3. Test Backtest Functionality

1. Go to the Backtest tab
2. Select a trading pair (e.g., BTCUSDC)
3. Choose a strategy (e.g., Buy & Hold)
4. Set date range (last 30 days)
5. Click "Run Backtest"

If it works, you'll see charts and performance metrics.

## 🔧 **Troubleshooting**

### Common Issues

#### 1. "Module not found" errors
```bash
# Make sure you're in the right directory
pwd
# Should show: /path/to/Trading-bot-v15

# Make sure utils modules exist
ls backend/utils/
# Should show: __init__.py logger.py validators.py helpers.py
```

#### 2. "No module named flask"
```bash
# Check if dependencies are installed
python -c "import flask; print('Flask OK')"

# If not, install manually:
pip install --user flask flask-cors
```

#### 3. API connection errors
```bash
# Check if you can reach Binance API
python -c "import requests; r=requests.get('https://api.binance.com/api/v3/ping'); print('Binance API:', r.status_code)"
```

#### 4. Port already in use
```bash
# Kill process using port 5000
sudo lsof -t -i tcp:5000 | xargs kill -9

# Or use different port
export FLASK_PORT=5001
python run.py
```

### Getting Help

1. **Check logs**: Look at the console output for error messages
2. **Check issues**: See `ISSUES.md` for known problems
3. **Check TODO**: See `TODO.md` for missing features
4. **File an issue**: Create a GitHub issue with error details

## 📝 **Quick Setup Script**

Save this as `scripts/quick_setup.sh`:

```bash
#!/bin/bash
echo "🚀 Setting up Trading Bot v15..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install --user python-dotenv flask flask-cors requests python-binance pandas numpy

# Create utils modules
echo "🔧 Creating missing modules..."
mkdir -p backend/utils
touch backend/utils/__init__.py

# Create environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file - please edit with your API keys"
fi

echo "✅ Setup complete! Run 'python run.py' to start the bot"
```

Make it executable and run:
```bash
chmod +x scripts/quick_setup.sh
./scripts/quick_setup.sh
```

## 🎯 **Next Steps**

After getting the basic setup working:

1. **Add your Binance API keys** to `.env` file
2. **Test backtesting** with different strategies
3. **Check the TODO.md** for next features to implement
4. **Read ISSUES.md** for known problems and workarounds

## ⚠️ **Limitations**

Current setup limitations:

- ✅ Backtesting works
- ❌ Live trading not implemented
- ❌ No technical indicators (TA-Lib not installed)
- ❌ Limited error handling
- ❌ No tests
- ❌ Basic UI only

For a production-ready system, see the full roadmap in `TODO.md`.