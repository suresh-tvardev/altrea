"use client";

import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { ElderPersonalStats } from './ElderPersonalStats';
import { ElderEEGView } from './ElderEEGView';
import { ElderInterventions } from './ElderInterventions';
import { ElderCircleOfCare } from './ElderCircleOfCare';
import type { MoodSelection } from '@/types/eeg';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface ElderDashboardProps {
  selectedMood: MoodSelection;
}

export const ElderDashboard = ({ selectedMood }: ElderDashboardProps) => {
  const { readings, analysis, isConnected } = useEEGSimulation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <Card className="mb-6 border-2 border-pink-200 bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back!
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  We're here to support you today.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities for You - Moved to top for visibility */}
        <div className="mb-6">
          <ElderInterventions
            analysis={analysis}
            selectedMood={selectedMood}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Stats */}
            <ElderPersonalStats
              historicalData={readings}
              selectedMood={selectedMood}
            />

            {/* Simplified EEG View */}
            <ElderEEGView
              readings={readings}
              isConnected={isConnected}
            />
          </div>

          {/* Right Column - Circle of Care */}
          <div className="space-y-6">
            <ElderCircleOfCare />
          </div>
        </div>
      </div>
    </div>
  );
};
