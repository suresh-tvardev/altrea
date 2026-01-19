import { useMemo } from 'react';
import type { EmotionalAnalysis } from '@/types/eeg';
import { getIntervention } from '@/services/interventionService';
import { RecommendedActivities } from './RecommendedActivities';
import { MusicRecommendations } from './MusicRecommendations';
import { BreathingGuidance } from './BreathingGuidance';
import { GroundingSupport } from './GroundingSupport';

interface InterventionsPanelProps {
  analysis: EmotionalAnalysis;
}

export const InterventionsPanel = ({ analysis }: InterventionsPanelProps) => {
  const intervention = useMemo(() => getIntervention(analysis), [analysis]);

  return (
    <div className="space-y-6">
      {/* Recommended Activities */}
      {intervention.activities && intervention.activities.length > 0 && (
        <RecommendedActivities activities={intervention.activities} />
      )}

      {/* Music Recommendations */}
      {intervention.music && intervention.music.length > 0 && (
        <MusicRecommendations music={intervention.music} />
      )}

      {/* Breathing Guidance (for stress/anxiety) */}
      {intervention.breathingExercise && (
        <BreathingGuidance intervention={intervention} />
      )}

      {/* Grounding Support (for fear) */}
      {intervention.groundingContent && (
        <GroundingSupport intervention={intervention} />
      )}
    </div>
  );
};
