#!/bin/bash

# PhotoMint Watermarking Service Startup Script

echo "🛡️ Starting PhotoMint Watermarking Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=watermark_server.py
export FLASK_ENV=development

# Start the service
echo "🚀 Starting watermarking service on port 5000..."
python watermark_server.py

