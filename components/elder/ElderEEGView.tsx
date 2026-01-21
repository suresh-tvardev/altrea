"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import type { EEGReading } from '@/types/eeg';
import { cn } from '@/lib/utils';

interface ElderEEGViewProps {
  readings: EEGReading[];
  isConnected: boolean;
}

export const ElderEEGView = ({ readings, isConnected }: ElderEEGViewProps) => {
  const latestReading = readings[readings.length - 1];

  const getWaveStatus = (value: number, type: 'alpha' | 'beta' | 'theta') => {
    if (type === 'alpha') {
      if (value >= 10 && value <= 12) return { label: 'Relaxed', color: 'text-green-600', bg: 'bg-green-100' };
      return { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    if (type === 'beta') {
      if (value < 15) return { label: 'Calm', color: 'text-green-600', bg: 'bg-green-100' };
      if (value < 25) return { label: 'Focused', color: 'text-blue-600', bg: 'bg-blue-100' };
      return { label: 'Alert', color: 'text-orange-600', bg: 'bg-orange-100' };
    }
    if (type === 'theta') {
      if (value >= 4 && value <= 7) return { label: 'Meditative', color: 'text-purple-600', bg: 'bg-purple-100' };
      return { label: 'Resting', color: 'text-indigo-600', bg: 'bg-indigo-100' };
    }
    return { label: 'Normal', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (!isConnected) {
    return (
      <Card className="border-2 border-gray-200 bg-white/90">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 py-8">
            <WifiOff className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Device Not Connected
              </h3>
              <p className="text-muted-foreground">
                Connect your device to see your brain activity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestReading) {
    return (
      <Card className="border-2 border-gray-200 bg-white/90">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Waiting for data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const alphaStatus = getWaveStatus(latestReading.alpha, 'alpha');
  const betaStatus = getWaveStatus(latestReading.beta, 'beta');
  const thetaStatus = getWaveStatus(latestReading.theta, 'theta');

  return (
    <Card className="border-2 border-pink-200 bg-white/90 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Your Brain Activity
            </h2>
            <div className="ml-auto flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">
            This shows how your brain is working right now. It helps us understand how you're feeling.
          </p>

          {/* Simplified Wave Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cn("p-4 rounded-xl text-center", alphaStatus.bg)}>
              <div className="text-2xl font-bold mb-2">Alpha</div>
              <div className={cn("text-xl font-semibold mb-1", alphaStatus.color)}>
                {alphaStatus.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {latestReading.alpha.toFixed(1)} Hz
              </div>
            </div>

            <div className={cn("p-4 rounded-xl text-center", betaStatus.bg)}>
              <div className="text-2xl font-bold mb-2">Beta</div>
              <div className={cn("text-xl font-semibold mb-1", betaStatus.color)}>
                {betaStatus.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {latestReading.beta.toFixed(1)} Hz
              </div>
            </div>

            <div className={cn("p-4 rounded-xl text-center", thetaStatus.bg)}>
              <div className="text-2xl font-bold mb-2">Theta</div>
              <div className={cn("text-xl font-semibold mb-1", thetaStatus.color)}>
                {thetaStatus.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {latestReading.theta.toFixed(1)} Hz
              </div>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-200">
            <p className="text-base text-foreground">
              <strong>What this means:</strong> Your brain waves show how relaxed or active your mind is. 
              This helps us suggest activities that are right for you right now.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
