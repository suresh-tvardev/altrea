export type EmotionalState = 'calm' | 'neutral' | 'stressed' | 'anxious' | 'relaxed';

export interface EEGReading {
  timestamp: Date;
  alpha: number;
  beta: number;
  theta: number;
  delta: number;
  gamma: number;
}

export interface EmotionalAnalysis {
  state: EmotionalState;
  confidence: number;
  stressLevel: number;
  anxietyLevel: number;
  calmLevel: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface HistoricalData {
  date: string;
  avgStress: number;
  avgAnxiety: number;
  avgCalm: number;
  dominantState: EmotionalState;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'suggestion' | 'warning';
  timestamp: Date;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}
