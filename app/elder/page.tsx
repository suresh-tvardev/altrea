"use client";

import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { SelfSelectMood } from '@/components/elder/SelfSelectMood';
import { ElderDashboard } from '@/components/elder/ElderDashboard';
import { storageService } from '@/services/storage';
import type { MoodSelection } from '@/types/eeg';

export default function ElderPage() {
  const { isElder, loading: roleLoading } = useRole();
  const router = useRouter();
  const [moodSelected, setMoodSelected] = useState<MoodSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for role to load before redirect logic – avoids redirect loop when role is null on mount
    if (roleLoading) return;

    if (!isElder) {
      router.replace('/');
      return;
    }

    // Check if mood was already selected today
    const todayMood = storageService.getElderMoodSelection();
    setMoodSelected(todayMood);
    setIsLoading(false);
  }, [isElder, roleLoading, router]);

  const handleMoodSelected = (mood: MoodSelection) => {
    storageService.saveElderMoodSelection(mood);
    setMoodSelected(mood);
  };

  if (roleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show mood selection if not selected today
  if (!moodSelected) {
    return <SelfSelectMood onMoodSelected={handleMoodSelected} />;
  }

  // Show dashboard after mood selection
  return <ElderDashboard selectedMood={moodSelected} />;
}
