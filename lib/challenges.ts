export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  xpReward: number;
  category: string;
  icon: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'fast-3d',
    title: '3-Day Fast',
    description: 'Water only for 72 hours. Medical-grade mental reset and discipline builder.',
    durationDays: 3,
    xpReward: 500,
    category: 'Discipline',
    icon: '⚡',
  },
  {
    id: 'cold-7d',
    title: '7-Day Cold Showers',
    description: 'Full cold, every day, 7 days straight. No warm-up, no compromise.',
    durationDays: 7,
    xpReward: 200,
    category: 'Discipline',
    icon: '🧊',
  },
  {
    id: 'nophone-am',
    title: 'No Phone Morning',
    description: 'No phone for the first 2 hours after waking. 7 days. Own your morning.',
    durationDays: 7,
    xpReward: 150,
    category: 'Mental',
    icon: '📵',
  },
  {
    id: 'nosugar-7d',
    title: 'No Sugar Week',
    description: 'Zero added sugar. Read every label. 7 days of clean eating.',
    durationDays: 7,
    xpReward: 175,
    category: 'Physical',
    icon: '🚫',
  },
  {
    id: '10k-steps-14d',
    title: '10K Steps — 14 Days',
    description: '10,000 steps every single day for two weeks. No days off.',
    durationDays: 14,
    xpReward: 300,
    category: 'Physical',
    icon: '👣',
  },
  {
    id: 'journal-21d',
    title: '21-Day Journal',
    description: "Write 3 things you're grateful for every morning for 21 days.",
    durationDays: 21,
    xpReward: 350,
    category: 'Mental',
    icon: '📓',
  },
  {
    id: 'noscroll-3d',
    title: '3-Day Social Detox',
    description: 'No Instagram, TikTok, YouTube Shorts. 72 hours of reclaimed attention.',
    durationDays: 3,
    xpReward: 175,
    category: 'Mental',
    icon: '🔕',
  },
  {
    id: 'sleep-10pm',
    title: '10PM Bedtime — 7 Days',
    description: 'In bed by 22:00. No exceptions. 7 days of real recovery.',
    durationDays: 7,
    xpReward: 200,
    category: 'Routine',
    icon: '🌙',
  },
  {
    id: 'reading-30m',
    title: '30-Min Read — 14 Days',
    description: '30 minutes of focused reading daily for 14 days. No audiobooks.',
    durationDays: 14,
    xpReward: 250,
    category: 'Knowledge',
    icon: '📚',
  },
  {
    id: '75-hard-lite',
    title: '75 Hard (Lite)',
    description: '2 workouts/day, clean diet, 10 pages reading, progress photo. 7 days, zero compromise.',
    durationDays: 7,
    xpReward: 600,
    category: 'Discipline',
    icon: '🔥',
  },
];
