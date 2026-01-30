"use client";

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Heart, Sparkles, Phone, Volume2, AlertCircle } from 'lucide-react';
import { getIntervention } from '@/services/interventionService';
import type { EmotionalAnalysis, MoodSelection } from '@/types/eeg';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ElderInterventionsProps {
  analysis: EmotionalAnalysis;
  selectedMood: MoodSelection;
  stressCategory?: 'critical' | 'high' | 'moderate' | 'low' | 'calm';
}

export const ElderInterventions = ({ analysis, selectedMood, stressCategory = 'calm' }: ElderInterventionsProps) => {
  const router = useRouter();
  const intervention = useMemo(() => getIntervention(analysis), [analysis]);

  // Combine mood selection with EEG analysis and stress level for better recommendations
  const getRecommendations = () => {
    const recommendations: Array<{ title: string; icon: any; action: string; color: string; priority: number }> = [];

    // Priority recommendations based on stress level
    if (stressCategory === 'critical' || stressCategory === 'high') {
      // High priority calming activities for high stress
      recommendations.push(
        { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: 'bg-blue-500', priority: 1 },
        { title: 'Calm Music', icon: Music, action: 'music', color: 'bg-purple-500', priority: 2 },
        { title: 'Call Family', icon: Phone, action: 'call', color: 'bg-pink-500', priority: 3 }
      );
    } else if (stressCategory === 'moderate') {
      // Moderate stress - mix of calming and engaging
      recommendations.push(
        { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: 'bg-blue-500', priority: 1 },
        { title: 'Calm Music', icon: Music, action: 'music', color: 'bg-purple-500', priority: 2 }
      );
    }

    // Based on selected mood (if not already covered by stress level)
    if (stressCategory !== 'critical' && stressCategory !== 'high') {
      if (selectedMood === 'happy' || selectedMood === 'calm') {
        recommendations.push(
          { title: 'Capture This Moment', icon: Heart, action: 'photo', color: 'bg-yellow-500', priority: 3 },
          { title: 'Gratitude Journal', icon: Sparkles, action: 'journal', color: 'bg-green-500', priority: 4 }
        );
      } else if (selectedMood === 'stressed') {
        recommendations.push(
          { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: 'bg-blue-500', priority: 1 },
          { title: 'Calm Music', icon: Music, action: 'music', color: 'bg-purple-500', priority: 2 }
        );
      } else if (selectedMood === 'lonely') {
        recommendations.push(
          { title: 'Call Family', icon: Phone, action: 'call', color: 'bg-pink-500', priority: 1 },
          { title: 'Memory Sharing', icon: Heart, action: 'memory', color: 'bg-red-500', priority: 2 }
        );
      } else if (selectedMood === 'sad') {
        recommendations.push(
          { title: 'View Memories', icon: Heart, action: 'memories', color: 'bg-purple-500', priority: 1 },
          { title: 'Listen to Music', icon: Music, action: 'music', color: 'bg-blue-500', priority: 2 }
        );
      }
    }

    // Add music if available (if not already added)
    if (intervention.music && intervention.music.length > 0) {
      const hasMusic = recommendations.some(r => r.action === 'music');
      if (!hasMusic) {
        recommendations.push({
          title: 'Play Music',
          icon: Music,
          action: 'music',
          color: 'bg-indigo-500',
          priority: 5
        });
      }
    }

    // Sort by priority and limit to 4
    return recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4);
  };

  const recommendations = getRecommendations();

  const handleAction = (action: string) => {
    // Navigate to interventions page or handle specific actions
    if (action === 'music' || action === 'breathing' || action === 'memory') {
      router.push('/interventions');
    } else {
      // For now, show a message (these features will be implemented later)
      alert(`${action} feature coming soon!`);
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  const isHighStress = stressCategory === 'critical' || stressCategory === 'high';

  return (
    <Card className={cn(
      "border-2 bg-white/90 shadow-lg transition-all duration-500",
      isHighStress ? "border-red-300 shadow-xl" : "border-pink-200"
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {isHighStress ? (
              <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-pink-500" />
            )}
            <h2 className={cn(
              "text-2xl font-bold transition-colors duration-500",
              isHighStress ? "text-red-700" : "text-foreground"
            )}>
              {isHighStress ? "Calming Activities for You" : "Activities for You"}
            </h2>
          </div>

          <p className={cn(
            "text-lg transition-colors duration-500",
            isHighStress ? "text-red-600 font-medium" : "text-muted-foreground"
          )}>
            {isHighStress 
              ? "I notice you might be feeling stressed. These activities can help you feel calmer:"
              : "Based on how you're feeling, here are some things that might help:"
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const isPriority = index === 0 && isHighStress;
              return (
                <Button
                  key={index}
                  onClick={() => handleAction(rec.action)}
                  className={cn(
                    "h-24 text-lg font-semibold text-white",
                    rec.color,
                    "hover:opacity-90 shadow-md hover:shadow-lg transition-all",
                    "flex flex-col items-center justify-center gap-2",
                    isPriority && "ring-4 ring-red-300 ring-opacity-50 animate-pulse"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span>{rec.title}</span>
                  {isPriority && (
                    <span className="text-xs font-normal opacity-90">Try this first</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
