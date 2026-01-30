import type { Caregiver, AlertThresholds, UserRole, MoodSelection } from '@/types/eeg';

const STORAGE_KEYS = {
  CAREGIVERS: 'altrea_caregivers',
  ALERT_THRESHOLDS: 'altrea_alert_thresholds',
  ALERT_HISTORY: 'altrea_alert_history',
  WEBSOCKET_URL: 'altrea_websocket_url',
  USER_ROLE: 'altrea_user_role',
  ELDER_MOOD_SELECTION: 'altrea_elder_mood_selection',
  ELDER_MOOD_DATE: 'altrea_elder_mood_date',
  DEMO_MODE: 'altrea_demo_mode',
  SIMULATOR_EEG_READING: 'altrea_simulator_eeg_reading',
  CONNECTION_MODE: 'altrea_connection_mode', // 'localStorage' or 'streaming'
} as const;

const DEFAULT_THRESHOLDS: AlertThresholds = {
  stressLevel: 80,
  anxietyLevel: 70,
  calmLevel: 20,
};

// Caregivers Management
export const storageService = {
  // Get all caregivers
  getCaregivers(): Caregiver[] {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects if needed
      return parsed.map((c: Caregiver) => ({
        ...c,
        alertPreferences: c.alertPreferences || {
          critical: true,
          warning: true,
          info: false,
        },
      }));
    } catch (error) {
      console.error('Error reading caregivers from storage:', error);
      return [];
    }
  },

  // Save caregivers
  saveCaregivers(caregivers: Caregiver[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(caregivers));
    } catch (error) {
      console.error('Error saving caregivers to storage:', error);
      throw error;
    }
  },

  // Add a caregiver
  addCaregiver(caregiver: Omit<Caregiver, 'id'>): Caregiver {
    const caregivers = this.getCaregivers();
    const newCaregiver: Caregiver = {
      ...caregiver,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      alertPreferences: caregiver.alertPreferences || {
        critical: true,
        warning: true,
        info: false,
      },
    };
    caregivers.push(newCaregiver);
    this.saveCaregivers(caregivers);
    return newCaregiver;
  },

  // Update a caregiver
  updateCaregiver(id: string, updates: Partial<Caregiver>): Caregiver | null {
    const caregivers = this.getCaregivers();
    const index = caregivers.findIndex(c => c.id === id);
    if (index === -1) return null;

    caregivers[index] = { ...caregivers[index], ...updates };
    this.saveCaregivers(caregivers);
    return caregivers[index];
  },

  // Delete a caregiver
  deleteCaregiver(id: string): boolean {
    const caregivers = this.getCaregivers();
    const filtered = caregivers.filter(c => c.id !== id);
    if (filtered.length === caregivers.length) return false;

    this.saveCaregivers(filtered);
    return true;
  },

  // Get alert thresholds
  getAlertThresholds(): AlertThresholds {
    try {
      if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
      const stored = localStorage.getItem(STORAGE_KEYS.ALERT_THRESHOLDS);
      if (!stored) return DEFAULT_THRESHOLDS;
      return { ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error reading alert thresholds from storage:', error);
      return DEFAULT_THRESHOLDS;
    }
  },

  // Save alert thresholds
  saveAlertThresholds(thresholds: Partial<AlertThresholds>): void {
    try {
      if (typeof window === 'undefined') return;
      const current = this.getAlertThresholds();
      const updated = { ...current, ...thresholds };
      localStorage.setItem(STORAGE_KEYS.ALERT_THRESHOLDS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving alert thresholds to storage:', error);
      throw error;
    }
  },

  // Get alert history
  getAlertHistory() {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEYS.ALERT_HISTORY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading alert history from storage:', error);
      return [];
    }
  },

  // Save alert history
  saveAlertHistory(history: any[]): void {
    try {
      if (typeof window === 'undefined') return;
      // Keep only last 100 alerts
      const limited = history.slice(-100);
      localStorage.setItem(STORAGE_KEYS.ALERT_HISTORY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving alert history to storage:', error);
      throw error;
    }
  },

  // Get WebSocket URL
  getWebSocketUrl(): string | null {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(STORAGE_KEYS.WEBSOCKET_URL);
      return stored || null;
    } catch (error) {
      console.error('Error reading WebSocket URL from storage:', error);
      return null;
    }
  },

  // Save WebSocket URL
  saveWebSocketUrl(url: string | null): void {
    try {
      if (typeof window === 'undefined') return;
      if (url) {
        localStorage.setItem(STORAGE_KEYS.WEBSOCKET_URL, url);
      } else {
        localStorage.removeItem(STORAGE_KEYS.WEBSOCKET_URL);
      }
    } catch (error) {
      console.error('Error saving WebSocket URL to storage:', error);
      throw error;
    }
  },

  // Get user role
  getUserRole(): UserRole {
    try {
      if (typeof window === 'undefined') return 'caregiver';
      const stored = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      return (stored as UserRole) || 'caregiver';
    } catch (error) {
      console.error('Error reading user role from storage:', error);
      return 'caregiver';
    }
  },

  // Save user role
  saveUserRole(role: UserRole): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    } catch (error) {
      console.error('Error saving user role to storage:', error);
      throw error;
    }
  },

  // Get elder mood selection (for today)
  getElderMoodSelection(): MoodSelection {
    try {
      if (typeof window === 'undefined') return null;
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem(STORAGE_KEYS.ELDER_MOOD_DATE);
      
      // If mood was selected today, return it; otherwise return null
      if (storedDate === today) {
        const stored = localStorage.getItem(STORAGE_KEYS.ELDER_MOOD_SELECTION);
        return (stored as MoodSelection) || null;
      }
      return null;
    } catch (error) {
      console.error('Error reading elder mood selection from storage:', error);
      return null;
    }
  },

  // Save elder mood selection
  saveElderMoodSelection(mood: MoodSelection): void {
    try {
      if (typeof window === 'undefined') return;
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEYS.ELDER_MOOD_SELECTION, mood || '');
      localStorage.setItem(STORAGE_KEYS.ELDER_MOOD_DATE, today);
    } catch (error) {
      console.error('Error saving elder mood selection to storage:', error);
      throw error;
    }
  },

  // Get demo mode status
  getDemoMode(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const stored = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      return stored === 'true';
    } catch (error) {
      console.error('Error reading demo mode from storage:', error);
      return false;
    }
  },

  // Save demo mode status
  saveDemoMode(enabled: boolean): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
      
      // Also write to a JSON file that Python server can read
      // Since we can't write files directly from browser, we'll use a simple approach:
      // Create a script that watches localStorage or use an API endpoint
      // For now, we'll create the file via a Node.js helper script or API
      // This is a placeholder - will be implemented with backend API
      if (typeof window !== 'undefined' && (window as any).writeDemoModeFile) {
        (window as any).writeDemoModeFile(enabled);
      }
    } catch (error) {
      console.error('Error saving demo mode to storage:', error);
      throw error;
    }
  },

  // Save simulator EEG reading and emotional analysis to localStorage (for cross-tab communication)
  saveSimulatorReading(reading: any, analysis?: any): void {
    try {
      if (typeof window === 'undefined') return;
      // Preserve exact values - no transformation
      const readingData = {
        alpha: reading.alpha,
        beta: reading.beta,
        theta: reading.theta,
        delta: reading.delta,
        gamma: reading.gamma,
        timestamp: reading.timestamp ? reading.timestamp.toISOString() : new Date().toISOString(),
        _trigger: Date.now(), // Add trigger timestamp to force change detection
        // Include emotional analysis if provided
        analysis: analysis ? {
          state: analysis.state,
          confidence: analysis.confidence,
          stressLevel: analysis.stressLevel,
          anxietyLevel: analysis.anxietyLevel,
          calmLevel: analysis.calmLevel,
        } : undefined,
      };
      const jsonString = JSON.stringify(readingData);
      localStorage.setItem(STORAGE_KEYS.SIMULATOR_EEG_READING, jsonString);
      
      // Verify what was saved
      console.log('=== STORAGE: Saved to localStorage ===');
      console.log('JSON String:', jsonString);
      console.log('Reading Data:', readingData);
      if (analysis) {
        console.log('Emotional Analysis saved:', analysis);
      }
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.SIMULATOR_EEG_READING,
        newValue: jsonString,
        storageArea: localStorage,
      }));
    } catch (error) {
      console.error('Error saving simulator reading to storage:', error);
    }
  },

  // Get simulator EEG reading and emotional analysis from localStorage
  getSimulatorReading(): any | null {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(STORAGE_KEYS.SIMULATOR_EEG_READING);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      
      // Log what was retrieved
      console.log('=== STORAGE: Retrieved from localStorage ===');
      console.log('Raw stored string:', stored);
      console.log('Parsed data:', parsed);
      
      // Return exact values as stored - no transformation
      const result = {
        alpha: parsed.alpha,
        beta: parsed.beta,
        theta: parsed.theta,
        delta: parsed.delta,
        gamma: parsed.gamma,
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
        _trigger: parsed._trigger,
        // Include emotional analysis if available
        analysis: parsed.analysis ? {
          state: parsed.analysis.state,
          confidence: parsed.analysis.confidence,
          stressLevel: parsed.analysis.stressLevel,
          anxietyLevel: parsed.analysis.anxietyLevel,
          calmLevel: parsed.analysis.calmLevel,
        } : undefined,
      };
      
      console.log('Returned values:', {
        alpha: result.alpha,
        beta: result.beta,
        theta: result.theta,
        delta: result.delta,
        gamma: result.gamma,
      });
      
      if (result.analysis) {
        console.log('Emotional Analysis retrieved:', result.analysis);
      }
      
      return result;
    } catch (error) {
      console.error('Error reading simulator reading from storage:', error);
      return null;
    }
  },

  // Get connection mode (localStorage or streaming)
  getConnectionMode(): 'localStorage' | 'streaming' {
    try {
      if (typeof window === 'undefined') return 'localStorage';
      const stored = localStorage.getItem(STORAGE_KEYS.CONNECTION_MODE);
      if (!stored) return 'localStorage'; // Default to localStorage
      return stored === 'streaming' ? 'streaming' : 'localStorage';
    } catch (error) {
      console.error('Error reading connection mode from storage:', error);
      return 'localStorage';
    }
  },

  // Save connection mode
  saveConnectionMode(mode: 'localStorage' | 'streaming'): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.CONNECTION_MODE, mode);
    } catch (error) {
      console.error('Error saving connection mode to storage:', error);
      throw error;
    }
  },
};
