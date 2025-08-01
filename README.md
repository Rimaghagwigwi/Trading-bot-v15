# 🚀 Crypto Trading Bot v15

A comprehensive local crypto trading bot with backtesting and live trading capabilities.

![Status](https://img.shields.io/badge/Status-Backtest_Ready-green)
![Backend](https://img.shields.io/badge/Live_Trading-In_Development-yellow)

## ✨ Features

### 🟢 **Working Features**
- ✅ **Advanced Backtesting** - Test strategies on historical data
- ✅ **Multiple Strategies** - RSI, EMA Crossover, DCA, Buy & Hold
- ✅ **Interactive Web Interface** - Easy-to-use charts and controls
- ✅ **Binance Integration** - Real market data and execution
- ✅ **Performance Analytics** - Detailed profit/loss analysis
- ✅ **Local Data Storage** - No external dependencies

### 🟡 **In Development**
- 🚧 **Live Trading** - Real-time automated trading (coming soon)
- 🚧 **Advanced Risk Management** - Stop-loss, take-profit controls
- 🚧 **Real-time Monitoring** - Live portfolio tracking

## 🚀 Quick Start

### 1. Installation

```bash
# Download the project
git clone https://github.com/Rimaghagwigwi/Trading-bot-v15.git
cd Trading-bot-v15

# Install dependencies
pip install -r requirements.txt

# Set up environment (optional for backtesting)
cp .env.example .env
# Edit .env with your Binance API keys if needed
```

### 2. Run the Application

```bash
python run.py
```

Open your browser and go to: **http://localhost:5000**

### 3. Start Backtesting

1. **Select a trading pair** (e.g., BTCUSDT)
2. **Choose a strategy** (e.g., RSI Strategy) 
3. **Set date range** (e.g., last 30 days)
4. **Configure parameters** (initial capital, commission rate)
5. **Click "Run Backtest"**

## 📊 Available Strategies

### 1. **Buy & Hold**
- Simple buy and hold strategy
- Good benchmark for other strategies
- **Parameters**: Initial investment amount

### 2. **RSI Strategy** 
- Buy when oversold (RSI < 30)
- Sell when overbought (RSI > 70)
- **Parameters**: RSI period, buy/sell thresholds

### 3. **DCA (Dollar Cost Averaging)**
- Regular purchases regardless of price
- Reduces impact of volatility
- **Parameters**: Purchase frequency, amount

### 4. **EMA + RSI + Volume**
- Advanced multi-indicator strategy
- Combines trend, momentum, and volume
- **Parameters**: EMA periods, RSI levels, volume thresholds

## 🎯 Trading Pairs

Supported cryptocurrencies:
- **Bitcoin** (BTC/USDT, BTC/USDC)
- **Ethereum** (ETH/USDT, ETH/USDC)
- **Binance Coin** (BNB/USDT)
- **Solana** (SOL/USDT)
- **XRP** (XRP/USDT)
- **Cardano** (ADA/USDT)
- **Dogecoin** (DOGE/USDT)

## ⚙️ Configuration

### Basic Setup (Backtesting Only)
No API keys required - just run and start backtesting!

### Live Trading Setup (When Available)
1. Create a Binance account
2. Generate API keys (with trading permissions)
3. Add them to your `.env` file:
   ```
   BINANCE_API_KEY=your_api_key_here
   BINANCE_SECRET_KEY=your_secret_key_here
   ```

## 📈 Understanding Results

### Backtest Metrics
- **Total Return**: Overall profit/loss percentage
- **Sharpe Ratio**: Risk-adjusted returns
- **Max Drawdown**: Largest portfolio decline
- **Win Rate**: Percentage of profitable trades
- **Total Trades**: Number of buy/sell operations

### Charts
- **Price Chart**: Historical price with buy/sell signals
- **Portfolio Value**: Your portfolio growth over time
- **Trade History**: Individual trade performance

## 🔧 Technical Requirements

### TA-Lib Installation (Optional)
The bot includes custom technical indicators and works without TA-Lib. However, if you want to use the original TA-Lib library:

1. **Download the .whl file** for your system from:
   https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib

2. **Install it**:
   ```bash
   pip install TA_Lib-0.4.XX-cpXX-cpXXm-win_amd64.whl
   ```

**Note**: The system works perfectly without TA-Lib using our built-in indicators.

## ⚠️ Important Notes

### Risk Disclaimer
- **Backtesting** uses historical data and doesn't guarantee future results
- **Live trading** involves real money and significant risk
- **Start small** and test thoroughly before using large amounts
- **Cryptocurrency** markets are highly volatile and unpredictable

### Current Limitations
- Live trading is not yet implemented (coming soon)
- Limited to supported trading pairs
- Requires internet connection for market data

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
pip install -r requirements.txt
```

**"Port already in use"**
```bash
# Try different port
export FLASK_PORT=5001
python run.py
```

**Cannot connect to Binance**
- Check internet connection
- Verify API keys are correct
- Ensure API permissions include trading (for live trading)

**Charts not loading**
- Refresh the page
- Check browser console for errors
- Try different trading pair or date range

## 📞 Support

### Getting Help
1. **Check the web interface** - Most common issues are displayed there
2. **Review error messages** - They usually indicate the specific problem
3. **Try different parameters** - Some combinations may not have enough data
4. **Check your internet connection** - Required for fetching market data

### Advanced Support
For development questions, see `DEVELOPER.md`

---

## 🎉 Success Stories

Start with small backtests to understand how the strategies work:

1. **First Test**: Try "Buy & Hold" on BTC with $1,000 over 30 days
2. **Strategy Comparison**: Test RSI vs Buy & Hold on the same period
3. **Parameter Tuning**: Adjust RSI thresholds to see impact on results
4. **Multiple Assets**: Compare performance across different cryptocurrencies

---

**Ready to start?** Run `python run.py` and visit http://localhost:5000

*Happy Trading! 🚀*
