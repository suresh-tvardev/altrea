import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Sparkles } from 'lucide-react';
import type { EmotionalAnalysis } from '@/types/eeg';
import { getIntervention } from '@/services/interventionService';
import { RecommendedActivities } from '@/components/dashboard/RecommendedActivities';
import { MusicRecommendations } from '@/components/dashboard/MusicRecommendations';
import { BreathingGuidance } from '@/components/dashboard/BreathingGuidance';
import { GroundingSupport } from '@/components/dashboard/GroundingSupport';
import { useEEGSimulation } from '@/hooks/useEEGSimulation';

const Interventions = () => {
  const { analysis } = useEEGSimulation();
  const intervention = useMemo(() => getIntervention(analysis), [analysis]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Recommended Interventions"
          description="Personalized support based on your current emotional state"
          icon={Sparkles}
          backTo="/"
        />

        {/* Intervention Content */}
        <div className="space-y-6">
          {/* Breathing Guidance (for stress/anxiety) */}
          {intervention.breathingExercise && (
            <BreathingGuidance intervention={intervention} />
          )}

          {/* Grounding Support (for fear) */}
          {intervention.groundingContent && (
            <GroundingSupport intervention={intervention} />
          )}

          {/* Recommended Activities */}
          {intervention.activities && intervention.activities.length > 0 && (
            <RecommendedActivities activities={intervention.activities} />
          )}

          {/* Music Recommendations */}
          {intervention.music && intervention.music.length > 0 && (
            <MusicRecommendations music={intervention.music} />
          )}
        </div>
    </div>
  );
};

export default Interventions;
