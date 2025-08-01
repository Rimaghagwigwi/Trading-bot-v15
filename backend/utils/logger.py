"""
Logging utilities for the trading bot
"""

import logging
import sys
from datetime import datetime
import os

def setup_logger(name, level=logging.INFO, log_file=None):
    """Setup logger with basic configuration"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # File handler (optional)
    if log_file:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    return logger

def get_logger(name):
    """Get logger instance with default configuration"""
    return setup_logger(name)

def log_trade(logger, action, symbol, amount, price, reason=""):
    """Log trading action in standardized format"""
    logger.info(f"TRADE: {action} {amount} {symbol} @ {price} - {reason}")

def log_error(logger, error, context=""):
    """Log error with context information"""
    logger.error(f"ERROR: {error} - Context: {context}")

def log_performance(logger, metrics):
    """Log performance metrics"""
    logger.info(f"PERFORMANCE: {metrics}")