import type { EmotionalState, InterventionType, RecommendedActivity, MusicRecommendation, Intervention, EmotionalAnalysis } from '@/types/eeg';

// Map emotional states to intervention types
const stateToInterventionMap: Record<EmotionalState, InterventionType> = {
  calm: 'mood-boost',
  neutral: 'mood-boost',
  relaxed: 'mood-boost',
  lonely: 'social-nudge',
  stressed: 'breathing-guidance',
  anxious: 'breathing-guidance',
  fear: 'grounding-support',
  fatigue: 'rest-prompt',
};

// Activity database
const activitiesDatabase: RecommendedActivity[] = [
  {
    id: '1',
    title: 'Video Call a Loved One',
    description: 'Reach out and connect with family or friends',
    duration: 15,
    icon: '👥',
    category: 'social',
  },
  {
    id: '2',
    title: 'Join Group Activity',
    description: 'Virtual group sessions with others your age',
    duration: 30,
    icon: '❤️',
    category: 'social',
  },
  {
    id: '3',
    title: 'Memory Sharing',
    description: 'Record and share your favorite memories',
    duration: 20,
    icon: '📖',
    category: 'memory',
  },
  {
    id: '4',
    title: 'Guided Meditation',
    description: '10-minute mindfulness session to center yourself',
    duration: 10,
    icon: '🧘',
    category: 'wellness',
  },
  {
    id: '5',
    title: 'Light Stretching',
    description: 'Gentle movements to improve circulation',
    duration: 15,
    icon: '🤸',
    category: 'activity',
  },
  {
    id: '6',
    title: 'Photo Album Review',
    description: 'Browse through cherished photos and memories',
    duration: 20,
    icon: '📸',
    category: 'memory',
  },
];

// Music database
const musicDatabase: MusicRecommendation[] = [
  {
    id: '1',
    title: "You've Got a Friend",
    artist: 'Carole King',
    emotionalTag: 'Uplifting',
    tagColor: 'bg-success',
  },
  {
    id: '2',
    title: 'Lean on Me',
    artist: 'Bill Withers',
    emotionalTag: 'Comforting',
    tagColor: 'bg-calm',
  },
  {
    id: '3',
    title: 'What a Wonderful World',
    artist: 'Louis Armstrong',
    emotionalTag: 'Joyful',
    tagColor: 'bg-primary',
  },
  {
    id: '4',
    title: 'Here Comes the Sun',
    artist: 'The Beatles',
    emotionalTag: 'Hopeful',
    tagColor: 'bg-success',
  },
  {
    id: '5',
    title: 'Bridge Over Troubled Water',
    artist: 'Simon & Garfunkel',
    emotionalTag: 'Comforting',
    tagColor: 'bg-calm',
  },
  {
    id: '6',
    title: 'Don\'t Worry Be Happy',
    artist: 'Bobby McFerrin',
    emotionalTag: 'Uplifting',
    tagColor: 'bg-success',
  },
  {
    id: '7',
    title: 'Somewhere Over the Rainbow',
    artist: 'Israel Kamakawiwo\'ole',
    emotionalTag: 'Calming',
    tagColor: 'bg-primary',
  },
];

// Get intervention type based on emotional state
export const getInterventionType = (state: EmotionalState): InterventionType => {
  return stateToInterventionMap[state] || 'mood-boost';
};

// Get recommended activities based on intervention type
export const getRecommendedActivities = (interventionType: InterventionType): RecommendedActivity[] => {
  const activityMap: Record<InterventionType, RecommendedActivity[]> = {
    'mood-boost': activitiesDatabase.filter(a => a.category === 'memory' || a.category === 'wellness'),
    'social-nudge': activitiesDatabase.filter(a => a.category === 'social'),
    'breathing-guidance': activitiesDatabase.filter(a => a.category === 'wellness'),
    'grounding-support': activitiesDatabase.filter(a => a.category === 'wellness' || a.category === 'memory'),
    'rest-prompt': activitiesDatabase.filter(a => a.category === 'wellness'),
  };
  
  return activityMap[interventionType] || [];
};

// Get music recommendations based on intervention type
export const getMusicRecommendations = (interventionType: InterventionType): MusicRecommendation[] => {
  const musicMap: Record<InterventionType, MusicRecommendation[]> = {
    'mood-boost': musicDatabase.filter(m => ['Uplifting', 'Joyful', 'Hopeful'].includes(m.emotionalTag)),
    'social-nudge': musicDatabase.filter(m => ['Comforting', 'Uplifting'].includes(m.emotionalTag)),
    'breathing-guidance': musicDatabase.filter(m => ['Calming', 'Comforting'].includes(m.emotionalTag)),
    'grounding-support': musicDatabase.filter(m => ['Comforting', 'Calming'].includes(m.emotionalTag)),
    'rest-prompt': musicDatabase.filter(m => ['Calming', 'Comforting'].includes(m.emotionalTag)),
  };
  
  return musicMap[interventionType] || [];
};

// Get breathing exercise for stress/anxiety
export const getBreathingExercise = () => ({
  title: '4-7-8 Breathing Exercise',
  duration: 5,
  steps: [
    'Inhale through your nose for 4 counts',
    'Hold your breath for 7 counts',
    'Exhale through your mouth for 8 counts',
    'Repeat 4-5 times',
  ],
});

// Get grounding content for fear
export const getGroundingContent = () => ({
  title: 'Grounding Support',
  message: 'You are safe. Take a moment to breathe. Focus on the present moment. Everything is okay.',
});

// Get full intervention based on emotional state
export const getIntervention = (analysis: EmotionalAnalysis): Intervention => {
  const interventionType = getInterventionType(analysis.state);
  const activities = getRecommendedActivities(interventionType).slice(0, 3);
  const music = getMusicRecommendations(interventionType).slice(0, 4);

  const interventionConfig: Record<InterventionType, Omit<Intervention, 'type'>> = {
    'mood-boost': {
      title: 'Mood Boost',
      description: 'Plays uplifting or familiar audio/video to reinforce positive emotional states.',
      activities,
      music,
    },
    'social-nudge': {
      title: 'Social Nudge',
      description: 'Encourages connection through prompts like "call a friend" or simple engagement cues.',
      activities,
      music,
    },
    'breathing-guidance': {
      title: 'Breathing Guidance',
      description: 'Delivers short, guided breathing or grounding exercises to reduce tension.',
      activities,
      music,
      breathingExercise: getBreathingExercise(),
    },
    'grounding-support': {
      title: 'Grounding Support',
      description: 'Provides reassuring audio/video to help reduce panic and reestablish emotional safety.',
      activities,
      music,
      groundingContent: getGroundingContent(),
    },
    'rest-prompt': {
      title: 'Rest Prompt',
      description: 'Gently suggests rest or a break when low-energy patterns are detected.',
      activities,
      music,
    },
  };

  return {
    type: interventionType,
    ...interventionConfig[interventionType],
  };
};
