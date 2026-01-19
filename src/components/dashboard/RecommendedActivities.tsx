import { cn } from '@/lib/utils';
import type { RecommendedActivity } from '@/types/eeg';
import { Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RecommendedActivitiesProps {
  activities: RecommendedActivity[];
}

export const RecommendedActivities = ({ activities }: RecommendedActivitiesProps) => {
  const { toast } = useToast();

  const handleActivityClick = (activity: RecommendedActivity) => {
    toast({
      title: `Starting ${activity.title}`,
      description: activity.description,
    });
    // In a real app, this would trigger the actual activity
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recommended Activities
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer group"
            onClick={() => handleActivityClick(activity)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {activity.title}
                  </h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full whitespace-nowrap">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{activity.duration} min</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivityClick(activity);
                    }}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
