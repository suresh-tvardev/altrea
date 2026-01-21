"use client";

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp, Heart, Smile } from 'lucide-react';
import type { EEGReading, MoodSelection } from '@/types/eeg';
import { cn } from '@/lib/utils';

interface ElderPersonalStatsProps {
  historicalData: EEGReading[];
  selectedMood: MoodSelection;
}

export const ElderPersonalStats = ({ historicalData, selectedMood }: ElderPersonalStatsProps) => {
  const stats = useMemo(() => {
    // Calculate calm days this week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentData = historicalData.filter(
      reading => new Date(reading.timestamp) >= weekAgo
    );

    // Count days with calm readings (simplified - using calm level > 50)
    const calmDays = new Set<string>();
    recentData.forEach(reading => {
      // Simple heuristic: if stress is low, consider it a calm day
      const date = new Date(reading.timestamp).toDateString();
      if (reading.alpha > 10 && reading.beta < 20) {
        calmDays.add(date);
      }
    });

    const calmDaysCount = calmDays.size;
    const totalDays = 7;
    
    return {
      calmDaysThisWeek: calmDaysCount,
      totalDays,
      moodEmoji: selectedMood === 'happy' ? '😊' : 
                 selectedMood === 'calm' ? '😌' :
                 selectedMood === 'stressed' ? '😰' :
                 selectedMood === 'lonely' ? '💙' :
                 selectedMood === 'sad' ? '😢' : '😊',
    };
  }, [historicalData, selectedMood]);

  return (
    <Card className="border-2 border-pink-200 bg-white/90 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Today's Mood */}
          <div className="text-center">
            <div className="text-6xl mb-2">{stats.moodEmoji}</div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedMood 
                ? `You're feeling ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} today`
                : "How are you feeling today?"}
            </h2>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-pink-100">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Smile className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-900">Calm Days</span>
              </div>
              <div className="text-4xl font-bold text-green-700">
                {stats.calmDaysThisWeek}
              </div>
              <div className="text-sm text-green-600 mt-1">
                out of {stats.totalDays} days this week
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-blue-900">This Week</span>
              </div>
              <div className="text-4xl font-bold text-blue-700">
                {stats.calmDaysThisWeek > 3 ? 'Great!' : stats.calmDaysThisWeek > 1 ? 'Good!' : 'Keep going!'}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                You're doing well!
              </div>
            </div>
          </div>

          {/* Encouraging Message */}
          <div className="text-center pt-4 border-t border-pink-100">
            <p className="text-lg text-muted-foreground">
              {stats.calmDaysThisWeek >= 5 
                ? "🌟 You've had a wonderful week! Keep up the great work!"
                : stats.calmDaysThisWeek >= 3
                ? "✨ You're doing great! Every day is a step forward."
                : "💪 Every day is a new opportunity. You've got this!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
