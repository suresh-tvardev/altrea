import { cn } from '@/lib/utils';
import type { EmotionalState, EmotionalAnalysis } from '@/types/eeg';
import { Heart, Brain, Smile, AlertTriangle, Sparkles, Users, Shield, Moon } from 'lucide-react';

interface EmotionalStateIndicatorProps {
  analysis: EmotionalAnalysis;
}

const stateConfig: Record<EmotionalState, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  description: string;
}> = {
  calm: {
    label: 'Calm',
    color: 'text-calm',
    bgColor: 'bg-calm/10',
    icon: Smile,
    description: 'Relaxed and peaceful state',
  },
  neutral: {
    label: 'Neutral',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: Brain,
    description: 'Balanced emotional state',
  },
  stressed: {
    label: 'Stressed',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: AlertTriangle,
    description: 'Elevated stress detected',
  },
  anxious: {
    label: 'Anxious',
    color: 'text-alert',
    bgColor: 'bg-alert/10',
    icon: Heart,
    description: 'Anxiety patterns present',
  },
  relaxed: {
    label: 'Relaxed',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: Sparkles,
    description: 'Deep relaxation state',
  },
  lonely: {
    label: 'Lonely',
    color: 'text-calm',
    bgColor: 'bg-calm/10',
    icon: Users,
    description: 'Feeling disconnected or isolated',
  },
  fear: {
    label: 'Fear',
    color: 'text-alert',
    bgColor: 'bg-alert/10',
    icon: Shield,
    description: 'Heightened fear or panic detected',
  },
  fatigue: {
    label: 'Fatigue',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    icon: Moon,
    description: 'Low energy patterns detected',
  },
};

export const EmotionalStateIndicator = ({ analysis }: EmotionalStateIndicatorProps) => {
  const config = stateConfig[analysis.state];
  const Icon = config.icon;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Current Emotional State</h3>

      <div className={cn(
        "flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-xl transition-all duration-500 text-center sm:text-left",
        config.bgColor
      )}>
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center animate-pulse-gentle shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-8 h-8", config.color)} />
        </div>

        <div className="flex-1">
          <span className={cn("text-2xl font-bold", config.color)}>
            {config.label}
          </span>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
      </div>
    </div>
  );
};
