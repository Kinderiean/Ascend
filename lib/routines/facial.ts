import { FacialRoutine } from './types';
import { AgeBand } from '../profile';

const SHARED_POSTURE = [
  'Tongue resting flat against the roof of your mouth',
  'Teeth lightly touching, not clenched',
  'Lips sealed, breathing through your nose',
  'Chin slightly tucked, head balanced over shoulders',
];

const baseRoutine: FacialRoutine = {
  postureCues: SHARED_POSTURE,
  daily: [
    {
      name: 'Mewing posture (passive)',
      durationSec: 0,
      notes: 'All day. Tongue suction to palate, lips sealed, slow nasal breathing.',
      citationId: 'mewing_evidence',
    },
    {
      name: 'Tongue press hold',
      sets: 3,
      durationSec: 30,
      notes: 'Press whole tongue firmly against palate; release.',
      citationId: 'myofunctional_therapy',
    },
    {
      name: 'Chin tucks',
      sets: 3,
      reps: '12',
      notes: 'Lengthen neck, tuck chin straight back. No nodding.',
    },
    {
      name: 'Cheekbone lifts',
      sets: 2,
      reps: '15',
      notes: 'Smile wide, raise cheek muscles upward, hold 2 seconds.',
    },
    {
      name: 'Jaw clench-release',
      sets: 3,
      reps: '15',
      notes: 'Light controlled clench, slow release. Avoid grinding.',
    },
  ],
  weekly: [
    {
      name: 'Gua sha',
      durationSec: 600,
      notes: '2x/week. Light upward strokes only; never drag down.',
    },
    {
      name: 'Facial yoga session (10 min)',
      durationSec: 600,
      notes: '1x/week. Combine smile-frown sets, eye lifts, neck rolls.',
    },
  ],
  citationIds: ['mewing_evidence', 'myofunctional_therapy'],
};

const teen: FacialRoutine = {
  ...baseRoutine,
  daily: baseRoutine.daily.filter((e) => e.name !== 'Jaw clench-release').concat([
    {
      name: 'Posture-only practice',
      durationSec: 0,
      notes: 'Skeletal change still possible at this age — focus on full-day mewing posture.',
      citationId: 'mewing_evidence',
    },
  ]),
};

const young_adult: FacialRoutine = baseRoutine;

const adult: FacialRoutine = {
  ...baseRoutine,
  daily: baseRoutine.daily.concat([
    {
      name: 'Neck flexor curl',
      sets: 2,
      reps: '12',
      notes: 'Lift head off pillow keeping chin tucked. Targets deep neck flexors.',
    },
  ]),
};

const mature_routine: FacialRoutine = {
  ...baseRoutine,
  daily: baseRoutine.daily.concat([
    {
      name: 'Platysma activation',
      sets: 3,
      reps: '12',
      notes: 'Pull lower lip down and back, tense neck muscles, hold 3 seconds.',
    },
    {
      name: 'Forehead smoother',
      sets: 2,
      reps: '15',
      notes: 'Place fingers above brows, gently pull skin upward while raising brows. Hold 5s.',
    },
  ]),
};

const FACIAL_BY_AGE: Record<AgeBand, FacialRoutine> = {
  teen,
  young_adult,
  adult,
  mature: mature_routine,
};

export function getFacialRoutine(ageBand: AgeBand): FacialRoutine {
  return FACIAL_BY_AGE[ageBand] ?? baseRoutine;
}
