import type { Caregiver, AlertThresholds } from '@/types/eeg';

const STORAGE_KEYS = {
  CAREGIVERS: 'altrea_caregivers',
  ALERT_THRESHOLDS: 'altrea_alert_thresholds',
  ALERT_HISTORY: 'altrea_alert_history',
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
      // Keep only last 100 alerts
      const limited = history.slice(-100);
      localStorage.setItem(STORAGE_KEYS.ALERT_HISTORY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving alert history to storage:', error);
      throw error;
    }
  },
};
