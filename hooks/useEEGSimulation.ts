// Re-export from context for backward compatibility
// The WebSocket connection is now managed globally via EEGContext
// This ensures a single persistent connection across all route changes
export { useEEGSimulation } from '@/contexts/EEGContext';
