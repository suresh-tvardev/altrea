"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import type { EEGReading, EmotionalAnalysis, EmotionalState, Alert, HistoricalData, Insight } from '@/types/eeg';
import { alertService } from '@/services/alertService';
import { storageService } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';

// Singleton WebSocket connection ref (shared across all instances)
let globalWsRef: WebSocket | null = null;
let globalReconnectTimeoutRef: NodeJS.Timeout | null = null;
let globalReconnectAttemptsRef = 0;
let globalIsUsingWebSocket = false;

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

  const random = Math.random();

  if (alphaRatio > 0.6) {
    state = 'relaxed';
    calmLevel = 70 + Math.random() * 20;
    stressLevel = 10 + Math.random() * 15;
  } else if (thetaRatio > 0.5) {
    state = 'calm';
    calmLevel = 60 + Math.random() * 25;
  } else if (latest.beta > 25) {
    if (random > 0.85) {
      state = 'fear';
      stressLevel = 80 + Math.random() * 15;
      anxietyLevel = 75 + Math.random() * 20;
      calmLevel = 10 + Math.random() * 10;
    } else if (random > 0.5) {
      state = 'stressed';
      stressLevel = 60 + Math.random() * 30;
      anxietyLevel = 40 + Math.random() * 25;
      calmLevel = 20 + Math.random() * 15;
    } else {
      state = 'anxious';
      anxietyLevel = 60 + Math.random() * 30;
      stressLevel = 40 + Math.random() * 25;
      calmLevel = 25 + Math.random() * 15;
    }
  } else if (latest.theta > 6 && latest.alpha < 8) {
    state = 'fatigue';
    calmLevel = 30 + Math.random() * 20;
  } else if (alphaRatio < 0.3 && latest.beta < 15) {
    state = 'lonely';
    calmLevel = 25 + Math.random() * 15;
  }

  const confidence = 0.6 + Math.random() * 0.3;

  return {
    state,
    confidence,
    stressLevel: Math.max(0, Math.min(100, stressLevel)),
    anxietyLevel: Math.max(0, Math.min(100, anxietyLevel)),
    calmLevel: Math.max(0, Math.min(100, calmLevel)),
  };
};

const generateHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const states: EmotionalState[] = ['calm', 'neutral', 'stressed', 'anxious', 'relaxed', 'lonely', 'fear', 'fatigue'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
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

interface EEGContextType {
  readings: EEGReading[];
  analysis: EmotionalAnalysis;
  alerts: Alert[];
  historicalData: HistoricalData[];
  insights: Insight[];
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  addAlert: (alert: Alert) => void;
  shouldShowIntervention: boolean;
  setShouldShowIntervention: (show: boolean) => void;
  isUsingWebSocket: boolean;
  injectReading: (reading: EEGReading) => void;
}

const EEGContext = createContext<EEGContextType | undefined>(undefined);

export function EEGProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { role, loading: roleLoading } = useRole();
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
  const [shouldShowIntervention, setShouldShowIntervention] = useState(false);
  const [isUsingWebSocket, setIsUsingWebSocket] = useState(false);

  const lastAlertTimes = useRef<{ [key: string]: Date }>({});
  const previousState = useRef<EmotionalState>('neutral');
  const isInitializedRef = useRef(false);

  const parseWebSocketMessage = useCallback((data: string): EEGReading | null => {
    try {
      const parsed = JSON.parse(data);
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

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => {
      const exists = prev.some(a =>
        a.type === alert.type &&
        a.message === alert.message &&
        new Date().getTime() - a.timestamp.getTime() < 5000
      );
      if (exists) return prev;

      const updated = [alert, ...prev].slice(0, 20);
      const history = storageService.getAlertHistory();
      history.push({
        ...alert,
        timestamp: alert.timestamp.toISOString(),
      });
      storageService.saveAlertHistory(history);

      return updated;
    });

    setTimeout(() => {
      const recipients = alertService.getRecipients(alert.type);
      const recipientNames = recipients.map(r => r.name);
      if (recipientNames.length > 0) {
        toast({
          title: `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert Sent`,
          description: `Sent to ${recipientNames.length} caregiver(s): ${recipientNames.join(', ')}`,
          variant: alert.type === 'critical' ? 'destructive' : 'default',
        });
      }
    }, 0);
  }, [toast]);

  const processReading = useCallback((newReading: EEGReading) => {
    setReadings(prev => {
      const updated = [...prev.slice(-59), newReading];
      const newAnalysis = analyzeEmotionalState(updated);
      setAnalysis(newAnalysis);
      previousState.current = newAnalysis.state;

      setTimeout(() => {
        const alertCheck = alertService.checkThresholds(newAnalysis);
        if (alertCheck && alertCheck.shouldAlert) {
          const lastAlertTime = lastAlertTimes.current[alertCheck.alertType];
          if (alertService.shouldSendAlert(alertCheck.alertType, lastAlertTime)) {
            const alert = alertService.createAlert(alertCheck.alertType, alertCheck.message);
            addAlert(alert);
            lastAlertTimes.current[alertCheck.alertType] = new Date();
          }
        }
      }, 0);

      return updated;
    });
  }, [addAlert]);

  const connectWebSocket = useCallback(() => {
    // Don't connect if user is not authenticated (no role means not logged in or setup incomplete)
    if (roleLoading || !role) {
      return;
    }
    
    const wsUrl = storageService.getWebSocketUrl();
    if (!wsUrl || !isConnected || globalWsRef) {
      return; // Already connected or no URL
    }

    try {
      console.log('Attempting to connect to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      globalWsRef = ws;
      setIsUsingWebSocket(true);
      globalIsUsingWebSocket = true;
      globalReconnectAttemptsRef = 0;

      ws.onopen = () => {
        console.log('WebSocket connected successfully to:', wsUrl);
        globalReconnectAttemptsRef = 0;
        toast({
          title: 'Connected to Device',
          description: 'Device connected successfully.',
          variant: 'default',
        });
      };

      ws.onmessage = (event) => {
        try {
          const reading = parseWebSocketMessage(event.data);
          if (reading) {
            processReading(reading);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error, event.data);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error event triggered:', {
          url: wsUrl,
          readyState: ws.readyState,
          error: error,
        });
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
          url: wsUrl,
        });
        
        globalWsRef = null;
        setIsUsingWebSocket(false);
        globalIsUsingWebSocket = false;

        if (!event.wasClean && globalReconnectAttemptsRef === 0) {
          let errorMessage = 'Failed to connect to device.';
          if (event.code === 1006) {
            errorMessage = 'Could not connect to device. Please ensure the WebSocket server is running.';
          }
          toast({
            title: 'Device Connection Error',
            description: errorMessage + ' Using simulated data.',
            variant: 'destructive',
          });
        }

        if (isConnected && storageService.getWebSocketUrl()) {
          const maxAttempts = 5;
          if (globalReconnectAttemptsRef < maxAttempts) {
            globalReconnectAttemptsRef++;
            const delay = Math.min(1000 * Math.pow(2, globalReconnectAttemptsRef), 30000);
            console.log(`Attempting to reconnect (attempt ${globalReconnectAttemptsRef}/${maxAttempts}) in ${delay}ms...`);
            globalReconnectTimeoutRef = setTimeout(() => {
              connectWebSocket();
            }, delay);
          }
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsUsingWebSocket(false);
      globalIsUsingWebSocket = false;
    }
  }, [isConnected, parseWebSocketMessage, processReading, toast, role, roleLoading]);

  // Initialize WebSocket connection (only after user is authenticated)
  useEffect(() => {
    // Always set historical data and insights (these don't require auth)
    if (!isInitializedRef.current) {
      setHistoricalData(generateHistoricalData());
      setInsights(generateInsights());
    }

    // Don't attempt connection if user is not authenticated
    if (roleLoading || !role) {
      setIsUsingWebSocket(false);
      // Reset initialization flag when user logs out
      if (!roleLoading && !role) {
        isInitializedRef.current = false;
      }
      return;
    }
    
    // Only initialize connection once per authenticated session
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const wsUrl = storageService.getWebSocketUrl();
    if (wsUrl && isConnected) {
      connectWebSocket();
    } else {
      setIsUsingWebSocket(false);
    }

    // Cleanup only on unmount (when app closes)
    return () => {
      if (globalWsRef) {
        globalWsRef.close();
        globalWsRef = null;
      }
      if (globalReconnectTimeoutRef) {
        clearTimeout(globalReconnectTimeoutRef);
        globalReconnectTimeoutRef = null;
      }
      globalIsUsingWebSocket = false;
      // Don't reset isInitializedRef here - let it reset when role becomes null
    };
  }, [role, roleLoading, connectWebSocket, isConnected]); // Re-run when role changes

  // Reconnect if connection state changes (only if user is authenticated)
  useEffect(() => {
    // Don't attempt connection if user is not authenticated
    if (roleLoading || !role) {
      if (globalWsRef) {
        globalWsRef.close();
        globalWsRef = null;
        setIsUsingWebSocket(false);
        globalIsUsingWebSocket = false;
      }
      return;
    }
    
    const wsUrl = storageService.getWebSocketUrl();
    if (wsUrl && isConnected && !globalWsRef) {
      connectWebSocket();
    } else if (!isConnected && globalWsRef) {
      globalWsRef.close();
      globalWsRef = null;
      setIsUsingWebSocket(false);
      globalIsUsingWebSocket = false;
    }
  }, [isConnected, connectWebSocket, role, roleLoading]);

  // Mock data generation (fallback when not using WebSocket)
  useEffect(() => {
    if (globalIsUsingWebSocket || !isConnected) return;

    const interval = setInterval(() => {
      const newReading = generateEEGReading();
      processReading(newReading);
    }, 1000);

    return () => clearInterval(interval);
  }, [globalIsUsingWebSocket, isConnected, processReading]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const injectReading = useCallback((reading: EEGReading) => {
    processReading(reading);
  }, [processReading]);

  const value: EEGContextType = {
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
    isUsingWebSocket: globalIsUsingWebSocket,
    injectReading,
  };

  return <EEGContext.Provider value={value}>{children}</EEGContext.Provider>;
}

export function useEEGSimulation() {
  const context = useContext(EEGContext);
  if (context === undefined) {
    throw new Error('useEEGSimulation must be used within an EEGProvider');
  }
  return context;
}
