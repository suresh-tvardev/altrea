import { cn } from '@/lib/utils';
import type { HistoricalData } from '@/types/eeg';
import { TrendingUp, TrendingDown, Minus, Clock, Heart, Brain } from 'lucide-react';

interface QuickStatsProps {
  data: HistoricalData[];
}

export const QuickStats = ({ data }: QuickStatsProps) => {
  if (!data || data.length < 2) {
    return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-32 animate-pulse bg-muted/20 rounded-2xl" />;
  }

  const today = data[data.length - 1];
  const yesterday = data[data.length - 2];

  const calmTrend = today.avgCalm - yesterday.avgCalm;
  const stressTrend = today.avgStress - yesterday.avgStress;

  const stats = [
    {
      label: 'Avg. Calm Today',
      value: `${Math.round(today.avgCalm)}%`,
      trend: calmTrend,
      icon: Heart,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Avg. Stress Today',
      value: `${Math.round(today.avgStress)}%`,
      trend: stressTrend,
      icon: Brain,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      invertTrend: true,
    },
    {
      label: 'Monitoring Time',
      value: '8h 24m',
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend
          ? (stat.trend > 0 ? TrendingUp : TrendingDown)
          : Minus;
        const trendPositive = stat.invertTrend
          ? stat.trend && stat.trend < 0
          : stat.trend && stat.trend > 0;

        return (
          <div
            key={index}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgColor)}>
                <Icon className={cn("w-6 h-6", stat.color)} />
              </div>
              {stat.trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trendPositive ? "text-success" : "text-alert"
                )}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(Math.round(stat.trend))}%</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
