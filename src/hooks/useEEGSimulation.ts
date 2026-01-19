import { useState, useEffect, useCallback, useRef } from 'react';
import type { EEGReading, EmotionalAnalysis, EmotionalState, Alert, HistoricalData, Insight } from '@/types/eeg';
import { alertService } from '@/services/alertService';
import { storageService } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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
  
  // Track last alert times to prevent duplicates
  const lastAlertTimes = useRef<{ [key: string]: Date }>({});

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => {
      // Check if similar alert already exists (prevent exact duplicates)
      const exists = prev.some(a => 
        a.type === alert.type && 
        a.message === alert.message &&
        new Date().getTime() - a.timestamp.getTime() < 5000 // Within 5 seconds
      );
      if (exists) return prev;
      
      const updated = [alert, ...prev].slice(0, 20);
      
      // Save to localStorage
      const history = storageService.getAlertHistory();
      history.push({
        ...alert,
        timestamp: alert.timestamp.toISOString(),
        sentTo: Object.fromEntries(
          Object.entries(alert.sentTo || {}).map(([k, v]) => [k, v.toISOString()])
        ),
      });
      storageService.saveAlertHistory(history);
      
      return updated;
    });

    // Show toast notification
    const recipientNames = alertService.getRecipientNames(alert.recipients || []);
    if (recipientNames.length > 0) {
      toast({
        title: `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert Sent`,
        description: `Sent to ${recipientNames.length} caregiver(s): ${recipientNames.join(', ')}`,
        variant: alert.type === 'critical' ? 'destructive' : 'default',
      });
    }
  }, [toast]);

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

      // Check thresholds using alert service
      const alertCheck = alertService.checkThresholds(newAnalysis);
      
      if (alertCheck && alertCheck.shouldAlert) {
        const lastAlertTime = lastAlertTimes.current[alertCheck.alertType];
        
        // Check if we should send alert (prevent duplicates)
        if (alertService.shouldSendAlert(alertCheck.alertType, lastAlertTime)) {
          const alert = alertService.createAlert(alertCheck.alertType, alertCheck.message);
          addAlert(alert);
          lastAlertTimes.current[alertCheck.alertType] = new Date();
        }
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
