"""
RSI (Relative Strength Index) Strategy
"""

import pandas as pd
import numpy as np
import logging
from .strategy import Strategy

# Import technical indicators from our helpers
from backend.utils.helpers import calculate_rsi

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RSIStrategy(Strategy):
    """RSI Strategy - Buy on oversold, sell on overbought"""
    
    parameters = [
        {'name': 'rsi_period', 'display_name': 'RSI Period', 'default': 14},
        {'name': 'rsi_oversold', 'display_name': 'Oversold Threshold', 'default': 30},
        {'name': 'rsi_overbought', 'display_name': 'Overbought Threshold', 'default': 70},
    ]
    
    risk_parameters = [
        {'name': 'portion_buy', 'display_name': 'Buy Portion', 'default': 0.5},
        {'name': 'portion_sell', 'display_name': 'Sell Portion', 'default': 0.5},
        {'name': 'stop_loss', 'display_name': 'Stop Loss (fraction)', 'default': 0.05},
        {'name': 'duration', 'display_name': 'Trade Duration (periods)', 'default': 4},
    ]

    def __init__(self):
        self.name = 'rsi_strategy'

    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        """
        Generates trading signals based on RSI
        
        Args:
            market_data: DataFrame with 'close' column (required)
            
        Returns:
            DataFrame with trading signals
        """
        if 'close' not in market_data.columns:
            raise ValueError("Market data must contain a 'close' column")
            
        signal_df = market_data.copy()
        signal_df['signal'] = None
        
        # Calculate RSI using our helper function
        signal_df['rsi'] = calculate_rsi(signal_df['close'], period=self.params['rsi_period'])
        
        # Generate signals
        for i in range(1, len(signal_df)):
            current_rsi = signal_df['rsi'].iloc[i]

            # Buy signal: RSI is below the oversold threshold
            if current_rsi <= self.params['rsi_oversold']:
                signal_df.at[signal_df.index[i], 'signal'] = {
                    'type': 'buy',
                    'params': {
                        'portion': self.params['portion_buy'],
                        'stop_loss': self.params['stop_loss'],
                        'duration': self.params['duration'],
                        'close_anyway': False
                    },
                }
            
            # Sell signal: RSI is above the overbought threshold
            elif current_rsi >= self.params['rsi_overbought']:
                signal_df.at[signal_df.index[i], 'signal'] = {
                    'type': 'sell',
                    'params': {
                        'portion': self.params['portion_sell'],
                        'stop_loss': self.params['stop_loss'],
                        'duration': self.params['duration'],
                        'close_anyway': False
                    },
                }

        # Filter non-null signals
        signals_only = signal_df[signal_df['signal'].notnull()].drop(columns=['rsi'])
        logger.info(f"Total number of signals generated: {len(signals_only)}")
        
        return signals_only
    
    def get_strategy_info(self):
        """
        Returns strategy information
        
        Returns:
            Dictionary with strategy info
        """
        return {
            'name': self.name,
            'description': 'RSI Strategy - Buy on oversold, sell on overbought',
            'recommended_timeframes': ['1h', '4h', '1d'],
            'recommended_assets': ['BTC', 'ETH', 'XRP', 'DOGE', 'BNB'],
            'key_features': [
                'Uses RSI to identify overbought/oversold conditions',
                'Simple yet effective for trending markets',
                'Can be combined with other strategies for better results'
            ]
        }