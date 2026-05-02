export interface SkincareStep {
  order: number;
  name: string;
  active?: string;
  citationId?: string;
  notes?: string;
}

export interface SkincareRoutine {
  am: SkincareStep[];
  pm: SkincareStep[];
  weekly: SkincareStep[];
  cautions: string[];
  citationIds: string[];
}

export interface FacialExercise {
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  notes?: string;
  citationId?: string;
}

export interface FacialRoutine {
  postureCues: string[];
  daily: FacialExercise[];
  weekly: FacialExercise[];
  citationIds: string[];
}

export type DayType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'upper'
  | 'lower'
  | 'full_body'
  | 'cardio'
  | 'rest';

export interface PhysicalExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
  citationId?: string;
  primaryMuscles?: string[];
}

export interface WarmupItem {
  name: string;
  durationSec?: number;
  reps?: string;
  notes?: string;
}

export interface CooldownItem {
  name: string;
  durationSec: number;
  notes?: string;
}

export interface PhysicalSession {
  dayType: DayType;
  label: string;
  bodyParts: string[];
  warmup: { totalMin: number; items: WarmupItem[]; citationId?: string };
  main: PhysicalExercise[];
  cooldown: { totalMin: number; items: CooldownItem[]; citationId?: string };
}

export interface PhysicalBundle {
  archetypeId: string;
  description: string;
  weeklySplit: Record<number, DayType>;
  sessions: Record<DayType, PhysicalSession | null>;
  citationIds: string[];
}

export interface RoutineForDay {
  skincare: SkincareRoutine;
  facial: FacialRoutine;
  physical: PhysicalSession;
  physicalBundle: PhysicalBundle;
}
