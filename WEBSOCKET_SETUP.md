# WebSocket Streaming Service Setup

This document explains how to set up and run the WebSocket streaming service that provides synthetic EEG data to the Altrea application.

## Prerequisites

- Python 3.7 or higher
- pip3 (Python package manager)

## Quick Start

### Option 1: Using npm scripts (Recommended)

```bash
# Install Python dependencies
npm run ws:install

# Start the WebSocket server
npm run ws:start
```

### Option 2: Using shell scripts

**On macOS/Linux:**
```bash
./scripts/start-websocket.sh
```

**On Windows:**
```bash
scripts\start-websocket.bat
```

### Option 3: Manual setup

```bash
# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Run the server
python3 emit_stream.py
```

## Server Details

- **Host**: `0.0.0.0` (listens on all interfaces)
- **Port**: `8765`
- **WebSocket URL**: `ws://localhost:8765`
- **Data Rate**: 1 Hz (1 message per second)

## Connecting to the App

1. Start the WebSocket server using one of the methods above
2. Start the Next.js app:
   ```bash
   npm run dev
   ```
3. Navigate to the Configuration page in the app
4. Enter the WebSocket URL: `ws://localhost:8765`
5. Click "Save" and then "Test Connection"
6. The app will automatically connect and start receiving EEG data

## Data Format

The WebSocket server sends JSON messages with the following structure:

```json
{
  "alpha": 0.5,
  "beta": 0.3,
  "theta": 0.2,
  "delta": 0.1,
  "gamma": 0.15,
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

All values are normalized to the range [0, 1].

## Troubleshooting

### WebSocket Connection Error

If you see "WebSocket error: {}" in the browser console:

1. **Check if the server is running:**
   ```bash
   # Make sure you see output like:
   # 🚀 Starting WebSocket server
   # 📍 Listening on: ws://0.0.0.0:8765
   ```

2. **Verify the WebSocket URL format:**
   - ✅ Correct: `ws://localhost:8765`
   - ✅ Correct: `ws://127.0.0.1:8765`
   - ❌ Wrong: `http://localhost:8765` (missing `ws://`)
   - ❌ Wrong: `localhost:8765` (missing protocol)

3. **Check the browser console for detailed error messages:**
   - The improved error handling will now show the WebSocket URL and connection state
   - Look for messages like "Attempting to connect to WebSocket: ws://..."

4. **Test the connection manually:**
   ```bash
   # Using wscat (install with: npm install -g wscat)
   wscat -c ws://localhost:8765
   
   # Or using Python:
   python3 -c "import websockets, asyncio; asyncio.run(websockets.connect('ws://localhost:8765').__aenter__())"
   ```

5. **Check firewall/port access:**
   - Ensure port 8765 is not blocked
   - On macOS, check System Preferences > Security & Privacy > Firewall

### Port Already in Use

If port 8765 is already in use, you can modify the port in `emit_stream.py`:

```python
port = 8765  # Change this to an available port
```

Then update the WebSocket URL in the app configuration accordingly.

### Python Not Found

Make sure Python 3 is installed and accessible:
```bash
python3 --version
```

If `python3` is not found, try `python` instead and update the scripts accordingly.

### Dependencies Installation Fails

Try upgrading pip:
```bash
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### Data Format Issues

The WebSocket server now sends data in the correct Hz format:
- alpha: 8-13 Hz
- beta: 13-30 Hz
- theta: 4-8 Hz
- delta: 0.5-4 Hz
- gamma: 30-100 Hz

If you see parsing errors, check the browser console for the raw message format.

## Development

The WebSocket server generates synthetic EEG data for testing purposes. The data includes:
- Alpha, Beta, Theta, Delta, and Gamma wave values
- Timestamps for each reading
- Values are randomly generated but normalized to realistic ranges

To modify the data generation, edit the `generate_synthetic_featurized_data()` function in `emit_stream.py`.
