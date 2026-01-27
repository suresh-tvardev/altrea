"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { useRole } from '@/contexts/RoleContext';
import { AlertTriangle, Activity, Zap, Heart, Brain, ArrowLeft, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import type { EEGReading, EmotionalState } from '@/types/eeg';

// Helper function to generate stress readings based on stress level
const generateStressReading = (stressLevel: number): EEGReading => {
  // Higher stress = higher beta, lower alpha
  // Stress level 0-100 maps to EEG patterns
  const normalizedStress = stressLevel / 100;
  
  // For critical stress (>= 80), ensure beta > 25 to trigger stressed/fear state
  // For warning stress (>= 70), ensure beta > 25 to trigger stressed/anxious state
  // For lower stress, use moderate values
  
  let alpha: number;
  let beta: number;
  let theta: number;
  
  if (stressLevel >= 80) {
    // Critical stress - ensure high beta to trigger fear/stressed state
    alpha = 3 + Math.random() * 2; // Very low alpha
    beta = 35 + Math.random() * 10; // High beta (> 25)
    theta = 2 + Math.random() * 2; // Low theta
  } else if (stressLevel >= 70) {
    // Warning stress - ensure beta > 25 to trigger stressed/anxious state
    alpha = 4 + Math.random() * 3; // Low alpha
    beta = 28 + Math.random() * 8; // Beta > 25
    theta = 3 + Math.random() * 2; // Low theta
  } else if (stressLevel >= 50) {
    // Moderate stress
    alpha = 6 + Math.random() * 4;
    beta = 20 + Math.random() * 8;
    theta = 4 + Math.random() * 2;
  } else {
    // Low stress - calm state
    alpha = 10 + Math.random() * 3;
    beta = 15 + Math.random() * 5;
    theta = 5 + Math.random() * 2;
  }
  
  const delta = 1 + Math.random() * 2;
  const gamma = 30 + normalizedStress * 50 + Math.random() * 20;
  
  return {
    timestamp: new Date(),
    alpha,
    beta,
    theta,
    delta,
    gamma,
  };
};

// Preset scenarios
type StressScenario = {
  name: string;
  description: string;
  stressLevel: number;
  color: string;
  anxietyBoost?: boolean;
};

const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Mild Stress',
    description: 'Slight elevation in stress levels',
    stressLevel: 45,
    color: 'bg-yellow-500',
  },
  {
    name: 'Moderate Stress',
    description: 'Noticeable stress increase',
    stressLevel: 65,
    color: 'bg-orange-500',
  },
  {
    name: 'High Stress',
    description: 'Significant stress spike - Warning threshold',
    stressLevel: 75,
    color: 'bg-red-500',
  },
  {
    name: 'Critical Stress',
    description: 'Very high stress - Critical alert threshold',
    stressLevel: 90,
    color: 'bg-red-700',
  },
  {
    name: 'Anxiety Spike',
    description: 'High anxiety pattern',
    stressLevel: 70,
    anxietyBoost: true,
    color: 'bg-purple-500',
  },
  {
    name: 'Calm State',
    description: 'Return to calm baseline',
    stressLevel: 20,
    color: 'bg-green-500',
  },
];

export default function SimulatorPage() {
  const router = useRouter();
  const { injectReading, analysis, alerts } = useEEGSimulation();
  const { role, loading: roleLoading } = useRole();
  const [stressLevel, setStressLevel] = useState(50);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if user is authenticated
  if (!roleLoading && !role) {
    router.replace('/auth/login');
    return null;
  }

  const handleTriggerStress = (level: number, anxietyBoost = false) => {
    const reading = generateStressReading(level);
    
    // For anxiety boost, adjust the reading to trigger anxiety patterns
    if (anxietyBoost) {
      reading.beta = Math.max(reading.beta, 35);
      reading.alpha = Math.min(reading.alpha, 5);
    }
    
    injectReading(reading);
    toast.success(`Stress event triggered at ${level}% level`);
  };

  const handlePresetScenario = (scenario: StressScenario) => {
    handleTriggerStress(scenario.stressLevel, scenario.anxietyBoost || false);
  };

  const startAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
    
    setIsAutoPlaying(true);
    const interval = setInterval(() => {
      handleTriggerStress(stressLevel);
    }, 2000); // Trigger every 2 seconds
    
    setAutoPlayInterval(interval);
    toast.info('Auto-play started - triggering stress events every 2 seconds');
  };

  const stopAutoPlay = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
    setIsAutoPlaying(false);
    toast.info('Auto-play stopped');
  };

  const currentStateColor = {
    calm: 'text-green-600',
    neutral: 'text-gray-600',
    stressed: 'text-red-600',
    anxious: 'text-purple-600',
    relaxed: 'text-blue-600',
    lonely: 'text-orange-600',
    fear: 'text-red-800',
    fatigue: 'text-yellow-600',
  }[analysis.state] || 'text-gray-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold mb-2">Stress Event Simulator</h1>
            <p className="text-muted-foreground">
              Trigger stress events to test elder monitoring and caregiver alerts
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {role === 'elder' ? 'Elder View' : 'Caregiver View'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Emotional State</Label>
                <p className={`text-2xl font-bold ${currentStateColor}`}>
                  {analysis.state.charAt(0).toUpperCase() + analysis.state.slice(1)}
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Stress Level</span>
                    <span className="font-semibold">{Math.round(analysis.stressLevel)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${analysis.stressLevel}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Anxiety Level</span>
                    <span className="font-semibold">{Math.round(analysis.anxietyLevel)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${analysis.anxietyLevel}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Calm Level</span>
                    <span className="font-semibold">{Math.round(analysis.calmLevel)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${analysis.calmLevel}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Confidence</Label>
                <p className="text-lg font-semibold">{Math.round(analysis.confidence * 100)}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Stress Controls */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Trigger Stress Events
              </CardTitle>
              <CardDescription>
                Manually trigger stress events or use presets to test alert system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Stress Level Control */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Stress Level: {stressLevel}%</Label>
                    <Badge variant={stressLevel >= 80 ? 'destructive' : stressLevel >= 70 ? 'default' : 'secondary'}>
                      {stressLevel >= 80 ? 'Critical' : stressLevel >= 70 ? 'Warning' : 'Normal'}
                    </Badge>
                  </div>
                  <Slider
                    value={[stressLevel]}
                    onValueChange={(value) => setStressLevel(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Calm (0%)</span>
                    <span>Moderate (50%)</span>
                    <span>Critical (100%)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleTriggerStress(stressLevel)}
                    className="flex-1"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Trigger Now
                  </Button>
                  {!isAutoPlaying ? (
                    <Button
                      onClick={startAutoPlay}
                      variant="outline"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Auto-Play
                    </Button>
                  ) : (
                    <Button
                      onClick={stopAutoPlay}
                      variant="destructive"
                      size="lg"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Preset Scenarios */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Quick Scenarios</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STRESS_SCENARIOS.map((scenario) => (
                    <Button
                      key={scenario.name}
                      onClick={() => handlePresetScenario(scenario)}
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-start gap-1"
                    >
                      <div className={`w-full h-2 rounded ${scenario.color} mb-1`} />
                      <span className="font-semibold text-sm">{scenario.name}</span>
                      <span className="text-xs text-muted-foreground text-left">
                        {scenario.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts ({alerts.filter(a => !a.acknowledged).length})
            </CardTitle>
            <CardDescription>
              Alerts triggered by stress events will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.filter(a => !a.acknowledged).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No active alerts. Trigger a stress event above to generate alerts.
              </p>
            ) : (
              <div className="space-y-2">
                {alerts
                  .filter(a => !a.acknowledged)
                  .slice(0, 5)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.type === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : alert.type === 'warning'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                alert.type === 'critical'
                                  ? 'destructive'
                                  : alert.type === 'warning'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {alert.type.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          {alert.recipients && alert.recipients.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Sent to {alert.recipients.length} caregiver(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Manual Trigger:</strong> Adjust the stress level slider and click "Trigger Now" to inject a single stress event.
            </p>
            <p>
              <strong>2. Preset Scenarios:</strong> Click any preset button to quickly trigger common stress patterns.
            </p>
            <p>
              <strong>3. Auto-Play:</strong> Enable auto-play to continuously trigger stress events every 2 seconds at the selected level.
            </p>
            <p>
              <strong>4. Monitor Alerts:</strong> Watch the alerts panel below. When stress exceeds thresholds (80% critical, 70% warning), alerts will be generated and sent to caregivers.
            </p>
            <p>
              <strong>5. Test Caregiver View:</strong> Open the caregiver dashboard in another tab/window to see how alerts appear to caregivers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

