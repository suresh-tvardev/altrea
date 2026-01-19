import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EmotionalAnalysis } from '@/types/eeg';
import { getIntervention } from '@/services/interventionService';
import { Sparkles, Heart, Shield, Moon, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterventionDialogProps {
  analysis: EmotionalAnalysis;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const interventionIcons = {
  'mood-boost': Sparkles,
  'social-nudge': Users,
  'breathing-guidance': Heart,
  'grounding-support': Shield,
  'rest-prompt': Moon,
};

export const InterventionDialog = ({ analysis, open, onOpenChange }: InterventionDialogProps) => {
  const navigate = useNavigate();
  
  const intervention = useMemo(() => {
    try {
      return getIntervention(analysis);
    } catch (error) {
      console.error('Error getting intervention:', error);
      return {
        type: 'mood-boost' as const,
        title: 'Support Available',
        description: 'We\'re here to help',
        activities: [],
        music: [],
      };
    }
  }, [analysis]);

  if (!intervention) {
    return null;
  }

  const Icon = interventionIcons[intervention.type] || interventionIcons['mood-boost'];
  const isCritical = ['breathing-guidance', 'grounding-support'].includes(intervention.type);

  const handleViewRecommendations = () => {
    onOpenChange(false);
    navigate('/interventions');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              isCritical ? "bg-alert/10" : "bg-primary/10"
            )}>
              <Icon className={cn(
                "w-6 h-6",
                isCritical ? "text-alert" : "text-primary"
              )} />
            </div>
            <div>
              <DialogTitle className="text-xl">{intervention.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            {intervention.description}
          </DialogDescription>
          <DialogDescription className="text-sm pt-2">
            We have personalized recommendations to help support you right now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dismiss
          </Button>
          <Button onClick={handleViewRecommendations}>
            View Recommendations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
