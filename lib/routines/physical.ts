import {
  PhysicalBundle,
  PhysicalSession,
  PhysicalExercise,
  WarmupItem,
  CooldownItem,
  DayType,
} from './types';
import { WorkoutContext, FitnessProfile, BodyGoal } from '../profile';

type BodyPart = 'chest' | 'back' | 'shoulders' | 'arms' | 'quads' | 'hamstrings' | 'glutes' | 'core';

const WARMUPS: Record<BodyPart, WarmupItem[]> = {
  chest: [
    { name: 'Shoulder dislocates with band', reps: '15' },
    { name: 'Scap pushups', reps: '12' },
    { name: 'Band pull-aparts', reps: '20' },
    { name: 'Light pushups', reps: '10' },
  ],
  back: [
    { name: 'Cat-cow', reps: '10' },
    { name: 'Dead hangs', durationSec: 30 },
    { name: 'Band pull-aparts', reps: '20' },
    { name: 'Scap pulls (or scap pull-ups)', reps: '10' },
  ],
  shoulders: [
    { name: 'Arm circles forward', reps: '15' },
    { name: 'Arm circles backward', reps: '15' },
    { name: 'Shoulder dislocates', reps: '15' },
    { name: 'Wall slides', reps: '12' },
  ],
  arms: [
    { name: 'Wrist circles', reps: '15 each direction' },
    { name: 'Light band curls', reps: '20' },
    { name: 'Tricep band pushdowns', reps: '20' },
  ],
  quads: [
    { name: 'Bodyweight squats', reps: '20' },
    { name: 'Walking lunges', reps: '10 each leg' },
    { name: 'Leg swings forward', reps: '15 each' },
    { name: '90/90 hip switches', reps: '10 each side' },
  ],
  hamstrings: [
    { name: 'Romanian deadlift (light)', reps: '12' },
    { name: 'Leg swings', reps: '15 each' },
    { name: 'Glute bridges', reps: '15' },
    { name: 'Cossack squats', reps: '8 each side' },
  ],
  glutes: [
    { name: 'Glute bridges', reps: '15' },
    { name: 'Clamshells with band', reps: '15 each side' },
    { name: 'Monster walks', reps: '10 steps each direction' },
  ],
  core: [
    { name: 'Dead bug', reps: '10 each' },
    { name: 'Bird dog', reps: '10 each' },
    { name: 'Plank hold', durationSec: 30 },
  ],
};

const COOLDOWNS: Record<BodyPart, CooldownItem[]> = {
  chest: [
    { name: 'Doorway pec stretch', durationSec: 45, notes: '45s each side' },
    { name: 'Cross-body shoulder stretch', durationSec: 30 },
    { name: 'Cobra pose', durationSec: 30 },
  ],
  back: [
    { name: 'Lat hang', durationSec: 30, notes: 'Passive hang from a bar' },
    { name: "Child's pose", durationSec: 60 },
    { name: 'Thread the needle', durationSec: 30, notes: '30s each side' },
  ],
  shoulders: [
    { name: 'Cross-body deltoid stretch', durationSec: 30, notes: '30s each side' },
    { name: 'Sleeper stretch', durationSec: 30, notes: '30s each side' },
    { name: "Child's pose with arms extended", durationSec: 45 },
  ],
  arms: [
    { name: 'Tricep overhead stretch', durationSec: 30, notes: '30s each side' },
    { name: 'Wrist flexor stretch', durationSec: 20 },
    { name: 'Wrist extensor stretch', durationSec: 20 },
  ],
  quads: [
    { name: 'Standing quad stretch', durationSec: 30, notes: '30s each leg' },
    { name: 'Couch stretch', durationSec: 60, notes: '60s each side' },
    { name: 'Pigeon pose', durationSec: 45 },
  ],
  hamstrings: [
    { name: 'Standing hamstring stretch', durationSec: 30, notes: '30s each leg' },
    { name: 'Seated forward fold', durationSec: 60 },
    { name: 'Lying hamstring stretch with strap', durationSec: 45 },
  ],
  glutes: [
    { name: 'Figure-4 stretch', durationSec: 45, notes: '45s each side' },
    { name: 'Pigeon pose', durationSec: 60 },
    { name: 'Supine glute squeeze', durationSec: 30 },
  ],
  core: [
    { name: 'Cat-cow', durationSec: 60 },
    { name: 'Cobra pose', durationSec: 45 },
    { name: 'Child\'s pose', durationSec: 60 },
  ],
};

const dayBodyParts: Record<DayType, BodyPart[]> = {
  push: ['chest', 'shoulders', 'arms'],
  pull: ['back', 'arms'],
  legs: ['quads', 'hamstrings', 'glutes', 'core'],
  upper: ['chest', 'back', 'shoulders', 'arms'],
  lower: ['quads', 'hamstrings', 'glutes', 'core'],
  full_body: ['chest', 'back', 'quads', 'hamstrings', 'core'],
  cardio: ['core'],
  rest: [],
};

function buildWarmup(parts: BodyPart[]): { totalMin: number; items: WarmupItem[]; citationId: string } {
  const items: WarmupItem[] = [];
  for (const p of parts) {
    items.push(...WARMUPS[p].slice(0, 2));
  }
  return { totalMin: 5, items, citationId: 'warmup_efficacy' };
}

function buildCooldown(parts: BodyPart[]): { totalMin: number; items: CooldownItem[]; citationId: string } {
  const items: CooldownItem[] = [];
  for (const p of parts) {
    items.push(...COOLDOWNS[p].slice(0, 2));
  }
  return { totalMin: 5, items, citationId: 'static_stretching_recovery' };
}

interface ExerciseTemplate {
  base: string;
  variants: Partial<Record<WorkoutContext, string>>;
  sets: { novice: number; intermediate: number; advanced: number };
  reps: string;
  restSec: number;
  primaryMuscles: string[];
  citationId?: string;
}

const PUSH_EXERCISES: ExerciseTemplate[] = [
  {
    base: 'Barbell Bench Press',
    variants: {
      gym_basic: 'Barbell Bench Press',
      gym_full: 'Barbell Bench Press',
      home_full: 'Barbell Bench Press',
      home_db: 'Dumbbell Bench Press',
      home_bw: 'Decline Pushup (feet elevated)',
    },
    sets: { novice: 3, intermediate: 4, advanced: 4 },
    reps: '6-10',
    restSec: 120,
    primaryMuscles: ['chest', 'triceps', 'shoulders'],
    citationId: 'progressive_overload',
  },
  {
    base: 'Overhead Press',
    variants: {
      gym_basic: 'Standing Barbell Overhead Press',
      gym_full: 'Standing Barbell Overhead Press',
      home_full: 'Standing Barbell Overhead Press',
      home_db: 'Standing Dumbbell Overhead Press',
      home_bw: 'Pike Pushup',
    },
    sets: { novice: 3, intermediate: 3, advanced: 4 },
    reps: '6-10',
    restSec: 120,
    primaryMuscles: ['shoulders', 'triceps'],
    citationId: 'progressive_overload',
  },
  {
    base: 'Incline Press',
    variants: {
      gym_basic: 'Incline Dumbbell Press',
      gym_full: 'Incline Barbell Press',
      home_full: 'Incline Dumbbell Press',
      home_db: 'Incline Dumbbell Press',
      home_bw: 'Decline Pushup',
    },
    sets: { novice: 3, intermediate: 3, advanced: 4 },
    reps: '8-12',
    restSec: 90,
    primaryMuscles: ['chest', 'shoulders'],
  },
  {
    base: 'Lateral Raise',
    variants: {
      gym_basic: 'Dumbbell Lateral Raise',
      gym_full: 'Cable Lateral Raise',
      home_full: 'Dumbbell Lateral Raise',
      home_db: 'Dumbbell Lateral Raise',
      home_bw: 'Band Lateral Raise',
    },
    sets: { novice: 2, intermediate: 3, advanced: 4 },
    reps: '12-15',
    restSec: 60,
    primaryMuscles: ['shoulders'],
  },
  {
    base: 'Tricep Extension',
    variants: {
      gym_basic: 'Tricep Pushdown',
      gym_full: 'Cable Tricep Pushdown',
      home_full: 'Skull Crushers',
      home_db: 'Overhead DB Tricep Extension',
      home_bw: 'Diamond Pushup',
    },
    sets: { novice: 2, intermediate: 3, advanced: 3 },
    reps: '10-12',
    restSec: 75,
    primaryMuscles: ['arms'],
  },
];

const PULL_EXERCISES: ExerciseTemplate[] = [
  {
    base: 'Pull-up / Lat Pulldown',
    variants: {
      gym_basic: 'Lat Pulldown',
      gym_full: 'Pull-up',
      home_full: 'Pull-up',
      home_db: 'One-arm DB Row',
      home_bw: 'Band Pull-down (or doorway row)',
    },
    sets: { novice: 3, intermediate: 4, advanced: 4 },
    reps: '6-10',
    restSec: 120,
    primaryMuscles: ['back', 'arms'],
    citationId: 'progressive_overload',
  },
  {
    base: 'Barbell Row',
    variants: {
      gym_basic: 'Bent-over Barbell Row',
      gym_full: 'Bent-over Barbell Row',
      home_full: 'Bent-over Barbell Row',
      home_db: 'Bent-over DB Row',
      home_bw: 'Inverted Row (table or bar)',
    },
    sets: { novice: 3, intermediate: 3, advanced: 4 },
    reps: '6-10',
    restSec: 120,
    primaryMuscles: ['back'],
  },
  {
    base: 'Face Pulls',
    variants: {
      gym_basic: 'Cable Face Pulls',
      gym_full: 'Cable Face Pulls',
      home_full: 'Band Face Pulls',
      home_db: 'Band Face Pulls',
      home_bw: 'Band Face Pulls',
    },
    sets: { novice: 3, intermediate: 3, advanced: 3 },
    reps: '12-15',
    restSec: 60,
    primaryMuscles: ['back', 'shoulders'],
  },
  {
    base: 'Bicep Curl',
    variants: {
      gym_basic: 'Barbell Curl',
      gym_full: 'Barbell Curl',
      home_full: 'Barbell Curl',
      home_db: 'Dumbbell Curl',
      home_bw: 'Band Curl',
    },
    sets: { novice: 2, intermediate: 3, advanced: 4 },
    reps: '8-12',
    restSec: 75,
    primaryMuscles: ['arms'],
  },
];

const LEG_EXERCISES: ExerciseTemplate[] = [
  {
    base: 'Squat',
    variants: {
      gym_basic: 'Barbell Back Squat',
      gym_full: 'Barbell Back Squat',
      home_full: 'Barbell Back Squat',
      home_db: 'Goblet Squat',
      home_bw: 'Bodyweight Squat (or pistol progression)',
    },
    sets: { novice: 3, intermediate: 4, advanced: 4 },
    reps: '5-8',
    restSec: 180,
    primaryMuscles: ['quads', 'glutes'],
    citationId: 'progressive_overload',
  },
  {
    base: 'Romanian Deadlift',
    variants: {
      gym_basic: 'Romanian Deadlift',
      gym_full: 'Romanian Deadlift',
      home_full: 'Romanian Deadlift',
      home_db: 'Dumbbell RDL',
      home_bw: 'Single-leg RDL',
    },
    sets: { novice: 3, intermediate: 3, advanced: 4 },
    reps: '8-10',
    restSec: 150,
    primaryMuscles: ['hamstrings', 'glutes'],
  },
  {
    base: 'Lunges',
    variants: {
      gym_basic: 'Walking Lunges',
      gym_full: 'Walking Lunges',
      home_full: 'Walking Lunges',
      home_db: 'DB Walking Lunges',
      home_bw: 'Bodyweight Walking Lunges',
    },
    sets: { novice: 2, intermediate: 3, advanced: 3 },
    reps: '10 each leg',
    restSec: 90,
    primaryMuscles: ['quads', 'glutes'],
  },
  {
    base: 'Hip Thrust',
    variants: {
      gym_basic: 'Barbell Hip Thrust',
      gym_full: 'Barbell Hip Thrust',
      home_full: 'Barbell Hip Thrust',
      home_db: 'DB Hip Thrust',
      home_bw: 'Single-leg Glute Bridge',
    },
    sets: { novice: 2, intermediate: 3, advanced: 3 },
    reps: '8-12',
    restSec: 90,
    primaryMuscles: ['glutes', 'hamstrings'],
  },
  {
    base: 'Calf Raise',
    variants: {
      gym_basic: 'Standing Calf Raise',
      gym_full: 'Standing Calf Raise',
      home_full: 'Standing Calf Raise',
      home_db: 'DB Calf Raise',
      home_bw: 'Single-leg Calf Raise',
    },
    sets: { novice: 3, intermediate: 4, advanced: 4 },
    reps: '12-15',
    restSec: 60,
    primaryMuscles: ['quads'],
  },
];

const CORE_EXERCISES: ExerciseTemplate[] = [
  {
    base: 'Plank',
    variants: {
      gym_basic: 'Front Plank',
      gym_full: 'Front Plank',
      home_full: 'Front Plank',
      home_db: 'Front Plank',
      home_bw: 'Front Plank',
    },
    sets: { novice: 3, intermediate: 3, advanced: 3 },
    reps: '45 sec hold',
    restSec: 60,
    primaryMuscles: ['core'],
  },
  {
    base: 'Hanging Knee Raise',
    variants: {
      gym_basic: 'Hanging Knee Raise',
      gym_full: 'Hanging Knee Raise',
      home_full: 'Hanging Knee Raise',
      home_db: 'Lying Leg Raise',
      home_bw: 'Lying Leg Raise',
    },
    sets: { novice: 2, intermediate: 3, advanced: 3 },
    reps: '10-15',
    restSec: 60,
    primaryMuscles: ['core'],
  },
];

function expandExercises(
  templates: ExerciseTemplate[],
  context: WorkoutContext,
  fitness: FitnessProfile
): PhysicalExercise[] {
  return templates.map((t) => ({
    name: t.variants[context] ?? t.base,
    sets: t.sets[fitness],
    reps: t.reps,
    restSec: t.restSec,
    primaryMuscles: t.primaryMuscles,
    citationId: t.citationId,
  }));
}

function buildSession(
  dayType: DayType,
  label: string,
  context: WorkoutContext,
  fitness: FitnessProfile
): PhysicalSession {
  const parts = dayBodyParts[dayType];
  let main: PhysicalExercise[] = [];
  switch (dayType) {
    case 'push':
      main = expandExercises(PUSH_EXERCISES, context, fitness);
      break;
    case 'pull':
      main = expandExercises(PULL_EXERCISES, context, fitness);
      break;
    case 'legs':
    case 'lower':
      main = expandExercises(LEG_EXERCISES, context, fitness);
      break;
    case 'upper':
      main = [
        ...expandExercises(PUSH_EXERCISES.slice(0, 2), context, fitness),
        ...expandExercises(PULL_EXERCISES.slice(0, 2), context, fitness),
        ...expandExercises(PUSH_EXERCISES.slice(3, 4), context, fitness),
        ...expandExercises(PULL_EXERCISES.slice(3, 4), context, fitness),
      ];
      break;
    case 'full_body':
      main = [
        ...expandExercises(LEG_EXERCISES.slice(0, 1), context, fitness),
        ...expandExercises(PUSH_EXERCISES.slice(0, 1), context, fitness),
        ...expandExercises(PULL_EXERCISES.slice(0, 1), context, fitness),
        ...expandExercises(LEG_EXERCISES.slice(1, 2), context, fitness),
        ...expandExercises(CORE_EXERCISES.slice(0, 1), context, fitness),
      ];
      break;
    case 'cardio':
      main = [
        { name: 'Steady-state cardio (zone 2)', sets: 1, reps: '30 min', restSec: 0, primaryMuscles: ['core'], citationId: 'hiit_efficacy' },
      ];
      break;
    case 'rest':
      return {
        dayType,
        label: 'Rest',
        bodyParts: [],
        warmup: { totalMin: 0, items: [], citationId: 'warmup_efficacy' },
        main: [],
        cooldown: { totalMin: 0, items: [], citationId: 'static_stretching_recovery' },
      };
  }

  if (dayType === 'legs' || dayType === 'lower' || dayType === 'full_body') {
    main.push(...expandExercises(CORE_EXERCISES.slice(0, 1), context, fitness));
  }

  return {
    dayType,
    label,
    bodyParts: parts,
    warmup: buildWarmup(parts),
    main,
    cooldown: buildCooldown(parts),
  };
}

const SPLITS: Record<string, Record<number, DayType>> = {
  '3day_full': { 0: 'rest', 1: 'full_body', 2: 'rest', 3: 'full_body', 4: 'rest', 5: 'full_body', 6: 'rest' },
  '4day_ul': { 0: 'rest', 1: 'upper', 2: 'lower', 3: 'rest', 4: 'upper', 5: 'lower', 6: 'rest' },
  '5day_ppl_ul': { 0: 'rest', 1: 'push', 2: 'pull', 3: 'legs', 4: 'rest', 5: 'upper', 6: 'lower' },
  '6day_ppl': { 0: 'rest', 1: 'push', 2: 'pull', 3: 'legs', 4: 'push', 5: 'pull', 6: 'legs' },
};

function pickSplit(context: WorkoutContext, fitness: FitnessProfile): keyof typeof SPLITS {
  if (fitness === 'advanced') return context === 'home_bw' ? '5day_ppl_ul' : '6day_ppl';
  if (fitness === 'intermediate') return context === 'home_bw' ? '4day_ul' : '5day_ppl_ul';
  return '3day_full';
}

function buildBundle(
  context: WorkoutContext,
  fitness: FitnessProfile,
  bodyGoal: BodyGoal
): PhysicalBundle {
  const splitKey = pickSplit(context, fitness);
  const weeklySplit = SPLITS[splitKey];
  const dayLabels: Record<DayType, string> = {
    push: 'Push (chest, shoulders, triceps)',
    pull: 'Pull (back, biceps)',
    legs: 'Legs',
    upper: 'Upper Body',
    lower: 'Lower Body',
    full_body: 'Full Body',
    cardio: 'Cardio',
    rest: 'Rest',
  };

  const sessions: Record<DayType, PhysicalSession | null> = {
    push: null, pull: null, legs: null, upper: null, lower: null,
    full_body: null, cardio: null, rest: buildSession('rest', 'Rest', context, fitness),
  };
  const usedDayTypes = new Set(Object.values(weeklySplit));
  for (const dt of usedDayTypes) {
    sessions[dt] = buildSession(dt, dayLabels[dt], context, fitness);
  }

  if (bodyGoal === 'cut') {
    Object.values(sessions).forEach((s) => {
      if (s && s.dayType !== 'rest') {
        s.main.push({
          name: 'Finisher: 10 min steady-state cardio',
          sets: 1,
          reps: '10 min',
          restSec: 0,
          primaryMuscles: ['core'],
          citationId: 'hiit_efficacy',
        });
      }
    });
  }

  if (bodyGoal === 'lean_gain') {
    Object.values(sessions).forEach((s) => {
      if (s) {
        s.main = s.main.map((ex) => ({ ...ex, sets: Math.min(5, ex.sets + 1) }));
      }
    });
  }

  return {
    archetypeId: `${context}_${fitness}_${bodyGoal}`,
    description: `${context.replace('_', ' ')} · ${fitness} · ${bodyGoal.replace('_', ' ')} · split ${splitKey}`,
    weeklySplit,
    sessions,
    citationIds: ['progressive_overload', 'hypertrophy_volume', 'rep_range_hypertrophy', 'warmup_efficacy', 'static_stretching_recovery'],
  };
}

export function getPhysicalBundle(
  context: WorkoutContext,
  fitness: FitnessProfile,
  bodyGoal: BodyGoal
): PhysicalBundle {
  return buildBundle(context, fitness, bodyGoal);
}

export function getSessionForDay(
  bundle: PhysicalBundle,
  dayOfWeek: number
): PhysicalSession {
  const dt = bundle.weeklySplit[dayOfWeek] ?? 'rest';
  return bundle.sessions[dt] ?? bundle.sessions.rest!;
}
