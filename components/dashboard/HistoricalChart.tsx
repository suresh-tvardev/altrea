import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import type { HistoricalData } from '@/types/eeg';
import { Calendar } from 'lucide-react';

interface HistoricalChartProps {
  data: HistoricalData[];
}

export const HistoricalChart = ({ data }: HistoricalChartProps) => {
  return (
    <div className="h-full flex flex-col bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Weekly Overview</h3>
      </div>

      <div className="flex-1 min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="calmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-relaxed))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-relaxed))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-stress))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-stress))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="anxietyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-anxiety))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-anxiety))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="avgCalm" 
              stroke="hsl(var(--chart-relaxed))" 
              fillOpacity={1}
              fill="url(#calmGradient)"
              strokeWidth={2}
              name="Calm Level"
            />
            <Area 
              type="monotone" 
              dataKey="avgStress" 
              stroke="hsl(var(--chart-stress))" 
              fillOpacity={1}
              fill="url(#stressGradient)"
              strokeWidth={2}
              name="Stress Level"
            />
            <Area 
              type="monotone" 
              dataKey="avgAnxiety" 
              stroke="hsl(var(--chart-anxiety))" 
              fillOpacity={1}
              fill="url(#anxietyGradient)"
              strokeWidth={2}
              name="Anxiety Level"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 flex-shrink-0">
        <Legend color="bg-chart-relaxed" label="Calm" />
        <Legend color="bg-chart-stress" label="Stress" />
        <Legend color="bg-chart-anxiety" label="Anxiety" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);
