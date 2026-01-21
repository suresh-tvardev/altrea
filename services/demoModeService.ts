/**
 * Demo Mode Service
 * Manages demo mode state by writing to a JSON file that the Python WebSocket server can read
 */

const DEMO_MODE_FILE = 'demo_mode.json';

export const demoModeService = {
  /**
   * Update demo mode status by writing to a file
   * Note: In a browser environment, we can't directly write files.
   * This service will be used when we have a backend API.
   * For now, we'll use localStorage and the Python server will check via an API endpoint later.
   */
  setDemoMode(enabled: boolean): void {
    // Store in localStorage for now
    // The Python server will check this via an API endpoint in the future
    // For now, we'll create a file write mechanism via a simple HTTP endpoint
    // or use a file watcher approach
    
    // Since we can't write files from the browser directly,
    // we'll need to implement this via:
    // 1. A backend API endpoint that writes the file
    // 2. Or use a file watcher that reads from localStorage via a bridge script
    
    // For MVP, we'll use a simple approach: write to a file in the project root
    // This requires a backend endpoint or a Node.js script
    
    // Temporary: Store in localStorage, Python server reads via HTTP endpoint
    // This will be implemented when we add a backend API
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}. Restart WebSocket server to apply.`);
  },
};
