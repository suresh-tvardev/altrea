import type { EmotionalAnalysis, Alert, Caregiver } from '@/types/eeg';
import { storageService } from './storage';

interface AlertCheckResult {
  shouldAlert: boolean;
  alertType: 'critical' | 'warning' | 'info';
  message: string;
}

export const alertService = {
  /**
   * Check if current analysis should trigger an alert
   */
  checkThresholds(analysis: EmotionalAnalysis): AlertCheckResult | null {
    const thresholds = storageService.getAlertThresholds();
    
    // Critical: Very high stress
    if (analysis.stressLevel >= thresholds.stressLevel) {
      return {
        shouldAlert: true,
        alertType: 'critical',
        message: `Critical: Stress levels are unusually high (${Math.round(analysis.stressLevel)}%). Immediate attention recommended.`,
      };
    }

    // Warning: High anxiety
    if (analysis.anxietyLevel >= thresholds.anxietyLevel) {
      return {
        shouldAlert: true,
        alertType: 'warning',
        message: `Warning: Anxiety patterns are elevated (${Math.round(analysis.anxietyLevel)}%) beyond normal range.`,
      };
    }

    // Warning: Very low calm level
    if (analysis.calmLevel <= thresholds.calmLevel) {
      return {
        shouldAlert: true,
        alertType: 'warning',
        message: `Warning: Calm levels are unusually low (${Math.round(analysis.calmLevel)}%). Monitoring closely.`,
      };
    }

    // Info: Anxious state detected
    if (analysis.state === 'anxious' && analysis.confidence > 0.7) {
      return {
        shouldAlert: true,
        alertType: 'info',
        message: 'Info: Prolonged anxious state detected. Monitoring closely.',
      };
    }

    return null;
  },

  /**
   * Get caregivers who should receive this alert type
   */
  getRecipients(alertType: 'critical' | 'warning' | 'info'): Caregiver[] {
    const caregivers = storageService.getCaregivers();
    return caregivers.filter(caregiver => {
      const prefs = caregiver.alertPreferences || {
        critical: true,
        warning: true,
        info: false,
      };
      return prefs[alertType];
    });
  },

  /**
   * Create an alert with recipients
   */
  createAlert(
    alertType: 'critical' | 'warning' | 'info',
    message: string
  ): Alert {
    const recipients = this.getRecipients(alertType);
    const recipientIds = recipients.map(c => c.id);
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: alertType,
      message,
      timestamp: new Date(),
      acknowledged: false,
      recipients: recipientIds,
      alertLevel: alertType,
      sentTo: recipientIds.reduce((acc, id) => {
        acc[id] = new Date();
        return acc;
      }, {} as { [key: string]: Date }),
    };
  },

  /**
   * Check if we should send alert (prevent duplicates within time window)
   */
  shouldSendAlert(
    alertType: 'critical' | 'warning' | 'info',
    lastAlertTime?: Date
  ): boolean {
    if (!lastAlertTime) return true;

    const now = new Date();
    const timeSinceLastAlert = now.getTime() - lastAlertTime.getTime();
    
    // Prevent duplicate alerts within time windows
    const cooldownPeriods = {
      critical: 60000,   // 1 minute
      warning: 300000,   // 5 minutes
      info: 600000,      // 10 minutes
    };

    return timeSinceLastAlert > cooldownPeriods[alertType];
  },

  /**
   * Get recipient names for display
   */
  getRecipientNames(recipientIds: string[]): string[] {
    const caregivers = storageService.getCaregivers();
    return recipientIds
      .map(id => caregivers.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];
  },
};
