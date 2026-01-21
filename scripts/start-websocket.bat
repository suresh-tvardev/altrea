@echo off
REM Script to start the WebSocket streaming service on Windows
REM This script checks for Python dependencies and starts the WebSocket server

echo 🚀 Starting WebSocket Streaming Service...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed. Please install Python 3 first.
    exit /b 1
)

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ Error: requirements.txt not found in the project root.
    exit /b 1
)

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Check if emit_stream.py exists
if not exist "emit_stream.py" (
    echo ❌ Error: emit_stream.py not found in the project root.
    exit /b 1
)

REM Start the WebSocket server
echo ✅ Starting WebSocket server on ws://0.0.0.0:8765
echo    Press Ctrl+C to stop the server
echo.
python emit_stream.py
