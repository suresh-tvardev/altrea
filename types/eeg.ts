export type EmotionalState = 'calm' | 'neutral' | 'stressed' | 'anxious' | 'relaxed' | 'lonely' | 'fear' | 'fatigue';
export type InterventionType = 'mood-boost' | 'social-nudge' | 'breathing-guidance' | 'grounding-support' | 'rest-prompt';
export type UserRole = 'caregiver' | 'elder';
export type MoodSelection = 'good' | 'bad' | 'happy' | 'calm' | 'stressed' | 'lonely' | 'sad' | null;

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
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  recipients?: string[];
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  alertPreferences?: {
    critical: boolean;
    warning: boolean;
    info: boolean;
  };
}

export interface AlertThresholds {
  stressLevel: number;
  anxietyLevel: number;
  calmLevel: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'suggestion' | 'warning';
  timestamp: Date;
}

export interface HistoricalData {
  date: string;
  avgStress: number;
  avgAnxiety: number;
  avgCalm: number;
  dominantState: EmotionalState;
}

export interface RecommendedActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  icon: string;
  category: 'social' | 'wellness' | 'memory' | 'activity';
}

export interface MusicRecommendation {
  id: string;
  title: string;
  artist: string;
  emotionalTag: 'Uplifting' | 'Comforting' | 'Joyful' | 'Hopeful' | 'Calming';
  tagColor: string;
}

export interface Intervention {
  type: InterventionType;
  title: string;
  description: string;
  activities?: RecommendedActivity[];
  music?: MusicRecommendation[];
  breathingExercise?: {
    title: string;
    duration: number;
    steps: string[];
  };
  groundingContent?: {
    title: string;
    message: string;
  };
}
