import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Intervention } from '@/types/eeg';

interface GroundingSupportProps {
  intervention: Intervention;
}

export const GroundingSupport = ({ intervention }: GroundingSupportProps) => {
  const { toast } = useToast();

  if (!intervention.groundingContent) {
    return null;
  }

  const handlePlay = () => {
    toast({
      title: 'Playing Grounding Content',
      description: 'Reassuring audio is now playing',
    });
  };

  return (
    <Card className="border-border bg-calm/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-calm" />
          {intervention.groundingContent.title}
        </CardTitle>
        <CardDescription>{intervention.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-foreground leading-relaxed">
            {intervention.groundingContent.message}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Grounding Techniques:</p>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Focus on your breathing - slow and steady</li>
            <li>Name 5 things you can see around you</li>
            <li>Feel the ground beneath your feet</li>
            <li>Remember: You are safe and secure</li>
          </ul>
        </div>

        <Button onClick={handlePlay} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Play Reassuring Audio
        </Button>
      </CardContent>
    </Card>
  );
};
