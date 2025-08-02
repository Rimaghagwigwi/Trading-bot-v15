"""
Validation utilities for trading bot inputs
"""

import re
from datetime import datetime, timedelta
import pandas as pd
from typing import Union, List, Dict, Any

def validate_symbol(symbol: str) -> bool:
    """Validate trading symbol format"""
    if not symbol or not isinstance(symbol, str):
        return False
    
    # Basic validation for crypto pairs
    symbol = symbol.upper()
    valid_patterns = [
        r'^[A-Z]{2,10}USDT$',  # BTCUSDT, ETHUSDT, etc.
        r'^[A-Z]{2,10}USDC$',  # BTCUSDC, ETHUSDC, etc.
        r'^[A-Z]{2,10}BTC$',   # ETHBTC, etc.
        r'^[A-Z]{2,10}EUR$',   # BTCEUR, etc.
    ]
    
    return any(bool(re.match(pattern, symbol)) for pattern in valid_patterns)

def validate_timeframe(timeframe: str) -> bool:
    """Validate timeframe format"""
    valid_timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M']
    return timeframe in valid_timeframes

def validate_date(date_input: Union[str, datetime, pd.Timestamp]) -> bool:
    """Validate date input"""
    try:
        if isinstance(date_input, str):
            pd.Timestamp(date_input)
        elif isinstance(date_input, (datetime, pd.Timestamp)):
            return True
        else:
            return False
        return True
    except:
        return False

def validate_amount(amount: Union[str, int, float]) -> bool:
    """Validate trading amount"""
    try:
        float_amount = float(amount)
        return float_amount > 0
    except:
        return False

def validate_percentage(percentage: Union[str, int, float]) -> bool:
    """Validate percentage value (0-100)"""
    try:
        pct = float(percentage)
        return 0 <= pct <= 100
    except:
        return False

def sanitize_string(input_str: str, max_length: int = 100) -> str:
    """Sanitize string input"""
    if not isinstance(input_str, str):
        return ""
    
    # Remove dangerous characters
    sanitized = re.sub(r'[<>"\']', '', input_str)
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()

def validate_api_key(api_key: str) -> bool:
    """Validate API key format"""
    if not api_key or not isinstance(api_key, str):
        return False
    
    # Basic validation - check length and characters
    if len(api_key) < 32:
        return False
    
    # Should contain only alphanumeric characters
    return bool(re.match(r'^[A-Za-z0-9]+$', api_key))