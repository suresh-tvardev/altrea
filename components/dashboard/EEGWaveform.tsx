import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { EEGReading } from '@/types/eeg';

interface EEGWaveformProps {
  readings: EEGReading[];
  isConnected: boolean;
}

export const EEGWaveform = ({ readings, isConnected }: EEGWaveformProps) => {
  const chartData = useMemo(() => 
    readings.slice(-30).map((r, i) => ({
      time: i,
      alpha: r.alpha,
      beta: r.beta,
      theta: r.theta,
    })),
    [readings]
  );

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Live EEG Activity</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              labelStyle={{ display: 'none' }}
            />
            <Line 
              type="monotone" 
              dataKey="alpha" 
              stroke="hsl(var(--chart-calm))" 
              strokeWidth={2} 
              dot={false}
              name="Alpha"
            />
            <Line 
              type="monotone" 
              dataKey="beta" 
              stroke="hsl(var(--chart-stress))" 
              strokeWidth={2} 
              dot={false}
              name="Beta"
            />
            <Line 
              type="monotone" 
              dataKey="theta" 
              stroke="hsl(var(--chart-neutral))" 
              strokeWidth={2} 
              dot={false}
              name="Theta"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <Legend color="bg-chart-calm" label="Alpha (8-13 Hz)" />
        <Legend color="bg-chart-stress" label="Beta (13-30 Hz)" />
        <Legend color="bg-chart-neutral" label="Theta (4-8 Hz)" />
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
