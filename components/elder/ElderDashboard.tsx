"use client";

import { useEEGSimulation } from '@/hooks/useEEGSimulation';
import { ElderPersonalStats } from './ElderPersonalStats';
import { ElderEEGView } from './ElderEEGView';
import { ElderInterventions } from './ElderInterventions';
import { ElderCircleOfCare } from './ElderCircleOfCare';
import type { MoodSelection } from '@/types/eeg';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, AlertCircle, Sparkles } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { cn, resolveAvatarUrl } from '@/lib/utils';

const STABILITY_MS = 15000; // Same as caregiver: only update activities after 15s of stable state

interface ElderDashboardProps {
  selectedMood: MoodSelection;
  elderName?: string | null;
  elderAvatarUrl?: string | null;
}

export const ElderDashboard = ({ selectedMood, elderName, elderAvatarUrl }: ElderDashboardProps) => {
  const { readings, analysis, isConnected } = useEEGSimulation();

  // Determine stress level category (same logic as caregiver)
  const stressCategory = useMemo(() => {
    const stress = analysis.stressLevel;
    if (stress >= 80) return 'critical';
    if (stress >= 70) return 'high';
    if (stress >= 50) return 'moderate';
    if (stress >= 30) return 'low';
    return 'calm';
  }, [analysis.stressLevel]);

  // Stable category for activities - only update after state is stable for 15s (same interval as caregiver)
  const [stableStressCategory, setStableStressCategory] = useState<typeof stressCategory>(stressCategory);

  useEffect(() => {
    const t = setTimeout(() => {
      setStableStressCategory(stressCategory);
    }, STABILITY_MS);
    return () => clearTimeout(t);
  }, [stressCategory]);

  const backgroundGradient = 'from-sky-50/50 via-white to-rose-50/50';

  // Get welcome message based on stress level (include name when available)
  const displayName = elderName || '';
  const welcomeMessage = useMemo(() => {
    const withName = displayName ? `Welcome back, ${displayName}!` : 'Welcome back!';
    switch (stressCategory) {
      case 'critical':
        return {
          title: displayName ? `${displayName}, let's take a moment together` : "Let's take a moment together",
          subtitle: "I'm here to help you feel better. Try some calming activities below.",
        };
      case 'high':
        return {
          title: displayName ? `${displayName}, I notice you might be feeling stressed` : "I notice you might be feeling stressed",
          subtitle: "Here are some activities that can help you relax.",
        };
      case 'moderate':
        return {
          title: withName,
          subtitle: "We're here to support you today.",
        };
      default:
        return {
          title: withName,
          subtitle: "We're here to support you today.",
        };
    }
  }, [stressCategory, displayName]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br transition-all duration-500", backgroundGradient)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <Card className="mb-6 border border-sky-200/60 bg-white/95 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={resolveAvatarUrl(elderAvatarUrl, displayName || 'User')} alt={displayName || 'Profile'} />
                <AvatarFallback className="bg-rose-100 text-rose-700 text-xl">
                  {displayName ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) : <Heart className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
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
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-medium text-rose-700">
                      Try the activities below to help you relax
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities for You */}
        <div className="mb-6">
          <ElderInterventions
            analysis={analysis}
            selectedMood={selectedMood}
            stressCategory={stableStressCategory}
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
