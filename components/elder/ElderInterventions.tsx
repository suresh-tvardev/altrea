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

    // Soft pastel colors - subtle, not flashy
    const colors = {
      breathing: 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100',
      music: 'bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100',
      call: 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100',
      photo: 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100',
      journal: 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100',
      memory: 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100',
      memories: 'bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100',
      default: 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100',
    };

    // Priority recommendations based on stress level
    if (stressCategory === 'critical' || stressCategory === 'high') {
      recommendations.push(
        { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: colors.breathing, priority: 1 },
        { title: 'Calm Music', icon: Music, action: 'music', color: colors.music, priority: 2 },
        { title: 'Call Family', icon: Phone, action: 'call', color: colors.call, priority: 3 }
      );
    } else if (stressCategory === 'moderate') {
      recommendations.push(
        { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: colors.breathing, priority: 1 },
        { title: 'Calm Music', icon: Music, action: 'music', color: colors.music, priority: 2 }
      );
    }

    // Based on selected mood (if not already covered by stress level)
    if (stressCategory !== 'critical' && stressCategory !== 'high') {
      if (selectedMood === 'happy' || selectedMood === 'calm') {
        recommendations.push(
          { title: 'Capture This Moment', icon: Heart, action: 'photo', color: colors.photo, priority: 3 },
          { title: 'Gratitude Journal', icon: Sparkles, action: 'journal', color: colors.journal, priority: 4 }
        );
      } else if (selectedMood === 'stressed') {
        recommendations.push(
          { title: 'Breathing Exercise', icon: Volume2, action: 'breathing', color: colors.breathing, priority: 1 },
          { title: 'Calm Music', icon: Music, action: 'music', color: colors.music, priority: 2 }
        );
      } else if (selectedMood === 'lonely') {
        recommendations.push(
          { title: 'Call Family', icon: Phone, action: 'call', color: colors.call, priority: 1 },
          { title: 'Memory Sharing', icon: Heart, action: 'memory', color: colors.memory, priority: 2 }
        );
      } else if (selectedMood === 'sad') {
        recommendations.push(
          { title: 'View Memories', icon: Heart, action: 'memories', color: colors.memories, priority: 1 },
          { title: 'Listen to Music', icon: Music, action: 'music', color: colors.music, priority: 2 }
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
          color: colors.default,
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
      "border bg-white/95 shadow-sm transition-all duration-500",
      isHighStress ? "border-rose-200" : "border-sky-200/60"
    )}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {isHighStress ? (
              <AlertCircle className="w-6 h-6 text-rose-600" />
            ) : (
              <Sparkles className="w-6 h-6 text-sky-500" />
            )}
            <h2 className={cn(
              "text-2xl font-bold transition-colors duration-500",
              isHighStress ? "text-rose-700" : "text-foreground"
            )}>
              {isHighStress ? "Calming Activities for You" : "Activities for You"}
            </h2>
          </div>

          <p className={cn(
            "text-lg transition-colors duration-500",
            isHighStress ? "text-rose-600 font-medium" : "text-muted-foreground"
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
                  variant="outline"
                  onClick={() => handleAction(rec.action)}
                  className={cn(
                    "h-24 text-lg font-semibold",
                    rec.color,
                    "transition-all",
                    "flex flex-col items-center justify-center gap-2"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span>{rec.title}</span>
                  {isPriority && (
                    <span className="text-xs font-normal opacity-80">Try this first</span>
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
