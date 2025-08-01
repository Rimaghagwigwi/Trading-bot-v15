#!/bin/bash

echo "🚀 Trading Bot v15 - Quick Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check Python version
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>&1)
if [[ $? -eq 0 ]]; then
    print_status "Python found: $python_version"
else
    print_error "Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Install core dependencies (skip problematic ones)
echo ""
echo "📦 Installing core dependencies..."
pip install --user python-dotenv flask flask-cors requests python-binance pandas numpy

if [[ $? -eq 0 ]]; then
    print_status "Core dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check if utils directory exists
echo ""
echo "🔧 Checking utility modules..."
if [[ -d "backend/utils" && -f "backend/utils/logger.py" ]]; then
    print_status "Utility modules already exist"
else
    print_warning "Utility modules missing - they should have been created already"
fi

# Create environment file if it doesn't exist
echo ""
echo "⚙️  Setting up environment configuration..."
if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_status "Created .env file from template"
        print_warning "Please edit .env file with your Binance API keys before running the bot"
    else
        print_error ".env.example file not found"
    fi
else
    print_status ".env file already exists"
fi

# Test basic imports
echo ""
echo "🧪 Testing basic imports..."
python3 -c "
try:
    import flask
    import pandas as pd
    import numpy as np
    from backend.utils.logger import get_logger
    from backend.utils.validators import validate_symbol
    from backend.utils.helpers import format_currency
    print('✅ All imports successful')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
except Exception as e:
    print(f'❌ Error: {e}')
    exit(1)
"

if [[ $? -eq 0 ]]; then
    print_status "Import test passed"
else
    print_error "Import test failed"
    exit 1
fi

# Check if Flask app can be created
echo ""
echo "🌐 Testing Flask app creation..."
python3 -c "
try:
    from backend.app import create_app
    app = create_app()
    print('✅ Flask app created successfully')
except Exception as e:
    print(f'❌ Flask app creation failed: {e}')
    exit(1)
"

if [[ $? -eq 0 ]]; then
    print_status "Flask app test passed"
else
    print_error "Flask app test failed"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Binance API keys"
echo "2. Run: python run.py"
echo "3. Open: http://localhost:5000"
echo ""
echo "For help, see:"
echo "- README.md for overview"
echo "- SETUP.md for detailed setup instructions"
echo "- ISSUES.md for known problems"
echo "- TODO.md for planned features"