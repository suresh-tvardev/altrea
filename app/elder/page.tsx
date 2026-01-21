"use client";

import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { SelfSelectMood } from '@/components/elder/SelfSelectMood';
import { ElderDashboard } from '@/components/elder/ElderDashboard';
import { storageService } from '@/services/storage';
import type { MoodSelection } from '@/types/eeg';

export default function ElderPage() {
  const { isElder } = useRole();
  const router = useRouter();
  const [moodSelected, setMoodSelected] = useState<MoodSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not in elder role
    if (!isElder) {
      router.push('/');
      return;
    }

    // Check if mood was already selected today
    const todayMood = storageService.getElderMoodSelection();
    setMoodSelected(todayMood);
    setIsLoading(false);
  }, [isElder, router]);

  const handleMoodSelected = (mood: MoodSelection) => {
    storageService.saveElderMoodSelection(mood);
    setMoodSelected(mood);
  };

  if (isLoading) {
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
