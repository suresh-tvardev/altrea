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

  // Enhanced state detection with new emotional states
  const random = Math.random();

  if (alphaRatio > 0.6) {
    state = 'relaxed';
    calmLevel = 70 + Math.random() * 20;
    stressLevel = 10 + Math.random() * 15;
  } else if (thetaRatio > 0.5) {
    state = 'calm';
    calmLevel = 60 + Math.random() * 25;
  } else if (latest.beta > 25) {
    // High beta can indicate stress, anxiety, or fear
    if (random > 0.85) {
      state = 'fear';
      stressLevel = 80 + Math.random() * 15;
      anxietyLevel = 75 + Math.random() * 20;
      calmLevel = 10 + Math.random() * 10;
    } else if (random > 0.5) {
      state = 'stressed';
      stressLevel = 60 + Math.random() * 30;
      anxietyLevel = 40 + Math.random() * 25;
      calmLevel = 20 + Math.random() * 20;
    } else {
      state = 'anxious';
      stressLevel = 50 + Math.random() * 25;
      anxietyLevel = 60 + Math.random() * 30;
      calmLevel = 25 + Math.random() * 15;
    }
  } else if (latest.delta > 3 && latest.theta > 5) {
    // High delta/theta can indicate fatigue
    if (random > 0.7) {
      state = 'fatigue';
      calmLevel = 40 + Math.random() * 20;
      stressLevel = 30 + Math.random() * 20;
      anxietyLevel = 20 + Math.random() * 15;
    } else {
      state = 'calm';
      calmLevel = 60 + Math.random() * 25;
    }
  } else if (calmLevel < 40 && stressLevel < 30 && anxietyLevel < 25) {
    // Low activity across all metrics might indicate loneliness
    if (random > 0.8) {
      state = 'lonely';
      calmLevel = 35 + Math.random() * 15;
      stressLevel = 25 + Math.random() * 15;
      anxietyLevel = 20 + Math.random() * 15;
    } else {
      state = 'neutral';
    }
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
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isUsingWebSocket, setIsUsingWebSocket] = useState(false);

  // Track last alert times to prevent duplicates
  const lastAlertTimes = useRef<{ [key: string]: Date }>({});

  // Track previous state for intervention triggers
  const previousState = useRef<EmotionalState>('neutral');
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);

  // WebSocket connection ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

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
      });
      storageService.saveAlertHistory(history);

      return updated;
    });

    // Show toast notification
    const recipients = alertService.getRecipients(alert.type);
    const recipientNames = recipients.map(r => r.name);
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

  // Parse WebSocket message to EEGReading
  const parseWebSocketMessage = useCallback((data: string): EEGReading | null => {
    try {
      const parsed = JSON.parse(data);
      // Validate required fields
      if (
        typeof parsed.alpha === 'number' &&
        typeof parsed.beta === 'number' &&
        typeof parsed.theta === 'number' &&
        typeof parsed.delta === 'number' &&
        typeof parsed.gamma === 'number'
      ) {
        return {
          timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
          alpha: parsed.alpha,
          beta: parsed.beta,
          theta: parsed.theta,
          delta: parsed.delta,
          gamma: parsed.gamma,
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      return null;
    }
  }, []);

  // Process new reading and update analysis
  const processReading = useCallback((newReading: EEGReading) => {
    setReadings(prev => {
      const updated = [...prev.slice(-59), newReading];
      const newAnalysis = analyzeEmotionalState(updated);
      setAnalysis(newAnalysis);

      // Check if state changed to trigger intervention popup
      const interventionStates: EmotionalState[] = ['stressed', 'anxious', 'fear', 'lonely', 'fatigue'];
      const stateChanged = previousState.current !== newAnalysis.state;
      const shouldTriggerIntervention =
        stateChanged &&
        interventionStates.includes(newAnalysis.state) &&
        (newAnalysis.stressLevel > 60 || newAnalysis.anxietyLevel > 60 || newAnalysis.state === 'fear');

      if (shouldTriggerIntervention) {
        setShouldShowIntervention(true);
      }

      previousState.current = newAnalysis.state;

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

      return updated;
    });
  }, [addAlert]);

  // Initialize data that involves random numbers/dates on the client only
  useEffect(() => {
    setHistoricalData(generateHistoricalData());
    setInsights(generateInsights());
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const wsUrl = storageService.getWebSocketUrl();
    if (!wsUrl || !isConnected) {
      setIsUsingWebSocket(false);
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setIsUsingWebSocket(true);
      reconnectAttemptsRef.current = 0;

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        const reading = parseWebSocketMessage(event.data);
        if (reading) {
          processReading(reading);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsUsingWebSocket(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsUsingWebSocket(false);
        wsRef.current = null;

        // Attempt to reconnect if still connected and URL is configured
        if (isConnected && storageService.getWebSocketUrl()) {
          const maxAttempts = 5;
          if (reconnectAttemptsRef.current < maxAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            toast({
              title: 'WebSocket Connection Failed',
              description: 'Could not reconnect to WebSocket. Falling back to mock data.',
              variant: 'destructive',
            });
            setIsUsingWebSocket(false);
          }
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsUsingWebSocket(false);
      toast({
        title: 'WebSocket Error',
        description: 'Failed to connect to WebSocket. Using mock data.',
        variant: 'destructive',
      });
    }
  }, [isConnected, parseWebSocketMessage, processReading, toast]);

  // Initialize WebSocket connection or use mock data
  useEffect(() => {
    const wsUrl = storageService.getWebSocketUrl();

    if (wsUrl && isConnected) {
      connectWebSocket();
    } else {
      setIsUsingWebSocket(false);
      // Close existing connection if URL is removed or disconnected
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // Mock data generation (fallback when not using WebSocket)
  useEffect(() => {
    if (isUsingWebSocket || !isConnected) return;

    const interval = setInterval(() => {
      const newReading = generateEEGReading();
      processReading(newReading);
    }, 1000);

    return () => clearInterval(interval);
  }, [isUsingWebSocket, isConnected, processReading]);

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
    shouldShowIntervention,
    setShouldShowIntervention,
    isUsingWebSocket,
  };
};
