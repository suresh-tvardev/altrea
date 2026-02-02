"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smile, Frown, Heart, Sun, Cloud, Droplets, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MoodSelection } from '@/types/eeg';

interface SelfSelectMoodProps {
  onMoodSelected: (mood: MoodSelection) => void;
}

export const SelfSelectMood = ({ onMoodSelected }: SelfSelectMoodProps) => {
  const [step, setStep] = useState<'initial' | 'good' | 'bad'>('initial');

  const handleInitialSelection = (selection: 'good' | 'bad') => {
    setStep(selection);
  };

  const handleMoodSelect = (mood: MoodSelection) => {
    onMoodSelected(mood);
  };

  if (step === 'initial') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50/50 via-white to-rose-50/50 p-4">
        <Card className="w-full max-w-2xl border border-sky-200/60 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  How are you feeling today?
                </h1>
                <p className="text-xl text-muted-foreground">
                  Let's start your day together
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handleInitialSelection('good')}
                  className={cn(
                    "h-32 md:h-40 text-2xl md:text-3xl font-bold",
                    "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Smile className="w-12 h-12 md:w-16 md:h-16" />
                  <span>GOOD</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleInitialSelection('bad')}
                  className={cn(
                    "h-32 md:h-40 text-2xl md:text-3xl font-bold",
                    "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Frown className="w-12 h-12 md:w-16 md:h-16" />
                  <span>BAD</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'good') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50/50 via-white to-rose-50/50 p-4">
        <Card className="w-full max-w-2xl border border-sky-200/60 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <Button
                variant="ghost"
                onClick={() => setStep('initial')}
                className="mb-4"
              >
                ← Back
              </Button>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  That's wonderful! Tell us more...
                </h2>
                <p className="text-xl text-muted-foreground">
                  Which best describes how you're feeling?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handleMoodSelect('happy')}
                  className={cn(
                    "h-32 md:h-40 text-xl md:text-2xl font-bold",
                    "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Sun className="w-12 h-12 md:w-16 md:h-16" />
                  <span>Happy</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleMoodSelect('calm')}
                  className={cn(
                    "h-32 md:h-40 text-xl md:text-2xl font-bold",
                    "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Droplets className="w-12 h-12 md:w-16 md:h-16" />
                  <span>Calm</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'bad') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50/50 via-white to-rose-50/50 p-4">
        <Card className="w-full max-w-2xl border border-sky-200/60 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <Button
                variant="ghost"
                onClick={() => setStep('initial')}
                className="mb-4"
              >
                ← Back
              </Button>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  We're here to help. What's going on?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Which best describes how you're feeling?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handleMoodSelect('stressed')}
                  className={cn(
                    "h-32 md:h-40 text-lg md:text-xl font-bold",
                    "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <AlertCircle className="w-10 h-10 md:w-12 md:h-12" />
                  <span>Stressed</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleMoodSelect('lonely')}
                  className={cn(
                    "h-32 md:h-40 text-lg md:text-xl font-bold",
                    "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Heart className="w-10 h-10 md:w-12 md:h-12" />
                  <span>Lonely</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleMoodSelect('sad')}
                  className={cn(
                    "h-32 md:h-40 text-lg md:text-xl font-bold",
                    "bg-violet-50 border-violet-200 hover:bg-violet-100 text-violet-800",
                    "transition-all",
                    "flex flex-col items-center justify-center gap-4"
                  )}
                >
                  <Cloud className="w-10 h-10 md:w-12 md:h-12" />
                  <span>Sad</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
