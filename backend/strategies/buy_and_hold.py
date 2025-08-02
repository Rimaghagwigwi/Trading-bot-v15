"""
Buy and Hold Strategy
"""

import pandas as pd
import logging
from .strategy import Strategy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BuyAndHoldStrategy(Strategy):
    """Buy and Hold Strategy - Buy at the beginning and hold until the end"""

    parameters = {}

    risk_parameters = [
        {'name': 'portion_buy', 'display_name': 'Buy Portion', 'default': 0.5},  # Buy 50% of available portion
        {'name': 'portion_sell', 'display_name': 'Sell Portion', 'default': 1.0},  # Sell 100% of the position
    ]

    def __init__(self):
        self.name = 'buy_and_hold'

    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        signal_df = market_data.copy()
        signal_df['signal'] = None

        # Buy signal at the first point
        signal_df.at[signal_df.index[0], 'signal'] = {
            'type': 'buy',
            'params': {
                'portion': self.params['portion_buy']
                },
        }
        
        # Sell signal at the last point
        signal_df.at[signal_df.index[-1], 'signal'] = {
            'type': 'sell',
            'params': {
                'portion': self.params['portion_sell']
                },
        }

        # Filter non-null signals
        signals_only = signal_df[signal_df['signal'].notnull()]

        return signals_only
    
    def get_strategy_info(self):
        """
        Returns strategy information
        
        Returns:
            Dictionary with strategy info
        """
        return {
            'name': self.name,
            'description': 'Buy and Hold Strategy - Buy at the beginning and hold until the end',
            'recommended_timeframes': ['1d', '1w', '1M'],
            'recommended_assets': ['BTC', 'ETH', 'XRP', 'DOGE', 'BNB'],
            'key_features': [
                'Simple and effective for long-term investors',
                'No need to time the market',
                'Reduces impact of volatility through regular purchases'
            ]
        }
