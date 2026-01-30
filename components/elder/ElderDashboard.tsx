"use client";

import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { ElderPersonalStats } from './ElderPersonalStats';
import { ElderEEGView } from './ElderEEGView';
import { ElderInterventions } from './ElderInterventions';
import { ElderCircleOfCare } from './ElderCircleOfCare';
import type { MoodSelection } from '@/types/eeg';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, AlertCircle, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ElderDashboardProps {
  selectedMood: MoodSelection;
}

export const ElderDashboard = ({ selectedMood }: ElderDashboardProps) => {
  const { readings, analysis, isConnected } = useEEGSimulation();

  // Determine stress level category for UX interventions
  const stressCategory = useMemo(() => {
    const stress = analysis.stressLevel;
    if (stress >= 80) return 'critical';
    if (stress >= 70) return 'high';
    if (stress >= 50) return 'moderate';
    if (stress >= 30) return 'low';
    return 'calm';
  }, [analysis.stressLevel]);

  // Get background gradient based on stress level
  const backgroundGradient = useMemo(() => {
    switch (stressCategory) {
      case 'critical':
        return 'from-red-50 via-orange-50 to-pink-50';
      case 'high':
        return 'from-orange-50 via-yellow-50 to-pink-50';
      case 'moderate':
        return 'from-yellow-50 via-pink-50 to-purple-50';
      case 'low':
        return 'from-pink-50 via-purple-50 to-blue-50';
      default:
        return 'from-pink-50 via-purple-50 to-blue-50';
    }
  }, [stressCategory]);

  // Get welcome message based on stress level
  const welcomeMessage = useMemo(() => {
    switch (stressCategory) {
      case 'critical':
        return {
          title: "Let's take a moment together",
          subtitle: "I'm here to help you feel better. Try some calming activities below.",
        };
      case 'high':
        return {
          title: "I notice you might be feeling stressed",
          subtitle: "Here are some activities that can help you relax.",
        };
      case 'moderate':
        return {
          title: "Welcome back!",
          subtitle: "We're here to support you today.",
        };
      default:
        return {
          title: "Welcome back!",
          subtitle: "We're here to support you today.",
        };
    }
  }, [stressCategory]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br transition-all duration-500", backgroundGradient)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message - Stress-responsive */}
        <Card className={cn(
          "mb-6 border-2 bg-white/80 transition-all duration-500",
          stressCategory === 'critical' && "border-red-300 shadow-lg",
          stressCategory === 'high' && "border-orange-300 shadow-md",
          stressCategory === 'moderate' && "border-yellow-200",
          (stressCategory === 'low' || stressCategory === 'calm') && "border-pink-200"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                stressCategory === 'critical' && "bg-red-100 animate-pulse",
                stressCategory === 'high' && "bg-orange-100",
                stressCategory === 'moderate' && "bg-yellow-100",
                (stressCategory === 'low' || stressCategory === 'calm') && "bg-pink-100"
              )}>
                {stressCategory === 'critical' || stressCategory === 'high' ? (
                  <AlertCircle className={cn(
                    "w-8 h-8 transition-all duration-500",
                    stressCategory === 'critical' && "text-red-500",
                    stressCategory === 'high' && "text-orange-500"
                  )} />
                ) : (
                  <Heart className="w-8 h-8 text-pink-500" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {welcomeMessage.title}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {welcomeMessage.subtitle}
                </p>
                {/* Stress level indicator */}
                {stressCategory === 'critical' || stressCategory === 'high' ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">
                      Stress Level: {Math.round(analysis.stressLevel)}% - Try the activities below to help
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities for You - Enhanced visibility for high stress */}
        <div className={cn(
          "mb-6 transition-all duration-500",
          (stressCategory === 'critical' || stressCategory === 'high') && "animate-pulse-gentle"
        )}>
          <ElderInterventions
            analysis={analysis}
            selectedMood={selectedMood}
            stressCategory={stressCategory}
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
