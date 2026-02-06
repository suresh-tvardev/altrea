"use client";

import { useState, useEffect } from 'react';
import { SelfSelectMood } from '@/components/elder/SelfSelectMood';
import { ElderDashboard } from '@/components/elder/ElderDashboard';
import { storageService } from '@/services/storage';
import { getElderForAccount } from '@/app/actions/settings';
import type { MoodSelection } from '@/types/eeg';

export default function ElderPage() {
  const [moodSelected, setMoodSelected] = useState<MoodSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [elder, setElder] = useState<{ name: string; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    // Check if mood was already selected today
    const todayMood = storageService.getElderMoodSelection();
    setMoodSelected(todayMood);

    // Fetch elder data including avatar
    const loadElderData = async () => {
      const elderData = await getElderForAccount();
      if (elderData) {
        setElder({
          name: elderData.name,
          avatarUrl: elderData.avatarUrl,
        });
      } else {
        // Fallback if no data
        setElder({ name: 'Maria Garcia', avatarUrl: '/images/profile/maria.jpg' });
      }
      setIsLoading(false);
    };

    loadElderData();
  }, []);

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
  return <ElderDashboard selectedMood={moodSelected} elderName={elder?.name} elderAvatarUrl={elder?.avatarUrl} />;
}
