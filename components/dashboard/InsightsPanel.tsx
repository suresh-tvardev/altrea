import { cn } from '@/lib/utils';
import type { Insight } from '@/types/eeg';
import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface InsightsPanelProps {
  insights: Insight[];
}

const insightConfig = {
  positive: {
    icon: TrendingUp,
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    iconColor: 'text-success',
  },
  suggestion: {
    icon: Lightbulb,
    bgColor: 'bg-calm/10',
    borderColor: 'border-calm/30',
    iconColor: 'text-calm',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
  },
};

export const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Personalized Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map(insight => {
          const config = insightConfig[insight.type];
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  config.bgColor
                )}>
                  <Icon className={cn("w-5 h-5", config.iconColor)} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
