import { UserProfile } from '../profile';
import { RoutineForDay } from './types';
import { getSkincareRoutine } from './skincare';
import { getFacialRoutine } from './facial';
import { getPhysicalBundle, getSessionForDay } from './physical';

export * from './types';
export { getSkincareRoutine } from './skincare';
export { getFacialRoutine } from './facial';
export { getPhysicalBundle, getSessionForDay } from './physical';

export function getRoutineFor(profile: UserProfile, dayOfWeek: number): RoutineForDay {
  const bundle = getPhysicalBundle(profile.workoutContext, profile.fitnessProfile, profile.bodyGoal);
  return {
    skincare: getSkincareRoutine(profile.skinProfile, profile.ageBand),
    facial: getFacialRoutine(profile.ageBand),
    physical: getSessionForDay(bundle, dayOfWeek),
    physicalBundle: bundle,
  };
}

export function getTodaysRoutine(profile: UserProfile): RoutineForDay {
  return getRoutineFor(profile, new Date().getDay());
}
