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

def validate_strategy_params(params: Dict[str, Any], required_params: List[str]) -> tuple:
    """Validate strategy parameters"""
    errors = []
    
    # Check required parameters
    for param in required_params:
        if param not in params:
            errors.append(f"Missing required parameter: {param}")
    
    # Validate common parameter types
    if 'initial_capital' in params:
        if not validate_amount(params['initial_capital']):
            errors.append("Invalid initial_capital: must be positive number")
    
    if 'commission_rate' in params:
        if not validate_percentage(params['commission_rate'] * 100):
            errors.append("Invalid commission_rate: must be between 0 and 1")
    
    if 'timeframe' in params:
        if not validate_timeframe(params['timeframe']):
            errors.append(f"Invalid timeframe: {params['timeframe']}")
    
    if 'symbols' in params:
        if isinstance(params['symbols'], list):
            for symbol in params['symbols']:
                if not validate_symbol(symbol):
                    errors.append(f"Invalid symbol: {symbol}")
        else:
            errors.append("symbols must be a list")
    
    return len(errors) == 0, errors

def validate_backtest_request(request_data: Dict[str, Any]) -> tuple:
    """Validate backtest request data"""
    errors = []
    
    required_fields = ['symbols', 'timeframe', 'strategy']
    
    # Check required fields
    for field in required_fields:
        if field not in request_data:
            errors.append(f"Missing required field: {field}")
    
    # Validate symbols
    if 'symbols' in request_data:
        symbols = request_data['symbols']
        if not isinstance(symbols, list) or len(symbols) == 0:
            errors.append("symbols must be a non-empty list")
        else:
            for symbol in symbols:
                if not validate_symbol(symbol):
                    errors.append(f"Invalid symbol: {symbol}")
    
    # Validate dates
    if 'start_date' in request_data:
        if not validate_date(request_data['start_date']):
            errors.append("Invalid start_date format")
    
    if 'end_date' in request_data:
        if not validate_date(request_data['end_date']):
            errors.append("Invalid end_date format")
    
    # Validate date range
    if 'start_date' in request_data and 'end_date' in request_data:
        try:
            start = pd.Timestamp(request_data['start_date'])
            end = pd.Timestamp(request_data['end_date'])
            if start >= end:
                errors.append("start_date must be before end_date")
        except:
            pass  # Already handled above
    
    # Validate timeframe
    if 'timeframe' in request_data:
        if not validate_timeframe(request_data['timeframe']):
            errors.append(f"Invalid timeframe: {request_data['timeframe']}")
    
    # Validate amounts
    if 'initial_capital' in request_data:
        if not validate_amount(request_data['initial_capital']):
            errors.append("Invalid initial_capital")
    
    if 'commission_rate' in request_data:
        if not validate_amount(request_data['commission_rate']):
            errors.append("Invalid commission_rate")
    
    return len(errors) == 0, errors

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

def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email or not isinstance(email, str):
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))