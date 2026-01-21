#!/bin/bash

# Script to start the WebSocket streaming service
# This script checks for Python dependencies and starts the WebSocket server

set -e

echo "🚀 Starting WebSocket Streaming Service..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip3 is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ Error: pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found in the project root."
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip3 install -q -r requirements.txt

# Check if emit_stream.py exists
if [ ! -f "emit_stream.py" ]; then
    echo "❌ Error: emit_stream.py not found in the project root."
    exit 1
fi

# Start the WebSocket server
echo "✅ Starting WebSocket server on ws://0.0.0.0:8765"
echo "   Press Ctrl+C to stop the server"
echo ""
python3 emit_stream.py
