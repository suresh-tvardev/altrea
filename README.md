# Altrea - EEG Monitoring Dashboard

A Next.js application for monitoring EEG data and emotional states with real-time WebSocket streaming support.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.7+ and pip3

## Quick Start

### 1. Install Dependencies

**Install Node.js dependencies:**
```bash
npm install
```

**Install Python dependencies:**
```bash
npm run ws:install
# or manually:
pip3 install -r requirements.txt
```

### 2. Start the WebSocket Server

The WebSocket server provides real-time EEG data streaming. You need to start it before running the app.

**Option A: Using npm script (Recommended)**
```bash
npm run ws:start
```

**Option B: Using shell script**
```bash
# macOS/Linux
./scripts/start-websocket.sh

# Windows
scripts\start-websocket.bat
```

**Option C: Manual start**
```bash
python3 emit_stream.py
```

You should see output like:
```
🚀 Starting WebSocket server
📍 Listening on: ws://0.0.0.0:8765
🌐 Local access: ws://localhost:8765
```

**Keep this terminal window open** - the WebSocket server needs to keep running.

### 3. Start the Next.js Application

Open a **new terminal window** and run:

```bash
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000)

### 4. Configure WebSocket Connection

1. Open the app in your browser: [http://localhost:3000](http://localhost:3000)
2. Navigate to the **Configuration** page (from the sidebar)
3. Enter the WebSocket URL: `ws://localhost:8765`
4. Click **"Save"** and then **"Test Connection"**
5. You should see a success message indicating the connection is established

The app will now receive real-time EEG data from the WebSocket server!

## Development Workflow

### Running Both Services Together

You'll need **two terminal windows**:

**Terminal 1 - WebSocket Server:**
```bash
npm run ws:start
```

**Terminal 2 - Next.js App:**
```bash
npm run dev
```

### Available Scripts

#### Next.js Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### WebSocket Scripts
- `npm run ws:install` - Install Python dependencies
- `npm run ws:start` - Start WebSocket server
- `npm run ws:dev` - Start WebSocket server (alias for ws:start)

## Project Structure

```
altrea/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── configuration/     # Configuration page
│   └── ...
├── components/            # React components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI components
├── hooks/                # React hooks
│   └── useEEGSimulation.ts  # EEG data hook with WebSocket support
├── services/             # Service modules
├── emit_stream.py        # WebSocket server (Python)
├── requirements.txt      # Python dependencies
└── scripts/              # Utility scripts
    ├── start-websocket.sh
    └── start-websocket.bat
```

## WebSocket Server Details

- **Host**: `0.0.0.0` (listens on all interfaces)
- **Port**: `8765`
- **Protocol**: WebSocket (ws://)
- **Data Rate**: 1 Hz (1 message per second)
- **Data Format**: JSON with EEG frequency bands (alpha, beta, theta, delta, gamma)

### Data Format

The WebSocket server sends JSON messages like:
```json
{
  "alpha": 10.5,
  "beta": 20.3,
  "theta": 6.2,
  "delta": 2.1,
  "gamma": 65.8,
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

Values are in Hz ranges:
- **alpha**: 8-13 Hz
- **beta**: 13-30 Hz
- **theta**: 4-8 Hz
- **delta**: 0.5-4 Hz
- **gamma**: 30-100 Hz

## Troubleshooting

### WebSocket Connection Issues

**Error: "WebSocket error: {}"**

1. **Check if the server is running:**
   ```bash
   # You should see the server output in Terminal 1
   ```

2. **Verify the URL format:**
   - ✅ Correct: `ws://localhost:8765`
   - ❌ Wrong: `http://localhost:8765` (missing `ws://`)

3. **Check browser console** for detailed error messages

4. **Test the connection manually:**
   ```bash
   # Using wscat (install with: npm install -g wscat)
   wscat -c ws://localhost:8765
   ```

### Port Already in Use

If port 8765 is already in use:

1. Change the port in `emit_stream.py`:
   ```python
   port = 8765  # Change to an available port
   ```

2. Update the WebSocket URL in the app configuration accordingly

### Python Not Found

Make sure Python 3 is installed:
```bash
python3 --version
```

If `python3` is not found, try `python` instead.

### Dependencies Installation Fails

**For Node.js:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**For Python:**
```bash
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

## Features

- 📊 Real-time EEG waveform visualization
- 🧠 Emotional state analysis and monitoring
- 🚨 Alert system with caregiver notifications
- 📈 Historical data tracking
- 💡 AI-powered insights and recommendations
- 🎵 Music recommendations based on emotional state
- 🧘 Breathing guidance and grounding support
- ⚙️ Configurable WebSocket connection

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **WebSocket**: Python websockets library
- **Data Processing**: NumPy, Pandas

## License

Private project
