"use client";

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Heart, Sparkles, Phone, Volume2 } from 'lucide-react';
import { getIntervention } from '@/services/interventionService';
import type { EmotionalAnalysis, MoodSelection } from '@/types/eeg';
import { useRouter } from 'next/navigation';

interface ElderInterventionsProps {
  analysis: EmotionalAnalysis;
  selectedMood: MoodSelection;
}

export const ElderInterventions = ({ analysis, selectedMood }: ElderInterventionsProps) => {
  const router = useRouter();
  const intervention = useMemo(() => getIntervention(analysis), [analysis]);

  // Combine mood selection with EEG analysis for better recommendations
  const getRecommendations = () => {
    const recommendations: Array<{ title: string; icon: any; action: string; color: string }> = [];

    // Based on selected mood
    if (selectedMood === 'happy' || selectedMood === 'calm') {
      recommendations.push(
        { title: 'Capture This Moment', icon: Heart, action: 'photo', color: 'bg-yellow-500' },
        { title: 'Gratitude Journal', icon: Sparkles, action: 'journal', color: 'bg-green-500' }
      );
    } else if (selectedMood === 'stressed') {
      recommendations.push(
        { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: 'bg-blue-500' },
        { title: 'Calm Music', icon: Music, action: 'music', color: 'bg-purple-500' }
      );
    } else if (selectedMood === 'lonely') {
      recommendations.push(
        { title: 'Call Family', icon: Phone, action: 'call', color: 'bg-pink-500' },
        { title: 'Memory Sharing', icon: Heart, action: 'memory', color: 'bg-red-500' }
      );
    } else if (selectedMood === 'sad') {
      recommendations.push(
        { title: 'View Memories', icon: Heart, action: 'memories', color: 'bg-purple-500' },
        { title: 'Listen to Music', icon: Music, action: 'music', color: 'bg-blue-500' }
      );
    }

    // Add music if available
    if (intervention.music && intervention.music.length > 0) {
      recommendations.push({
        title: 'Play Music',
        icon: Music,
        action: 'music',
        color: 'bg-indigo-500'
      });
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
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

  return (
    <Card className="border-2 border-pink-200 bg-white/90 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h2 className="text-2xl font-bold text-foreground">
              Activities for You
            </h2>
          </div>

          <p className="text-lg text-muted-foreground">
            Based on how you're feeling, here are some things that might help:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <Button
                  key={index}
                  onClick={() => handleAction(rec.action)}
                  className={`
                    h-24 text-lg font-semibold
                    ${rec.color} hover:opacity-90 text-white
                    shadow-md hover:shadow-lg transition-all
                    flex flex-col items-center justify-center gap-2
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span>{rec.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
