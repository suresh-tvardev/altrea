import { useState, useEffect, useCallback } from 'react';
import type { EEGReading, EmotionalAnalysis, EmotionalState, Alert, HistoricalData, Insight } from '@/types/eeg';

const generateEEGReading = (): EEGReading => ({
  timestamp: new Date(),
  alpha: 8 + Math.random() * 5,
  beta: 13 + Math.random() * 17,
  theta: 4 + Math.random() * 4,
  delta: 0.5 + Math.random() * 3.5,
  gamma: 30 + Math.random() * 70,
});

const analyzeEmotionalState = (readings: EEGReading[]): EmotionalAnalysis => {
  if (readings.length === 0) {
    return { state: 'neutral', confidence: 0.5, stressLevel: 30, anxietyLevel: 20, calmLevel: 50 };
  }

  const latest = readings[readings.length - 1];
  const alphaRatio = latest.alpha / (latest.beta + 1);
  const thetaRatio = latest.theta / (latest.alpha + 1);

  let state: EmotionalState = 'neutral';
  let stressLevel = 30 + Math.random() * 20;
  let anxietyLevel = 20 + Math.random() * 15;
  let calmLevel = 50 + Math.random() * 20;

  if (alphaRatio > 0.6) {
    state = 'relaxed';
    calmLevel = 70 + Math.random() * 20;
    stressLevel = 10 + Math.random() * 15;
  } else if (thetaRatio > 0.5) {
    state = 'calm';
    calmLevel = 60 + Math.random() * 25;
  } else if (latest.beta > 25) {
    state = Math.random() > 0.5 ? 'stressed' : 'anxious';
    stressLevel = 60 + Math.random() * 30;
    anxietyLevel = 50 + Math.random() * 35;
    calmLevel = 20 + Math.random() * 20;
  }

  return {
    state,
    confidence: 0.75 + Math.random() * 0.2,
    stressLevel: Math.min(100, Math.max(0, stressLevel)),
    anxietyLevel: Math.min(100, Math.max(0, anxietyLevel)),
    calmLevel: Math.min(100, Math.max(0, calmLevel)),
  };
};

const generateHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const states: EmotionalState[] = ['calm', 'neutral', 'stressed', 'anxious', 'relaxed'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      avgStress: 20 + Math.random() * 40,
      avgAnxiety: 15 + Math.random() * 35,
      avgCalm: 40 + Math.random() * 40,
      dominantState: states[Math.floor(Math.random() * states.length)],
    });
  }
  return data;
};

const generateInsights = (): Insight[] => [
  {
    id: '1',
    title: 'Improved Calm Periods',
    description: 'Your calm periods have increased by 15% this week compared to last week.',
    type: 'positive',
    timestamp: new Date(),
  },
  {
    id: '2',
    title: 'Evening Relaxation',
    description: 'Consider adding a brief relaxation routine before dinner to maintain evening calmness.',
    type: 'suggestion',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    title: 'Morning Activity Correlation',
    description: 'Higher stress levels noted on days without morning activity. Light exercise may help.',
    type: 'suggestion',
    timestamp: new Date(Date.now() - 7200000),
  },
];

export const useEEGSimulation = () => {
  const [readings, setReadings] = useState<EEGReading[]>([]);
  const [analysis, setAnalysis] = useState<EmotionalAnalysis>({
    state: 'neutral',
    confidence: 0.5,
    stressLevel: 30,
    anxietyLevel: 20,
    calmLevel: 50,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalData] = useState<HistoricalData[]>(generateHistoricalData());
  const [insights] = useState<Insight[]>(generateInsights());
  const [isConnected, setIsConnected] = useState(true);

  const addAlert = useCallback((type: Alert['type'], message: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 10));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) return;

      const newReading = generateEEGReading();
      setReadings(prev => [...prev.slice(-59), newReading]);

      const newAnalysis = analyzeEmotionalState([...readings.slice(-59), newReading]);
      setAnalysis(newAnalysis);

      // Generate alerts based on analysis
      if (newAnalysis.stressLevel > 80 && Math.random() > 0.9) {
        addAlert('critical', 'Stress levels are unusually high. Immediate attention recommended.');
      } else if (newAnalysis.anxietyLevel > 70 && Math.random() > 0.95) {
        addAlert('warning', 'Anxiety patterns are elevated beyond normal range.');
      } else if (newAnalysis.state === 'anxious' && Math.random() > 0.97) {
        addAlert('warning', 'Prolonged anxious state detected. Monitoring closely.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, readings, addAlert]);

  return {
    readings,
    analysis,
    alerts,
    historicalData,
    insights,
    isConnected,
    setIsConnected,
    acknowledgeAlert,
    addAlert,
  };
};
