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

// Calm: high alpha, moderate theta, lower beta -> relaxed state
const generateCalmEEGReading = (): EEGReading => ({
  timestamp: new Date(),
  alpha: 10 + Math.random() * 3,
  beta: 15 + Math.random() * 8,
  theta: 5 + Math.random() * 2,
  delta: 1 + Math.random() * 2,
  gamma: 40 + Math.random() * 30,
});

// Stress: high beta, lower alpha -> elevated stress
const generateStressEEGReading = (): EEGReading => ({
  timestamp: new Date(),
  alpha: 6 + Math.random() * 3,
  beta: 28 + Math.random() * 15,
  theta: 4 + Math.random() * 3,
  delta: 0.5 + Math.random() * 2,
  gamma: 70 + Math.random() * 30,
});

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
  const isInitialLoadRef = useRef(true); // Track if this is initial load
  const mockDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationStartTimeRef = useRef<number>(Date.now());

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

  const processReading = useCallback((newReading: EEGReading, fromLocalStorage = false, providedAnalysis?: EmotionalAnalysis) => {
    console.log('processReading called:', {
      fromLocalStorage,
      isInitialLoad: isInitialLoadRef.current,
      hasProvidedAnalysis: !!providedAnalysis,
      reading: {
        alpha: newReading.alpha,
        beta: newReading.beta,
        theta: newReading.theta,
        delta: newReading.delta,
        gamma: newReading.gamma,
      }
    });

    setReadings(prev => {
      const updated = [...prev.slice(-59), newReading];
      
      // Use provided analysis from simulator if available, otherwise calculate
      const newAnalysis = providedAnalysis || analyzeEmotionalState(updated);
      
      if (providedAnalysis) {
        console.log('Using provided analysis from simulator:', newAnalysis);
      } else {
        console.log('New analysis calculated:', {
          state: newAnalysis.state,
          stressLevel: newAnalysis.stressLevel,
          anxietyLevel: newAnalysis.anxietyLevel,
          calmLevel: newAnalysis.calmLevel,
          confidence: newAnalysis.confidence,
        });
      }
      
      setAnalysis(newAnalysis);
      previousState.current = newAnalysis.state;

      // Only process alerts if:
      // 1. It's from localStorage (simulator trigger), OR
      // 2. It's not the initial load (after initial load is complete)
      if (fromLocalStorage || !isInitialLoadRef.current) {
        setTimeout(() => {
          const alertCheck = alertService.checkThresholds(newAnalysis);
          if (alertCheck && alertCheck.shouldAlert) {
            const lastAlertTime = lastAlertTimes.current[alertCheck.alertType];
            if (alertService.shouldSendAlert(alertCheck.alertType, lastAlertTime)) {
              const alert = alertService.createAlert(alertCheck.alertType, alertCheck.message);
              console.log('Alert created:', alert);
              addAlert(alert);
              lastAlertTimes.current[alertCheck.alertType] = new Date();

              // When critical alert fires, update emotional state to stressed for caregiver view
              if (alertCheck.alertType === 'critical') {
                setAnalysis(prev => ({
                  ...prev,
                  state: 'stressed',
                  stressLevel: Math.max(prev.stressLevel, 80),
                  calmLevel: Math.min(prev.calmLevel, 25),
                  confidence: 0.85,
                }));
                previousState.current = 'stressed';
              }
            }
          }
        }, 0);
      } else {
        console.log('Skipping alert processing - initial load or not from localStorage');
      }

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
      // Clear any existing alerts on initial load
      setAlerts([]);
      isInitialLoadRef.current = true;
    }

    // Don't attempt connection if user is not authenticated
    if (roleLoading || !role) {
      setIsUsingWebSocket(false);
      // Reset initialization flag when user logs out
      if (!roleLoading && !role) {
        isInitializedRef.current = false;
        isInitialLoadRef.current = true;
        setAlerts([]); // Clear alerts on logout
      }
      return;
    }
    
    // Only initialize connection once per authenticated session
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check connection mode preference
    const connectionMode = storageService.getConnectionMode();
    
    // Only use WebSocket if connection mode is 'streaming' and URL is configured
    if (connectionMode === 'streaming') {
      const wsUrl = storageService.getWebSocketUrl();
      if (wsUrl && isConnected) {
        connectWebSocket();
      } else {
        setIsUsingWebSocket(false);
      }
    } else {
      // localStorage mode - don't use WebSocket
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
    
    // Check connection mode preference
    const connectionMode = storageService.getConnectionMode();
    
    // Only use WebSocket if connection mode is 'streaming' and URL is configured
    if (connectionMode === 'streaming') {
      const wsUrl = storageService.getWebSocketUrl();
      if (wsUrl && isConnected && !globalWsRef) {
        connectWebSocket();
      } else if (!isConnected && globalWsRef) {
        globalWsRef.close();
        globalWsRef = null;
        setIsUsingWebSocket(false);
        globalIsUsingWebSocket = false;
      }
    } else {
      // localStorage mode - ensure WebSocket is not used
      if (globalWsRef) {
        globalWsRef.close();
        globalWsRef = null;
        setIsUsingWebSocket(false);
        globalIsUsingWebSocket = false;
      }
    }
  }, [isConnected, connectWebSocket, role, roleLoading]);

  // Track last processed reading to avoid duplicates
  const lastProcessedTrigger = useRef<number>(0);
  const lastSimulatorReadingTime = useRef<number>(0); // Track when last simulator reading was received

  // Listen to localStorage for simulator readings (when using localStorage mode)
  useEffect(() => {
    // Check connection mode preference
    const connectionMode = storageService.getConnectionMode();
    
    console.log('localStorage listener effect:', {
      connectionMode,
      globalIsUsingWebSocket,
      isConnected,
      willListen: connectionMode === 'localStorage' && !globalIsUsingWebSocket && isConnected,
    });

    // Only listen to localStorage if connection mode is 'localStorage'
    if (connectionMode !== 'localStorage' || globalIsUsingWebSocket || !isConnected) {
      // Clear mock data interval if using WebSocket or streaming mode
      if (mockDataIntervalRef.current) {
        clearInterval(mockDataIntervalRef.current);
        mockDataIntervalRef.current = null;
      }
      console.log('Skipping localStorage listener - using streaming mode, WebSocket, or not connected');
      return;
    }

    console.log('Setting up localStorage listener for simulator data');

    // Mark initial load as complete after a short delay
    const initialLoadTimeout = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 2000); // 2 seconds after mount, initial load is complete

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'altrea_simulator_eeg_reading' && e.newValue) {
        try {
          const readingData = JSON.parse(e.newValue);
          // Check if this is a new reading (by trigger timestamp)
          if (readingData._trigger && readingData._trigger > lastProcessedTrigger.current) {
            lastProcessedTrigger.current = readingData._trigger;
            // Use exact values from simulator - no transformation
            const reading: EEGReading = {
              timestamp: readingData.timestamp ? new Date(readingData.timestamp) : new Date(),
              alpha: readingData.alpha, // Exact value
              beta: readingData.beta, // Exact value
              theta: readingData.theta, // Exact value
              delta: readingData.delta, // Exact value
              gamma: readingData.gamma, // Exact value
            };
            
            // Use emotional analysis from simulator if available
            if (readingData.analysis) {
              console.log('=== CAREGIVER: Using emotional analysis from simulator ===');
              console.log('Analysis from localStorage:', readingData.analysis);
              setAnalysis(readingData.analysis);
            }
            
            // Log the exact data received for debugging
            console.log('=== CAREGIVER: Received from localStorage (storage event) ===');
            console.log('Raw readingData:', readingData);
            console.log('Constructed reading:', {
              alpha: reading.alpha,
              beta: reading.beta,
              theta: reading.theta,
              delta: reading.delta,
              gamma: reading.gamma,
            });
            console.log('Values as numbers:', {
              alpha: Number(reading.alpha),
              beta: Number(reading.beta),
              theta: Number(reading.theta),
              delta: Number(reading.delta),
              gamma: Number(reading.gamma),
            });
            // Validate values match exactly
            const valuesMatch = (
              Math.abs(readingData.alpha - reading.alpha) < 0.0001 &&
              Math.abs(readingData.beta - reading.beta) < 0.0001 &&
              Math.abs(readingData.theta - reading.theta) < 0.0001 &&
              Math.abs(readingData.delta - reading.delta) < 0.0001 &&
              Math.abs(readingData.gamma - reading.gamma) < 0.0001
            );
            
            if (!valuesMatch) {
              console.error('=== DATA MISMATCH DETECTED ===');
              console.error('Original:', readingData);
              console.error('Constructed:', reading);
            } else {
              console.log('✓ Values match exactly');
            }
            
            // Update last simulator reading time
            lastSimulatorReadingTime.current = Date.now();
            // Mark as from localStorage (simulator trigger)
            // If analysis is provided, don't recalculate it
            processReading(reading, true, readingData.analysis);
          }
        } catch (error) {
          console.error('Error parsing simulator reading from localStorage:', error);
        }
      }
    };

    // Listen to storage events (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);

    // Also poll localStorage for same-tab updates (storage event doesn't fire in same tab)
    // Poll more frequently (500ms) to catch simulator data immediately
    const checkInterval = setInterval(() => {
      const reading = storageService.getSimulatorReading();
      if (reading && reading._trigger) {
        // Check if this is a new reading
        if (reading._trigger > lastProcessedTrigger.current) {
          console.log('New simulator reading detected via polling:', {
            trigger: reading._trigger,
            lastProcessed: lastProcessedTrigger.current,
            reading: {
              alpha: reading.alpha,
              beta: reading.beta,
              theta: reading.theta,
              delta: reading.delta,
              gamma: reading.gamma,
            }
          });
          
          lastProcessedTrigger.current = reading._trigger;
          // Use exact values from simulator - no transformation or rounding
          const readingObj: EEGReading = {
            timestamp: reading.timestamp instanceof Date ? reading.timestamp : new Date(reading.timestamp),
            alpha: reading.alpha, // Exact value from simulator
            beta: reading.beta, // Exact value from simulator
            theta: reading.theta, // Exact value from simulator
            delta: reading.delta, // Exact value from simulator
            gamma: reading.gamma, // Exact value from simulator
          };
          
          // Use emotional analysis from simulator if available
          if (reading.analysis) {
            console.log('=== CAREGIVER: Using emotional analysis from simulator (polling) ===');
            console.log('Analysis from localStorage:', reading.analysis);
            setAnalysis(reading.analysis);
          }
          
          // Log the exact data received for debugging (same-tab polling)
          console.log('=== CAREGIVER: Received from localStorage (polling) ===');
          console.log('Raw reading from storage:', reading);
          console.log('Constructed readingObj:', {
            alpha: readingObj.alpha,
            beta: readingObj.beta,
            theta: readingObj.theta,
            delta: readingObj.delta,
            gamma: readingObj.gamma,
          });
          console.log('Values as numbers:', {
            alpha: Number(readingObj.alpha),
            beta: Number(readingObj.beta),
            theta: Number(readingObj.theta),
            delta: Number(readingObj.delta),
            gamma: Number(readingObj.gamma),
          });
          // Validate values match exactly
          const valuesMatch = (
            Math.abs(reading.alpha - readingObj.alpha) < 0.0001 &&
            Math.abs(reading.beta - readingObj.beta) < 0.0001 &&
            Math.abs(reading.theta - readingObj.theta) < 0.0001 &&
            Math.abs(reading.delta - readingObj.delta) < 0.0001 &&
            Math.abs(reading.gamma - readingObj.gamma) < 0.0001
          );
          
          if (!valuesMatch) {
            console.error('=== DATA MISMATCH DETECTED (polling) ===');
            console.error('From storage:', reading);
            console.error('Constructed:', readingObj);
          } else {
            console.log('✓ Values match exactly (polling)');
          }
          
          // Update last simulator reading time
          lastSimulatorReadingTime.current = Date.now();
          // Mark as from localStorage (simulator trigger)
          // Pass the analysis if available
          processReading(readingObj, true, reading.analysis);
        } else {
          console.log('Simulator reading already processed:', {
            trigger: reading._trigger,
            lastProcessed: lastProcessedTrigger.current,
          });
        }
      } else {
        // Log when no reading is found (only occasionally to avoid spam)
        if (Math.random() < 0.01) { // Log 1% of the time
          console.log('No simulator reading in localStorage');
        }
      }
    }, 500); // Poll every 500ms to catch simulator data quickly

    // Default simulation: calm for 40s, then stress (1 Hz)
    simulationStartTimeRef.current = Date.now();
    mockDataIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - simulationStartTimeRef.current;
      const phase = elapsedMs < 40000 ? 'calm' : 'stress';
      const reading = phase === 'calm' ? generateCalmEEGReading() : generateStressEEGReading();
      processReading(reading, false);
    }, 1000);

    return () => {
      clearTimeout(initialLoadTimeout);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
      if (mockDataIntervalRef.current) {
        clearInterval(mockDataIntervalRef.current);
        mockDataIntervalRef.current = null;
      }
    };
  }, [globalIsUsingWebSocket, isConnected, processReading]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const injectReading = useCallback((reading: EEGReading) => {
    // Direct injection from simulator - mark as from localStorage
    processReading(reading, true);
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
