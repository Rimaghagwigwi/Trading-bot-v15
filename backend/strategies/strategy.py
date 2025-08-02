"""
General strategy class
"""

from abc import ABC, abstractmethod
import pandas as pd
import numpy as np
import logging

# Import technical indicators from our helpers
from backend.utils.helpers import calculate_rsi, calculate_ema, calculate_sma, calculate_atr, calculate_macd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Strategy(ABC):
    """
    General strategy class
    """

    @abstractmethod
    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        """
        Generate trading signals based on market data

        Args:
            market_data: DataFrame with market data

        Returns:
            DataFrame with trading signals
        """
        pass

    parameters = [
        # {'name': 'param_name', 'display_name': 'Parameter Display Name', 'default': default_value}
    ]

    risk_parameters = [
        # {'name': 'risk_param_name', 'display_name': 'Risk Parameter Display Name', 'default': default_value}
    ]

    def __init__(self):
        self.name = 'example_strategy'

    def set_params(self, params):
        use_defaults = not all(k['name'] in params for k in self.parameters) or not all(k['name'] in params for k in self.risk_parameters)
        if use_defaults:
            logger.info("Using default parameters for example_strategy")
        self.params = {p['name']: p['default'] for p in self.parameters} if use_defaults else params
        
    def validate_params(self, params):
        """
        Validates strategy parameters

        Args:
            params: Dictionary of parameters to validate

        Returns:
            True if valid, raises ValueError otherwise
        """
        for param in self.parameters:
            if param['name'] not in params:
                raise ValueError(f"Missing required parameter: {param['name']}")
            if not isinstance(params[param['name']], (int, float)):
                raise ValueError(f"Invalid type for parameter {param['name']}: {type(params[param['name']])}")
        return True

    @abstractmethod
    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        """
        Generates trading signals based on EMA Crossover + RSI + Volume

        Args:
            market_data: DataFrame with columns 'close', 'volume', 'high', 'low' (required)

        Returns:
            DataFrame with trading signals
        """
        return pd.DataFrame(columns=['timestamp', 'signal'])

    @abstractmethod
    def get_strategy_info(self):
        """Returns strategy information"""
        return {
            'name': self.name,
            'description': '',
            'recommended_timeframes': [],
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