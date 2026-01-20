import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Intervention } from '@/types/eeg';

interface BreathingGuidanceProps {
  intervention: Intervention;
}

export const BreathingGuidance = ({ intervention }: BreathingGuidanceProps) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  if (!intervention.breathingExercise) {
    return null;
  }

  const { breathingExercise } = intervention;

  const handleStart = () => {
    setIsActive(true);
    toast({
      title: 'Breathing Exercise Started',
      description: 'Follow the guided breathing pattern',
    });
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentStep(0);
    setPhase('inhale');
  };

  const phaseConfig = {
    inhale: { label: 'Inhale', duration: 4, color: 'bg-success' },
    hold: { label: 'Hold', duration: 7, color: 'bg-warning' },
    exhale: { label: 'Exhale', duration: 8, color: 'bg-primary' },
  };

  const currentPhase = phaseConfig[phase];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🧘</span>
          {breathingExercise.title}
        </CardTitle>
        <CardDescription>{intervention.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6">
          {isActive ? (
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary mb-2">
                {currentPhase.label}
              </div>
              <div className="text-6xl font-bold text-muted-foreground">
                {currentPhase.duration}
              </div>
              <div className={cn(
                "w-32 h-32 mx-auto rounded-full transition-all duration-1000",
                currentPhase.color,
                "opacity-20"
              )} />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl text-muted-foreground">Ready to begin?</div>
              <div className="text-sm text-muted-foreground">
                This exercise will help reduce tension and promote calm
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {breathingExercise.steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border text-sm",
                index === currentStep && isActive
                  ? "bg-primary/10 border-primary"
                  : "bg-secondary/30 border-border"
              )}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={handleStart} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Exercise
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleStop} className="flex-1">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline" onClick={handleStop}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
