# WebSocket/Streaming imports
import asyncio 
import json
import websockets
import numpy as np
import pandas as pd
from datetime import datetime

CHANNELS_LIST = ['Left', 'Right']
FEATURES_LIST_ORIG = [
    "total_power",
    "delta",
    "theta",
    "alpha",
    "beta",
    "beta_low",
    "beta_high",
    "gamma",
    "a_ta",
    "b_tb",
    "b_ab",
    "mab_tmab",
    "p_bad",
]

INCLUDE_TIME = True

if INCLUDE_TIME:
    CHANNELS_LIST += ['time']
    FEATURES_LIST = FEATURES_LIST_ORIG + ['']    # Time is not a multiindex

SMOOTHER_LIST = ['raw', 'raw_popnorm', 'smoothed']
CHANNEL_LIST_ML = ['ml', 'eevee_og']
FEATURES_LIST_ML = ['cogload', 'cogspeed', 'eevee_og']

clients = set()

async def handle_client(ws, path=None):
    """Handle new WebSocket client connection.
    
    Compatible with both old websockets versions (that pass path) and new versions (that don't).
    The path parameter is optional for compatibility across websockets library versions.
    """
    # Add client to set of clients
    try:
        client_addr = f"{ws.remote_address[0]}:{ws.remote_address[1]}"
    except AttributeError:
        # Fallback for different websockets versions
        client_addr = "unknown"
    
    clients.add(ws)
    print(f"✅ Client connected from {client_addr}. Total clients: {len(clients)}")

    # Handle client messages
    try:
        async for message in ws:  # producer sends data but we ignore input
            # Log any messages received from client (for debugging)
            if message:
                print(f"📨 Received message from {client_addr}: {message}")
    except websockets.exceptions.ConnectionClosed as e:
        print(f"⚠️  Client {client_addr} disconnected: {e}")
    except Exception as e:
        print(f"❌ Error handling client {client_addr}: {e}")
    finally:
        clients.discard(ws)
        print(f"👋 Client {client_addr} removed. Total clients: {len(clients)}")


async def broadcast_queue(queue):
    """Broadcast messages from queue to all connected clients."""
    # Broadcast queue to all clients
    while True:
        msg = await queue.get()
        if clients:
            # Create list of disconnected clients
            disconnected_clients = []
            for c in list(clients):  # Create a copy to iterate safely
                # Send message to client
                try:
                    await c.send(msg)
                # If client is disconnected, add to list of disconnected clients
                except (websockets.exceptions.ConnectionClosed, 
                        websockets.exceptions.ConnectionClosedOK, 
                        websockets.exceptions.ConnectionClosedError):
                    disconnected_clients.append(c)
                # If error occurs, add to list of disconnected clients
                except Exception as e:
                    print(f"Error sending to client: {e}")
                    disconnected_clients.append(c)
            
            # Remove disconnected clients
            for client in disconnected_clients:
                clients.discard(client)


def generate_synthetic_featurized_data():
    """Generate synthetic featurized data with the same structure as pipeline output."""
    
    # Create multi-index columns: (Channel, Feature)
    channels = ['eeg1', 'eeg2', 'eeg3', 'eeg4', 'eeg5', 'eeg6', 'eeg7', 'eeg8', 
                'eeg9', 'eeg10', 'eeg11', 'eeg12', 'meta', 'Left', 
                'Right', 'psd_left', 'psd_right', 'psd_lr', 'time']
    
    # Build column tuples for each channel
    column_data = {}
    for channel in channels:
        if channel == 'time':
            column_data[(channel, '')] = np.random.uniform(0, 1, 1)[0]
        elif channel in ['Left', 'Right']:
            for feature in FEATURES_LIST_ORIG:
                column_data[(channel, feature)] = np.random.uniform(0, 1, 1)[0]
        else:
            # For other channels, just use some random features
            for feature in FEATURES_LIST_ORIG:
                column_data[(channel, feature)] = np.random.uniform(0, 1, 1)[0]
    
    # Create DataFrame with MultiIndex columns
    columns = pd.MultiIndex.from_tuples(column_data.keys(), names=['Channel', 'Feature'])
    df_features = pd.DataFrame([column_data.values()], columns=columns)
    
    return df_features


def format_for_app(df_feats_chosen_flat):
    """
    Convert the multi-channel data format to the app's expected format.
    The app expects: { alpha, beta, theta, delta, gamma, timestamp }
    Values should be in Hz ranges:
    - alpha: 8-13 Hz
    - beta: 13-30 Hz
    - theta: 4-8 Hz
    - delta: 0.5-4 Hz
    - gamma: 30-100 Hz
    
    We average Left and Right channels, or use Left channel if Right is not available.
    Normalized values (0-1) are converted to Hz ranges.
    """
    # Extract normalized values from Left and Right channels (0-1 range)
    alpha_left = df_feats_chosen_flat.get('Left__alpha', 0.5)
    alpha_right = df_feats_chosen_flat.get('Right__alpha', None)
    alpha_norm = (alpha_left + alpha_right) / 2 if alpha_right is not None else alpha_left
    
    beta_left = df_feats_chosen_flat.get('Left__beta', 0.3)
    beta_right = df_feats_chosen_flat.get('Right__beta', None)
    beta_norm = (beta_left + beta_right) / 2 if beta_right is not None else beta_left
    
    theta_left = df_feats_chosen_flat.get('Left__theta', 0.2)
    theta_right = df_feats_chosen_flat.get('Right__theta', None)
    theta_norm = (theta_left + theta_right) / 2 if theta_right is not None else theta_left
    
    delta_left = df_feats_chosen_flat.get('Left__delta', 0.1)
    delta_right = df_feats_chosen_flat.get('Right__delta', None)
    delta_norm = (delta_left + delta_right) / 2 if delta_right is not None else delta_left
    
    gamma_left = df_feats_chosen_flat.get('Left__gamma', 0.15)
    gamma_right = df_feats_chosen_flat.get('Right__gamma', None)
    gamma_norm = (gamma_left + gamma_right) / 2 if gamma_right is not None else gamma_left
    
    # Convert normalized values (0-1) to Hz ranges matching the app's expected format
    # alpha: 8-13 Hz
    alpha = 8 + alpha_norm * 5
    
    # beta: 13-30 Hz
    beta = 13 + beta_norm * 17
    
    # theta: 4-8 Hz
    theta = 4 + theta_norm * 4
    
    # delta: 0.5-4 Hz
    delta = 0.5 + delta_norm * 3.5
    
    # gamma: 30-100 Hz
    gamma = 30 + gamma_norm * 70
    
    # Ensure values are within valid ranges
    alpha = max(8, min(13, float(alpha)))
    beta = max(13, min(30, float(beta)))
    theta = max(4, min(8, float(theta)))
    delta = max(0.5, min(4, float(delta)))
    gamma = max(30, min(100, float(gamma)))
    
    return {
        'alpha': round(alpha, 2),
        'beta': round(beta, 2),
        'theta': round(theta, 2),
        'delta': round(delta, 2),
        'gamma': round(gamma, 2),
        'timestamp': datetime.now().isoformat()
    }


async def producer(queue):
    """Produce data and broadcast to all clients."""
    # Produce data and broadcast to all clients
    while True:
        # Generate synthetic featurized data
        df_features = generate_synthetic_featurized_data()
        
        # Select channels and features
        idx = pd.IndexSlice
        df_feats_chosen = df_features.loc[:, idx[CHANNELS_LIST, FEATURES_LIST]]
        
        # Flatten multi-index columns
        df_feats_chosen_flat = df_feats_chosen.copy()
        df_feats_chosen_flat.columns = ['__'.join(col).strip('_') for col in df_feats_chosen.columns.values]
        # Special case for time column
        df_feats_chosen_flat = df_feats_chosen_flat.rename(columns={'time__': 'time'})

        # Convert to app's expected format
        app_data = format_for_app(df_feats_chosen_flat.iloc[-1].to_dict())
        
        # Convert to JSON
        msg = json.dumps(app_data)
        
        # Print message for debugging (only if clients are connected)
        if clients:
            print(f"📤 Sending data to {len(clients)} client(s): alpha={app_data['alpha']:.2f}Hz, beta={app_data['beta']:.2f}Hz")

        # Put message in queue
        await queue.put(msg)

        await asyncio.sleep(1)  # 1 Hz example (1 second interval)


async def main():
    """Main entry point for the WebSocket server."""
    # Initialize queue
    queue = asyncio.Queue()

    # Start WebSocket server
    host = "0.0.0.0"
    port = 8765
    print("=" * 60)
    print(f"🚀 Starting WebSocket server")
    print(f"📍 Listening on: ws://{host}:{port}")
    print(f"🌐 Local access: ws://localhost:{port}")
    print(f"📡 Network access: ws://<your-ip>:{port}")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        async with websockets.serve(handle_client, host, port):
            await asyncio.gather(
                broadcast_queue(queue),
                producer(queue),
            )
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Port {port} is already in use.")
            print(f"   Please stop the other service or change the port in emit_stream.py")
        else:
            print(f"❌ Error starting server: {e}")
        raise


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down WebSocket server...")
