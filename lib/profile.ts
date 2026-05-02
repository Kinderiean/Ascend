export type FitnessProfile = 'novice' | 'intermediate' | 'advanced';
export type BodyGoal = 'cut' | 'lean_gain' | 'recomp' | 'maintain' | 'rehab';
export type WorkoutContext = 'home_bw' | 'home_db' | 'home_full' | 'gym_basic' | 'gym_full';
export type SkinProfile = 'oily_acne' | 'dry_sensitive' | 'combo' | 'mature' | 'normal';
export type RecoveryProfile = 'low' | 'medium' | 'high';
export type AgeBand = 'teen' | 'young_adult' | 'adult' | 'mature';

export type WorkoutLocation = 'home' | 'gym' | 'both';
export type Equipment = 'bodyweight' | 'dumbbells' | 'bands' | 'pullup_bar' | 'barbell' | 'machines';
export type SkinType = 'oily' | 'dry' | 'combo' | 'sensitive' | 'normal';
export type Dietary = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';

export interface ProfileInputs {
  age?: string;
  height?: string;
  weight?: string;
  units?: 'metric' | 'imperial';
  looksAnswers?: Record<string, string>;
  bodyAnswers?: Record<string, string>;
  goalText?: string;
  workoutLocation?: WorkoutLocation;
  equipment?: Equipment[];
  skinType?: SkinType;
  skinConcerns?: string[];
  dietary?: Dietary;
  sleepBedtime?: string;
  sleepWaketime?: string;
}

export interface UserProfile {
  ageBand: AgeBand;
  fitnessProfile: FitnessProfile;
  bodyGoal: BodyGoal;
  workoutContext: WorkoutContext;
  skinProfile: SkinProfile;
  recoveryProfile: RecoveryProfile;
  dietary: Dietary;
  estimatedSleepHours: number;
}

function parseAge(input?: string): number {
  if (!input) return 25;
  const n = parseInt(input.replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(n)) return 25;
  return Math.min(120, Math.max(13, n));
}

function classifyAgeBand(age: number): AgeBand {
  if (age < 18) return 'teen';
  if (age < 30) return 'young_adult';
  if (age < 45) return 'adult';
  return 'mature';
}

function classifyFitness(bodyAnswers: Record<string, string> | undefined): FitnessProfile {
  if (!bodyAnswers) return 'novice';
  const training = (bodyAnswers.training || bodyAnswers.trainingLevel || '').toLowerCase();
  if (training.includes('advanced') || training.includes('athlete') || training.includes('intense')) {
    return 'advanced';
  }
  if (training.includes('intermediate') || training.includes('regular') || training.includes('lift')) {
    return 'intermediate';
  }
  return 'novice';
}

function classifyBodyGoal(
  goalText: string | undefined,
  bodyAnswers: Record<string, string> | undefined
): BodyGoal {
  const goal = (goalText || '').toLowerCase();
  const nutrition = (bodyAnswers?.nutrition || '').toLowerCase();

  if (/lose|cut|fat|lean|shred|leaner|trim/.test(goal)) return 'cut';
  if (/gain|bulk|muscle|bigger|mass|size/.test(goal)) return 'lean_gain';
  if (/recomp|tone|tighter/.test(goal)) return 'recomp';
  if (/heal|rehab|injur|recover/.test(goal)) return 'rehab';

  if (nutrition.includes('deficit')) return 'cut';
  if (nutrition.includes('surplus')) return 'lean_gain';

  return 'maintain';
}

function classifyWorkoutContext(
  location: WorkoutLocation | undefined,
  equipment: Equipment[] | undefined
): WorkoutContext {
  const eq = equipment ?? [];
  const hasBarbell = eq.includes('barbell');
  const hasMachines = eq.includes('machines');
  const hasDumbbells = eq.includes('dumbbells');
  const hasBands = eq.includes('bands');

  if (location === 'gym' || (location === 'both' && (hasBarbell || hasMachines))) {
    return hasMachines && hasBarbell ? 'gym_full' : 'gym_basic';
  }

  if (hasBarbell || (hasDumbbells && hasMachines)) return 'home_full';
  if (hasDumbbells || hasBands) return 'home_db';
  return 'home_bw';
}

function classifySkin(
  skinType: SkinType | undefined,
  ageBand: AgeBand,
  looksAnswers: Record<string, string> | undefined
): SkinProfile {
  if (ageBand === 'mature') return 'mature';

  if (skinType === 'oily') {
    const concerns = (looksAnswers?.skin_concerns || '').toLowerCase();
    if (concerns.includes('acne') || concerns.includes('break')) return 'oily_acne';
    return 'oily_acne';
  }

  if (skinType === 'dry' || skinType === 'sensitive') return 'dry_sensitive';
  if (skinType === 'combo') return 'combo';
  return 'normal';
}

function classifyRecovery(
  ageBand: AgeBand,
  bodyAnswers: Record<string, string> | undefined,
  estimatedSleepHours: number
): RecoveryProfile {
  if (estimatedSleepHours >= 8 && (ageBand === 'teen' || ageBand === 'young_adult')) return 'high';
  if (estimatedSleepHours >= 7 && ageBand !== 'mature') return 'medium';
  if (estimatedSleepHours < 6) return 'low';

  const energy = (bodyAnswers?.energy || '').toLowerCase();
  if (energy.includes('high')) return 'high';
  if (energy.includes('low') || energy.includes('tired')) return 'low';

  return 'medium';
}

function estimateSleepHours(bedtime?: string, waketime?: string, bodyAnswers?: Record<string, string>): number {
  if (bedtime && waketime) {
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = waketime.split(':').map(Number);
    if ([bh, bm, wh, wm].every(Number.isFinite)) {
      const bedMin = bh * 60 + bm;
      const wakeMin = wh * 60 + wm;
      const diff = wakeMin >= bedMin ? wakeMin - bedMin : 24 * 60 - bedMin + wakeMin;
      return Math.round((diff / 60) * 10) / 10;
    }
  }

  const sleep = (bodyAnswers?.sleep || '').toLowerCase();
  if (sleep.includes('9') || sleep.includes('lots')) return 9;
  if (sleep.includes('8')) return 8;
  if (sleep.includes('7')) return 7;
  if (sleep.includes('6')) return 6;
  if (sleep.includes('5') || sleep.includes('little')) return 5;
  return 7;
}

export function classifyProfile(inputs: ProfileInputs): UserProfile {
  const age = parseAge(inputs.age);
  const ageBand = classifyAgeBand(age);
  const fitnessProfile = classifyFitness(inputs.bodyAnswers);
  const bodyGoal = classifyBodyGoal(inputs.goalText, inputs.bodyAnswers);
  const workoutContext = classifyWorkoutContext(inputs.workoutLocation, inputs.equipment);
  const skinProfile = classifySkin(inputs.skinType, ageBand, inputs.looksAnswers);
  const estimatedSleepHours = estimateSleepHours(
    inputs.sleepBedtime,
    inputs.sleepWaketime,
    inputs.bodyAnswers
  );
  const recoveryProfile = classifyRecovery(ageBand, inputs.bodyAnswers, estimatedSleepHours);
  const dietary = inputs.dietary ?? 'omnivore';

  return {
    ageBand,
    fitnessProfile,
    bodyGoal,
    workoutContext,
    skinProfile,
    recoveryProfile,
    dietary,
    estimatedSleepHours,
  };
}

export function profileSummary(profile: UserProfile): string {
  return [
    profile.fitnessProfile,
    profile.bodyGoal,
    profile.workoutContext,
    profile.skinProfile,
    `${profile.estimatedSleepHours}h sleep`,
  ].join(' · ');
}
