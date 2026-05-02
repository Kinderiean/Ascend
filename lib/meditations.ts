export interface Meditation {
  id: string;
  title: string;
  duration: string;
  description: string;
  benefit: string;
  youtubeSearchUrl: string;
}

export const MEDITATIONS: Meditation[] = [
  {
    id: 'mindfulness-breathing',
    title: 'Mindfulness Breathing',
    duration: '10 min',
    description: 'Focus entirely on the breath — its rhythm, texture, and sensation. When the mind drifts, return without judgment.',
    benefit: 'Reduces anxiety, builds present-moment awareness, calms the nervous system.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=headspace+mindfulness+breathing+10+min',
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    duration: '20 min',
    description: 'Slowly move attention from head to toe, noticing sensations without trying to change them.',
    benefit: 'Releases physical tension, improves sleep quality, reconnects mind and body.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=body+scan+meditation+sleep+guided',
  },
  {
    id: 'loving-kindness',
    title: 'Loving-Kindness (Metta)',
    duration: '15 min',
    description: 'Silently send goodwill — first to yourself, then to others, then outward to all beings.',
    benefit: 'Builds compassion, dissolves resentment, elevates mood and emotional resilience.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=loving+kindness+meditation+guided+Tara+Brach',
  },
  {
    id: 'vipassana',
    title: 'Vipassana / Insight',
    duration: '30 min',
    description: 'Observe thoughts, sensations and emotions as they arise and pass — without identification.',
    benefit: 'Develops deep equanimity, reduces reactivity, builds long-term mental clarity.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=vipassana+insight+meditation+guided',
  },
  {
    id: 'yoga-nidra',
    title: 'Yoga Nidra',
    duration: '20 min',
    description: 'A guided "yogic sleep" that walks you through each body part and layer of consciousness while staying awake.',
    benefit: 'One hour equals four hours of sleep in restorative power. Ideal for recovery days.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=yoga+nidra+20+min+guided',
  },
  {
    id: 'box-breathing',
    title: 'Box Breathing (4-4-4-4)',
    duration: '5 min',
    description: 'Inhale 4 counts, hold 4, exhale 4, hold 4. Used by Navy SEALs to control adrenaline under pressure.',
    benefit: 'Instantly lowers cortisol, sharpens focus, resets the nervous system between stressful tasks.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=box+breathing+4+4+4+4+Andrew+Huberman',
  },
  {
    id: '4-7-8-breathing',
    title: '4-7-8 Breathing',
    duration: '5 min',
    description: 'Inhale 4, hold 7, exhale 8. The extended exhale activates the parasympathetic nervous system.',
    benefit: 'Fastest natural method to calm anxiety. Highly effective before bed or high-stakes moments.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=4+7+8+breathing+technique+Dr+Weil',
  },
  {
    id: 'mantra',
    title: 'Mantra / So Hum',
    duration: '15 min',
    description: 'Repeat "So Hum" (I am that) silently on each breath — an ancient Vedic technique for dissolving ego identification.',
    benefit: 'Quiets mental chatter, creates a sense of connection and identity beyond the thinking mind.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=so+hum+mantra+meditation+guided',
  },
  {
    id: 'visualization',
    title: 'Visualization',
    duration: '10 min',
    description: 'Vividly imagine your goal already achieved — the feeling, the environment, the version of yourself who made it.',
    benefit: 'Primes the brain for action, builds confidence, reinforces identity-level change.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=visualization+guided+meditation+success',
  },
  {
    id: 'walking-meditation',
    title: 'Walking / Movement',
    duration: '20 min',
    description: 'Walk slowly and deliberately, feeling each foot contact the ground — outdoor preferred.',
    benefit: 'Combines physical movement with mindfulness. Ideal if sitting meditation feels impossible.',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=walking+meditation+mindfulness+Thich+Nhat+Hanh',
  },
];
