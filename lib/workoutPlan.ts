import type { WarmupItem, CooldownItem } from './routines/types';

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  note?: string;
  tag?: string; // 'V-TAPER' | 'WAIST' | 'COMPOUND' | 'ISOLATION'
}

export interface WorkoutDay {
  label: string;
  focus: string;
  dayName: string; // 'Monday', 'Tuesday', etc.
  exercises: Exercise[];
  warmup?: WarmupItem[];
  cooldown?: CooldownItem[];
  isRest?: boolean;
  cardioNote?: string;
}

// ── Toji Blueprint — Phase 1: Beginner PPL (V-Taper Foundation) ─────────────
// Source: Toji_Transformation_Blueprint.html, Phase 1, Weeks 1–8
// Sun=Push A, Mon=Pull A, Tue=Legs A, Wed=Push B, Thu=Pull B, Fri=Legs B, Sat=REST
export const TOJI_PPL_DAYS: WorkoutDay[] = [
  {
    label: 'Push A',
    focus: 'Chest Focus · Shoulders · Triceps',
    dayName: 'Sunday',
    exercises: [
      { name: 'Barbell Bench Press', sets: '4', reps: '8–10', rest: '2–3 min', tag: 'COMPOUND' },
      { name: 'Incline DB Press (30°)', sets: '3', reps: '8–10', rest: '2 min', tag: 'V-TAPER', note: 'Upper chest shelf — the Toji shirt-stretching look' },
      { name: 'Cable Crossover / Pec Fly', sets: '3', reps: '10–12', rest: '90s', note: 'Squeeze hard at peak contraction' },
      { name: 'Seated DB Shoulder Press', sets: '3', reps: '8–10', rest: '2 min', tag: 'COMPOUND' },
      { name: 'Dumbbell Lateral Raise', sets: '4', reps: '12–15', rest: '60s', tag: 'V-TAPER', note: '#1 for wider shoulders — slow, controlled, slight lean forward' },
      { name: 'Tricep Rope Pushdown', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Overhead Tricep Extension (Cable)', sets: '2', reps: '10–12', rest: '60s' },
    ],
  },
  {
    label: 'Pull A',
    focus: 'Back Width · Biceps',
    dayName: 'Monday',
    exercises: [
      { name: 'Wide-Grip Lat Pulldown', sets: '4', reps: '8–10', rest: '2 min', tag: 'V-TAPER', note: 'Builds lat width — the wings that create the V-shape from behind' },
      { name: 'Barbell Row (Overhand Grip)', sets: '3', reps: '8–10', rest: '2–3 min', tag: 'COMPOUND' },
      { name: 'Seated Cable Row (Wide Grip)', sets: '3', reps: '10–12', rest: '2 min', tag: 'V-TAPER', note: 'Wide grip hits upper back thickness — builds that 3D back look' },
      { name: 'Face Pulls', sets: '3', reps: '15–20', rest: '60s', tag: 'V-TAPER', note: 'Rear delts + posture — pulls shoulders back, makes frame look wider' },
      { name: 'Barbell Curl', sets: '3', reps: '8–10', rest: '90s' },
      { name: 'Incline Dumbbell Curl', sets: '2', reps: '10–12', rest: '60s' },
      { name: 'Barbell Shrugs', sets: '3', reps: '10–12', rest: '60s', note: 'Traps create the powerful silhouette from the front' },
    ],
  },
  {
    label: 'Legs A',
    focus: 'Quad Focus · Core · Waist Tightening',
    dayName: 'Tuesday',
    exercises: [
      { name: 'Barbell Squat', sets: '4', reps: '8–10', rest: '2–3 min', tag: 'COMPOUND' },
      { name: 'Leg Press', sets: '3', reps: '10–12', rest: '2 min' },
      { name: 'Leg Curl Machine', sets: '3', reps: '10–12', rest: '90s' },
      { name: 'Standing Calf Raises', sets: '3', reps: '15–20', rest: '60s' },
      { name: 'Hanging Leg Raises', sets: '3', reps: '10–15', rest: '60s', tag: 'WAIST', note: 'Tightens lower abs without thickening obliques — no swinging' },
      { name: 'Cable Crunch', sets: '3', reps: '12–15', rest: '60s', tag: 'WAIST', note: 'Builds the ab bricks — squeeze hard at bottom' },
      { name: 'Stomach Vacuum Hold', sets: '3', reps: '20–30s hold', rest: '45s', tag: 'WAIST', note: 'Trains transverse abdominis — the internal corset that pulls waist IN' },
    ],
  },
  {
    label: 'Push B',
    focus: 'Shoulder Focus · Chest · Triceps',
    dayName: 'Wednesday',
    exercises: [
      { name: 'Overhead Press (Barbell, Standing)', sets: '4', reps: '6–8', rest: '2–3 min', tag: 'V-TAPER', note: 'King of shoulder mass — standing version recruits core too' },
      { name: 'Dumbbell Lateral Raise', sets: '4', reps: '12–15', rest: '60s', tag: 'V-TAPER', note: 'Lateral delts can handle high frequency — the #1 V-taper muscle' },
      { name: 'Incline Barbell Bench Press (30°)', sets: '3', reps: '8–10', rest: '2 min', tag: 'V-TAPER', note: 'Upper chest — heavier loading than Day 1 dumbbell version' },
      { name: 'Dumbbell Flat Bench Press', sets: '3', reps: '10–12', rest: '2 min', note: 'Full ROM — better stretch than barbell, targets entire pec' },
      { name: 'Cable Lateral Raise (Single Arm)', sets: '3', reps: '12–15', rest: '60s', tag: 'V-TAPER', note: 'Constant tension — complements dumbbell laterals' },
      { name: 'Close-Grip Bench Press', sets: '3', reps: '8–10', rest: '2 min', tag: 'COMPOUND' },
      { name: 'Tricep Dips (Assisted if needed)', sets: '3', reps: '8–12', rest: '90s', note: 'Lean slightly forward to target lower chest — builds pec thickness' },
    ],
  },
  {
    label: 'Pull B',
    focus: 'Back Thickness · Rear Delts · Biceps',
    dayName: 'Thursday',
    exercises: [
      { name: 'Chest-Supported T-Bar Row / DB Row', sets: '4', reps: '8–10', rest: '2 min', tag: 'V-TAPER', note: 'Chest-supported = no lower back fatigue, pure back contraction' },
      { name: 'Close-Grip Lat Pulldown (V-Bar)', sets: '3', reps: '10–12', rest: '2 min', tag: 'COMPOUND' },
      { name: 'Straight-Arm Lat Pushdown (Cable)', sets: '3', reps: '12–15', rest: '60s', tag: 'V-TAPER', note: 'Isolates lats directly — the lat sweep builder. Keep arms straight.' },
      { name: 'Reverse Pec Deck / Rear Delt Fly', sets: '3', reps: '12–15', rest: '60s', tag: 'V-TAPER', note: 'Rear delts make shoulders look 3D from every angle' },
      { name: 'Face Pulls', sets: '3', reps: '15–20', rest: '60s', note: 'Every pull day — rear delts are priority' },
      { name: 'Hammer Curl (Dumbbell)', sets: '3', reps: '10–12', rest: '60s' },
      { name: 'Dumbbell Shrugs (Heavy)', sets: '3', reps: '10–12', rest: '60s' },
    ],
  },
  {
    label: 'Legs B',
    focus: 'Hamstring · Glute Focus · Core · Waist',
    dayName: 'Friday',
    exercises: [
      { name: 'Romanian Deadlift', sets: '4', reps: '8–10', rest: '2–3 min', tag: 'COMPOUND' },
      { name: 'Bulgarian Split Squat (Dumbbells)', sets: '3', reps: '10–12 each leg', rest: '90s' },
      { name: 'Leg Curl Machine', sets: '3', reps: '10–12', rest: '90s' },
      { name: 'Leg Extension Machine', sets: '3', reps: '12–15', rest: '60s' },
      { name: 'Standing Calf Raises', sets: '3', reps: '15–20', rest: '60s' },
      { name: 'Hanging Leg Raises', sets: '3', reps: '10–15', rest: '60s', tag: 'WAIST' },
      { name: 'Plank + Stomach Vacuum Superset', sets: '3', reps: '30s + 20s', rest: '60s', tag: 'WAIST', note: '30s plank immediately into 20s vacuum hold — trains abs + inner corset' },
    ],
  },
  {
    label: 'Full Rest',
    focus: 'Recovery · Cardio · Mobility',
    dayName: 'Saturday',
    isRest: true,
    cardioNote: 'No weights. Walk 10,000+ steps outdoors. Swim 30 min easy freestyle/backstroke. Light stretching or yoga. This is when muscles repair and grow — respect it.',
    exercises: [
      { name: 'Walk 10,000+ steps', sets: '1', reps: 'Outdoors', rest: '—', note: 'Sunlight exposure — morning preferred' },
      { name: 'Swim 30 min', sets: '1', reps: 'Easy pace', rest: '—', note: 'Freestyle or backstroke — active recovery, not intense' },
      { name: 'Stretching / Yoga', sets: '1', reps: '15–20 min', rest: '—', note: 'Full body — focus on chest, lats, hips' },
    ],
  },
];

// ── Beginner (None training): Full Body 3×/week ──────────────────────────────
export const BEGINNER_DAYS: WorkoutDay[] = [
  {
    label: 'Full Body',
    focus: 'Full Body Strength',
    dayName: 'Mon / Wed / Fri',
    exercises: [
      { name: 'Goblet Squat', sets: '3', reps: '12–15', rest: '90s', note: 'Or bodyweight squat if no weights' },
      { name: 'Push-Up', sets: '3', reps: '8–15', rest: '90s', note: 'Incline if needed to hit 8 reps' },
      { name: 'Dumbbell Row', sets: '3', reps: '10–12 each', rest: '90s', note: 'Squeeze at top' },
      { name: 'Romanian Deadlift', sets: '3', reps: '10–12', rest: '90s', note: 'Hip hinge, not squat' },
      { name: 'DB Shoulder Press', sets: '3', reps: '10–12', rest: '90s' },
      { name: 'Plank', sets: '3', reps: '30–60s', rest: '60s' },
    ],
  },
  {
    label: 'Active Recovery',
    focus: 'Walk · Stretch',
    dayName: 'Tue / Thu / Sat',
    isRest: true,
    exercises: [
      { name: 'Walk 30–60 min', sets: '1', reps: '—', rest: '—', note: 'Outdoors preferred, sunlight' },
      { name: 'Mobility + Stretching', sets: '1', reps: '10 min', rest: '—' },
    ],
  },
  {
    label: 'Full Rest',
    focus: 'Recovery',
    dayName: 'Sunday',
    isRest: true,
    exercises: [],
  },
];

// ── Stretching protocols — tiered by training level ──────────────────────────

export interface StretchExercise {
  name: string;
  hold: string;
  note?: string;
}

export interface StretchRoutine {
  label: string;
  duration: string;
  stretches: StretchExercise[];
}

export const STRETCH_BEGINNER: StretchRoutine = {
  label: 'Post-Workout Stretch',
  duration: '10 min',
  stretches: [
    { name: 'Hip Flexor Lunge Stretch', hold: '45s each side', note: 'Knee on floor, push hips forward gently' },
    { name: 'Hamstring Forward Fold', hold: '45s', note: 'Seated or standing — soft bend in knees' },
    { name: 'Chest Opener (hands clasped behind)', hold: '30s', note: 'Squeeze shoulder blades, open chest wide' },
    { name: 'Cross-Body Shoulder Stretch', hold: '30s each side' },
    { name: 'Standing Quad Stretch', hold: '30s each side', note: 'Grab ankle, stand tall' },
    { name: 'Supine Spinal Twist', hold: '45s each side', note: 'Lie flat, drop knee across body' },
  ],
};

export const STRETCH_INTERMEDIATE: StretchRoutine = {
  label: 'Mobility Flow',
  duration: '15 min',
  stretches: [
    { name: 'Deep Hip 90-90 Rotation', hold: '60s each side', note: 'Sit with both knees at 90° — rotate hip joint fully' },
    { name: 'Thoracic Spine Mobility (T-Spine)', hold: '30s each segment', note: 'Use foam roller or floor — 5 extensions' },
    { name: 'Pigeon Pose', hold: '90s each side', note: 'Keep hips square, walk hands forward' },
    { name: 'Couch Stretch (hip flexor)', hold: '90s each side', note: 'Foot on wall behind, knee on floor — deep quad/hip flexor' },
    { name: "World's Greatest Stretch", hold: '45s each side', note: 'Lunge + rotation + elbow to floor sequence' },
    { name: 'Jefferson Curl (light)', hold: '60s', note: 'Standing, slow roll-down with slight weight — spinal decompression' },
  ],
};

export const STRETCH_ADVANCED: StretchRoutine = {
  label: 'Athlete Mobility Protocol',
  duration: '20 min',
  stretches: [
    { name: 'PNF Hamstring Stretch', hold: '6s contract + 30s relax × 3', note: 'Partner or strap — contract then relax deeper each cycle' },
    { name: 'Loaded Hip Flexor Stretch', hold: '60s each, 3 sets', note: 'Add light weight to increase depth over time' },
    { name: 'Front Split Progression', hold: '90s each side', note: 'Use blocks if needed — progress weekly' },
    { name: 'Shoulder Dislocates (band)', hold: 'Flow × 15 reps', note: 'Wide grip, pass band overhead and behind — overhead mobility essential' },
    { name: 'Jefferson Curl (heavy)', hold: '60s × 3 sets', note: 'Loaded spinal flexion for full posterior chain flexibility' },
    { name: 'Pancake / Middle Split', hold: '2 min', note: 'Seated, legs wide — walk hands out, hold at end range' },
  ],
};

export function getStretchRoutine(trainingLevel: string): StretchRoutine {
  if (trainingLevel === 'Advanced' || trainingLevel === 'Athlete') return STRETCH_ADVANCED;
  if (trainingLevel === 'Intermediate') return STRETCH_INTERMEDIATE;
  return STRETCH_BEGINNER;
}

// Day-type → warmup/cooldown map sourced from the routines library.
// We classify each WorkoutDay's focus into a body-part bucket to pick the
// right warmup and cooldown set.
function dayBucket(day: WorkoutDay): 'push' | 'pull' | 'legs' | 'full' | 'rest' {
  if (day.isRest) return 'rest';
  const f = `${day.label} ${day.focus}`.toLowerCase();
  if (f.includes('push') || f.includes('chest') || f.includes('shoulder')) return 'push';
  if (f.includes('pull') || f.includes('back') || f.includes('biceps')) return 'pull';
  if (f.includes('legs') || f.includes('quad') || f.includes('hamstring') || f.includes('glute')) return 'legs';
  return 'full';
}

const WARMUP_BY_BUCKET: Record<string, WarmupItem[]> = {
  push: [
    { name: 'Shoulder dislocates with band', reps: '15' },
    { name: 'Scap pushups', reps: '12' },
    { name: 'Band pull-aparts', reps: '20' },
    { name: 'Light pushups', reps: '10' },
    { name: 'Wall slides', reps: '12' },
  ],
  pull: [
    { name: 'Cat-cow', reps: '10' },
    { name: 'Dead hangs', durationSec: 30 },
    { name: 'Band pull-aparts', reps: '20' },
    { name: 'Scap pulls', reps: '10' },
    { name: 'Arm circles', reps: '15 each direction' },
  ],
  legs: [
    { name: 'Bodyweight squats', reps: '20' },
    { name: 'Walking lunges', reps: '10 each leg' },
    { name: 'Glute bridges', reps: '15' },
    { name: 'Leg swings forward', reps: '15 each' },
    { name: '90/90 hip switches', reps: '10 each side' },
  ],
  full: [
    { name: 'Jumping jacks', durationSec: 60 },
    { name: 'Bodyweight squats', reps: '15' },
    { name: 'Inchworms', reps: '8' },
    { name: 'Arm circles', reps: '15 each direction' },
  ],
  rest: [],
};

const COOLDOWN_BY_BUCKET: Record<string, CooldownItem[]> = {
  push: [
    { name: 'Doorway pec stretch', durationSec: 45, notes: '45s each side' },
    { name: 'Cross-body shoulder stretch', durationSec: 30, notes: '30s each side' },
    { name: 'Cobra pose', durationSec: 30 },
    { name: 'Tricep overhead stretch', durationSec: 30, notes: '30s each side' },
  ],
  pull: [
    { name: 'Lat hang', durationSec: 30, notes: 'Passive hang from a bar' },
    { name: "Child's pose with arms extended", durationSec: 60 },
    { name: 'Thread the needle', durationSec: 30, notes: '30s each side' },
    { name: 'Wrist flexor stretch', durationSec: 20 },
  ],
  legs: [
    { name: 'Standing quad stretch', durationSec: 30, notes: '30s each leg' },
    { name: 'Couch stretch', durationSec: 60, notes: '60s each side' },
    { name: 'Pigeon pose', durationSec: 60 },
    { name: 'Standing hamstring stretch', durationSec: 30, notes: '30s each leg' },
    { name: 'Figure-4 stretch', durationSec: 45, notes: '45s each side' },
  ],
  full: [
    { name: 'Forward fold', durationSec: 45 },
    { name: "Child's pose", durationSec: 60 },
    { name: 'Cat-cow', durationSec: 60 },
    { name: 'Cobra pose', durationSec: 30 },
  ],
  rest: [],
};

function enrich(day: WorkoutDay): WorkoutDay {
  if (day.warmup && day.cooldown) return day;
  const bucket = dayBucket(day);
  return {
    ...day,
    warmup: WARMUP_BY_BUCKET[bucket],
    cooldown: COOLDOWN_BY_BUCKET[bucket],
  };
}

export function getTodaysWorkout(trainingLevel: string): WorkoutDay {
  const dow = new Date().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const isAdvanced = trainingLevel !== 'None';

  if (isAdvanced) {
    // Sun=0(Push A), Mon=1(Pull A), Tue=2(Legs A), Wed=3(Push B), Thu=4(Pull B), Fri=5(Legs B), Sat=6(REST)
    return enrich(TOJI_PPL_DAYS[dow]);
  } else {
    const isWorkoutDay = dow === 1 || dow === 3 || dow === 5;
    if (dow === 0) return enrich(BEGINNER_DAYS[2]);
    return enrich(BEGINNER_DAYS[isWorkoutDay ? 0 : 1]);
  }
}

export function getWeeklySchedule(trainingLevel: string): WorkoutDay[] {
  const days = trainingLevel !== 'None' ? TOJI_PPL_DAYS : BEGINNER_DAYS;
  return days.map(enrich);
}
