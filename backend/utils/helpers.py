"""
Helper utilities for the trading bot
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Union, List, Dict, Any, Optional
import json

def format_currency(amount: float, currency: str = 'USDT', decimals: int = 2) -> str:
    """Format currency amount with symbol"""
    return f"{amount:.{decimals}f} {currency}"

def format_percentage(value: float, decimals: int = 2) -> str:
    """Format percentage value"""
    return f"{value:.{decimals}f}%"

def calculate_percentage(value: float, total: float) -> float:
    """Calculate percentage with safe division"""
    if total == 0:
        return 0.0
    return (value / total) * 100

def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safe division to avoid division by zero"""
    try:
        return numerator / denominator if denominator != 0 else default
    except (TypeError, ValueError):
        return default

def get_default_date_range(days: int = 30) -> tuple:
    """Get default date range (start_date, end_date)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def timestamp_to_string(timestamp: Union[pd.Timestamp, datetime], format_str: str = '%Y-%m-%d %H:%M:%S') -> str:
    """Convert timestamp to string"""
    if isinstance(timestamp, pd.Timestamp):
        return timestamp.strftime(format_str)
    elif isinstance(timestamp, datetime):
        return timestamp.strftime(format_str)
    else:
        return str(timestamp)

def string_to_timestamp(date_string: str) -> pd.Timestamp:
    """Convert string to pandas timestamp"""
    return pd.Timestamp(date_string)

def calculate_returns(prices: List[float]) -> List[float]:
    """Calculate percentage returns from price series"""
    if len(prices) < 2:
        return []
    
    returns = []
    for i in range(1, len(prices)):
        if prices[i-1] != 0:
            ret = (prices[i] - prices[i-1]) / prices[i-1] * 100
            returns.append(ret)
        else:
            returns.append(0.0)
    
    return returns

def calculate_volatility(returns: List[float], periods: int = 252) -> float:
    """Calculate annualized volatility from returns"""
    if len(returns) < 2:
        return 0.0
    
    return np.std(returns) * np.sqrt(periods)

def calculate_sharpe_ratio(returns: List[float], risk_free_rate: float = 0.02, periods: int = 252) -> float:
    """Calculate Sharpe ratio"""
    if len(returns) < 2:
        return 0.0
    
    mean_return = np.mean(returns) * periods / 100  # Convert to annual
    volatility = calculate_volatility(returns, periods) / 100  # Convert to decimal
    
    if volatility == 0:
        return 0.0
    
    return (mean_return - risk_free_rate) / volatility

def calculate_max_drawdown(equity_curve: List[float]) -> float:
    """Calculate maximum drawdown from equity curve"""
    if len(equity_curve) < 2:
        return 0.0
    
    peak = equity_curve[0]
    max_dd = 0.0
    
    for value in equity_curve:
        if value > peak:
            peak = value
        
        drawdown = (peak - value) / peak * 100
        if drawdown > max_dd:
            max_dd = drawdown
    
    return max_dd

def round_to_precision(value: float, precision: int = 8) -> float:
    """Round value to specified precision"""
    return round(value, precision)

def truncate_to_precision(value: float, precision: int = 8) -> float:
    """Truncate value to specified precision"""
    multiplier = 10 ** precision
    return int(value * multiplier) / multiplier

def get_symbol_precision(symbol: str) -> Dict[str, int]:
    """Get default precision for symbol (price and quantity)"""
    # Default precisions for common symbols
    precisions = {
        'BTCUSDT': {'price': 2, 'quantity': 6},
        'ETHUSDT': {'price': 2, 'quantity': 5},
        'ADAUSDT': {'price': 4, 'quantity': 1},
        'BNBUSDT': {'price': 2, 'quantity': 3},
        'SOLUSDT': {'price': 2, 'quantity': 3},
        'XRPUSDT': {'price': 4, 'quantity': 1},
        'DOGEUSDT': {'price': 5, 'quantity': 0},
    }
    
    return precisions.get(symbol.upper(), {'price': 4, 'quantity': 3})

def format_trade_amount(amount: float, symbol: str) -> float:
    """Format trade amount according to symbol precision"""
    precision = get_symbol_precision(symbol)
    return round_to_precision(amount, precision['quantity'])

def format_price(price: float, symbol: str) -> float:
    """Format price according to symbol precision"""
    precision = get_symbol_precision(symbol)
    return round_to_precision(price, precision['price'])

def convert_timeframe_to_minutes(timeframe: str) -> int:
    """Convert timeframe string to minutes"""
    timeframe_map = {
        '1m': 1,
        '5m': 5,
        '15m': 15,
        '30m': 30,
        '1h': 60,
        '4h': 240,
        '1d': 1440,
        '1w': 10080,
        '1M': 43200,  # Approximate
    }
    
    return timeframe_map.get(timeframe, 60)  # Default to 1 hour

def serialize_for_json(obj: Any) -> Any:
    """Serialize object for JSON output"""
    if isinstance(obj, (pd.Timestamp, datetime)):
        return obj.isoformat()
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, pd.Series):
        return obj.tolist()
    else:
        return obj

def deep_serialize_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """Deep serialize dictionary for JSON"""
    result = {}
    for key, value in data.items():
        if isinstance(value, dict):
            result[key] = deep_serialize_dict(value)
        elif isinstance(value, list):
            result[key] = [serialize_for_json(item) for item in value]
        else:
            result[key] = serialize_for_json(value)
    
    return result

def load_config_file(file_path: str) -> Dict[str, Any]:
    """Load configuration from JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_config_file(data: Dict[str, Any], file_path: str) -> bool:
    """Save configuration to JSON file"""
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=serialize_for_json)
        return True
    except Exception:
        return False

def merge_dicts(dict1: Dict[str, Any], dict2: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two dictionaries, with dict2 taking precedence"""
    result = dict1.copy()
    result.update(dict2)
    return result

def get_nested_value(data: Dict[str, Any], key_path: str, default: Any = None) -> Any:
    """Get nested value from dictionary using dot notation"""
    keys = key_path.split('.')
    current = data
    
    try:
        for key in keys:
            current = current[key]
        return current
    except (KeyError, TypeError):
        return default

def set_nested_value(data: Dict[str, Any], key_path: str, value: Any) -> None:
    """Set nested value in dictionary using dot notation"""
    keys = key_path.split('.')
    current = data
    
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    
    current[keys[-1]] = value

def chunks(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split list into chunks of specified size"""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

def flatten_list(nested_list: List[List[Any]]) -> List[Any]:
    """Flatten nested list"""
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten_list(item))
        else:
            result.append(item)
    return result

def remove_duplicates(lst: List[Any], preserve_order: bool = True) -> List[Any]:
    """Remove duplicates from list"""
    if preserve_order:
        seen = set()
        result = []
        for item in lst:
            if item not in seen:
                seen.add(item)
                result.append(item)
        return result
    else:
        return list(set(lst))

def calculate_compound_return(returns: List[float]) -> float:
    """Calculate compound return from a series of returns"""
    if not returns:
        return 0.0
    
    compound = 1.0
    for ret in returns:
        compound *= (1 + ret / 100)
    
    return (compound - 1) * 100