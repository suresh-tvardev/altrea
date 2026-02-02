"use client";

import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { SelfSelectMood } from '@/components/elder/SelfSelectMood';
import { ElderDashboard } from '@/components/elder/ElderDashboard';
import { storageService } from '@/services/storage';
import { isAuthenticatedButMissingProfile } from '@/app/actions/user';
import { getElderForAccount } from '@/app/actions/settings';
import type { MoodSelection } from '@/types/eeg';

export default function ElderPage() {
  const { isElder, loading: roleLoading } = useRole();
  const router = useRouter();
  const [moodSelected, setMoodSelected] = useState<MoodSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [elder, setElder] = useState<{ name: string; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    // Check if user is authenticated but missing profile
    const checkProfile = async () => {
      const needsSetup = await isAuthenticatedButMissingProfile();
      if (needsSetup) {
        router.replace('/setup');
        return;
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [router]);

  useEffect(() => {
    // Wait for profile check and role to load before redirect logic
    if (checkingProfile || roleLoading) return;

    if (!isElder) {
      // If user has a role but it's not elder, redirect to home
      // Home page will redirect them to the correct dashboard
      router.replace('/');
      return;
    }

    // Check if mood was already selected today
    const todayMood = storageService.getElderMoodSelection();
    setMoodSelected(todayMood);
    setIsLoading(false);

    // Fetch elder profile for name and avatar
    getElderForAccount().then((data) => {
      if (data) setElder({ name: data.name, avatarUrl: data.avatarUrl });
    });
  }, [isElder, roleLoading, checkingProfile, router]);

  const handleMoodSelected = (mood: MoodSelection) => {
    storageService.saveElderMoodSelection(mood);
    setMoodSelected(mood);
  };

  if (checkingProfile || roleLoading || isLoading) {
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
