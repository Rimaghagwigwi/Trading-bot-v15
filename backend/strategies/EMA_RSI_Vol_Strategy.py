"""
EMA Crossover + RSI + Volume Strategy
Optimized strategy for cryptocurrencies (BTC, ETH, XRP, DOGE, BNB)
on 30m, 1h, 4h timeframes
"""

import pandas as pd
import numpy as np
import logging

# Import technical indicators from our helpers
from backend.utils.helpers import calculate_rsi, calculate_ema, calculate_sma, calculate_atr, calculate_macd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EMACrossoverRSIVolumeStrategy():
    """
    Strategy combining EMA Crossover, RSI, and Volume analysis
    - Buy signal: Fast EMA > Slow EMA + RSI < 60 + High Volume
    - Sell signal: Fast EMA < Slow EMA + RSI > 40 + High Volume
    """

    parameters = [
        {'name': 'ema_fast', 'display_name': 'Fast EMA', 'default': 12},
        {'name': 'ema_slow', 'display_name': 'Slow EMA', 'default': 26},
        {'name': 'rsi_period', 'display_name': 'RSI Period', 'default': 14},
        {'name': 'rsi_buy_max', 'display_name': 'RSI Max for Buy', 'default': 68},
        {'name': 'rsi_sell_min', 'display_name': 'RSI Min for Sell', 'default': 32},
        {'name': 'volume_multiplier', 'display_name': 'Volume Multiplier', 'default': 1.3},
        {'name': 'volume_spike', 'display_name': 'Volume Spike Bull Market', 'default': 1.8},
        {'name': 'volume_period', 'display_name': 'Volume SMA Period', 'default': 20},
        {'name': 'momentum_threshold', 'display_name': 'Strong Momentum Threshold', 'default': 1.015},
        {'name': 'bull_trend_threshold', 'display_name': 'Bull Trend Threshold', 'default': 1.025},
    ]

    risk_parameters = [
        {'name': 'portion_buy', 'display_name': 'Buy Portion', 'default': 0.2},
        {'name': 'portion_sell', 'display_name': 'Sell Portion', 'default': 0.2},
        {'name': 'atr_period', 'display_name': 'ATR Period', 'default': 14},
        {'name': 'atr_sl_multiplier', 'display_name': 'ATR Stop Loss Multiplier', 'default': 2.5},
        {'name': 'atr_tp_multiplier', 'display_name': 'ATR Take Profit Multiplier', 'default': 4.0},
        {'name': 'atr_tp_bull_multiplier', 'display_name': 'ATR TP Bull Market Multiplier', 'default': 6.5},
        {'name': 'duration', 'display_name': 'Trade Duration (periods)', 'default': 12},
        {'name': 'duration_bull', 'display_name': 'Trade Duration Bull Market', 'default': 20},
    ]

    def __init__(self):
        self.name = 'ema_crossover_rsi_volume_strategy'

    def set_params(self, params):
        use_defaults = not all(k['name'] in params for k in self.parameters)
        if use_defaults:
            logger.info("Using default parameters for EMA+RSI+Volume strategy")
        self.params = {p['name']: p['default'] for p in self.parameters} if use_defaults else params

    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        """
        Generates trading signals based on EMA Crossover + RSI + Volume

        Args:
            market_data: DataFrame with columns 'close', 'volume', 'high', 'low' (required)

        Returns:
            DataFrame with trading signals
        """
        required_columns = ['close', 'volume', 'high', 'low']
        missing_columns = [col for col in required_columns if col not in market_data.columns]
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        signal_df = market_data.copy()
        signal_df['signal'] = None

        # Indicator calculations
        # EMAs
        signal_df['ema_fast'] = calculate_ema(signal_df['close'], self.params['ema_fast'])
        signal_df['ema_slow'] = calculate_ema(signal_df['close'], self.params['ema_slow'])

        # RSI
        signal_df['rsi'] = calculate_rsi(signal_df['close'], self.params['rsi_period'])

        # ATR for dynamic stop loss and take profit
        signal_df['atr'] = calculate_atr(signal_df['high'], signal_df['low'], 
                                        signal_df['close'], self.params['atr_period'])

        # Average volume
        signal_df['volume_sma'] = calculate_sma(signal_df['volume'], self.params['volume_period'])
        signal_df['volume_ratio'] = signal_df['volume'] / signal_df['volume_sma']

        # MACD for trend confirmation
        macd, macd_signal, macd_hist = calculate_macd(signal_df['close'])
        signal_df['macd'] = macd
        signal_df['macd_signal'] = macd_signal
        signal_df['macd_hist'] = macd_hist

        # Variables to avoid repetitive signals
        last_signal_type = None
        last_signal_index = -10

        # Signal generation
        for i in range(max(self.params['ema_slow'], self.params['volume_period'], self.params['atr_period']) + 1, len(signal_df)):
            current_price = signal_df['close'].iloc[i]
            prev_price = signal_df['close'].iloc[i-1]
            current_atr = signal_df['atr'].iloc[i]

            ema_fast_curr = signal_df['ema_fast'].iloc[i]
            ema_slow_curr = signal_df['ema_slow'].iloc[i]
            ema_fast_prev = signal_df['ema_fast'].iloc[i-1]
            ema_slow_prev = signal_df['ema_slow'].iloc[i-1]

            current_rsi = signal_df['rsi'].iloc[i]
            volume_ratio = signal_df['volume_ratio'].iloc[i]
            macd_hist_curr = signal_df['macd_hist'].iloc[i]

            # Bull market detection (relaxed conditions)
            ema_spread = (ema_fast_curr - ema_slow_curr) / ema_slow_curr
            bull_market_condition = (ema_spread > 0.008 and  # Fast EMA > Slow EMA by 0.8%
                                   current_rsi < 90)  # Less restrictive RSI

            # Strong momentum detection
            price_above_ema = (current_price - ema_slow_curr) / ema_slow_curr
            strong_momentum = (price_above_ema > 0.005)  # Price > Slow EMA by 0.5%

            # Adaptive volume conditions
            if bull_market_condition and strong_momentum:
                required_volume = self.params['volume_spike']  # Higher volume required
                rsi_buy_threshold = min(75, self.params['rsi_buy_max'] + 15)  # More permissive RSI
                rsi_sell_threshold = max(25, self.params['rsi_sell_min'] - 15)  # More restrictive RSI for sell
            else:
                required_volume = self.params['volume_multiplier']
                rsi_buy_threshold = self.params['rsi_buy_max']
                rsi_sell_threshold = self.params['rsi_sell_min']

            # Conditions for SELL signal
            ema_bearish_cross = (ema_fast_prev >= ema_slow_prev and ema_fast_curr < ema_slow_curr)
            ema_bearish_trend = ema_fast_curr < ema_slow_curr
            rsi_sell_condition = current_rsi > rsi_sell_threshold and current_rsi < 75
            macd_bearish = macd_hist_curr < 0
            price_decline = current_price < prev_price

            # Avoid signals too close together
            if i - last_signal_index < 3:
                continue

            # Conditions for BUY signal
            ema_bullish_cross = (ema_fast_prev <= ema_slow_prev and ema_fast_curr > ema_slow_curr)
            ema_bullish_trend = ema_fast_curr > ema_slow_curr
            rsi_buy_condition = current_rsi < rsi_buy_threshold and current_rsi > 25
            volume_condition = volume_ratio > required_volume
            macd_bullish = macd_hist_curr > 0
            price_momentum = current_price > prev_price

            # Buy signal: EMA crossover or confirmed bullish trend
            if ((ema_bullish_cross or (ema_bullish_trend and price_momentum)) and
                rsi_buy_condition and volume_condition and
                last_signal_type != 'buy'):

                # Adaptive take profit and duration based on market conditions
                if bull_market_condition and strong_momentum:
                    # Bull market: wider TP and longer duration
                    atr_take_profit = (current_atr * self.params['atr_tp_bull_multiplier']) / current_price
                    trade_duration = self.params['duration_bull']
                else:
                    # Normal market
                    atr_take_profit = (current_atr * self.params['atr_tp_multiplier']) / current_price
                    trade_duration = self.params['duration']

                # Standard stop loss in all cases
                atr_stop_loss = (current_atr * self.params['atr_sl_multiplier']) / current_price

                signal_df.at[signal_df.index[i], 'signal'] = {
                    'type': 'buy',
                    'params': {
                        'portion': self.params['portion_buy'],
                        'stop_loss': atr_stop_loss,
                        'take_profit': atr_take_profit,
                        'duration': trade_duration,
                        'close_anyway': False,
                        'bull_market': bool(bull_market_condition)  # Info for backtesting
                    },
                }
                last_signal_type = 'buy'
                last_signal_index = i

            # Sell signal: bearish EMA crossover or confirmed bearish trend
            elif ((ema_bearish_cross or (ema_bearish_trend and price_decline)) and
                  rsi_sell_condition and volume_condition and
                  last_signal_type != 'sell'):

                # Stop loss and take profit based on ATR
                atr_stop_loss = (current_atr * self.params['atr_sl_multiplier']) / current_price
                atr_take_profit = (current_atr * self.params['atr_tp_multiplier']) / current_price

                signal_df.at[signal_df.index[i], 'signal'] = {
                    'type': 'sell',
                    'params': {
                        'portion': self.params['portion_sell'],
                        'stop_loss': atr_stop_loss,
                        'take_profit': atr_take_profit,
                        'duration': self.params['duration'],
                        'close_anyway': False
                    },
                }
                last_signal_type = 'sell'
                last_signal_index = i

        # Cleanup and statistics
        signals_only = signal_df[signal_df['signal'].notnull()].drop(columns=[
            'ema_fast', 'ema_slow', 'rsi', 'atr', 'volume_sma', 'volume_ratio',
            'macd', 'macd_signal', 'macd_hist'
        ])

        buy_signals = len([s for s in signals_only['signal'] if s['type'] == 'buy'])
        sell_signals = len([s for s in signals_only['signal'] if s['type'] == 'sell'])
        bull_market_signals = len([s for s in signals_only['signal']
                                 if s['type'] == 'buy' and s.get('params', {}).get('bull_market', False)])

        logger.info(f"Signals generated - Total: {len(signals_only)}, Buys: {buy_signals}, Sells: {sell_signals}")
        logger.info(f"Bull market signals: {bull_market_signals} ({bull_market_signals/max(buy_signals,1)*100:.1f}% of buys)")

        return signals_only

    def get_strategy_info(self):
        """Returns strategy information"""
        return {
            'name': self.name,
            'description': 'EMA Crossover + RSI + Volume strategy optimized for cryptocurrencies',
            'timeframes': ['30m', '1h', '4h'],
            'recommended_assets': ['BTC', 'ETH', 'XRP', 'DOGE', 'BNB'],
            'key_features': [
                'Double confirmation EMA + RSI with bull market adaptation',
                'Dynamic volume filtering (1.5x normal, 2x bull market)',
                'Adaptive take profit: 3x ATR normal, 6x ATR in bull market',
                'Strong momentum detection to optimize uptrends',
                'Adaptive RSI based on market conditions',
                'Extended trade duration in bull market',
                'MACD for trend confirmation'
            ]
        }