import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface MoneyEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
}

export interface CustomTask {
  id: string;
  title: string;
  time: string;
  duration: string;
  category?: string;
  alarmEnabled?: boolean;
}

export type Aspect =
  | 'facial' | 'physical' | 'mental' | 'spiritual'
  | 'money' | 'knowledge';

export type CompanionKind =
  | 'cat' | 'dog' | 'lion' | 'tiger' | 'horse'
  | 'unicorn' | 'parrot' | 'elephant' | 'owl' | 'fox';

export interface AspectProgress {
  level: number;
  xp: number;
  completedRoutines: string[];
}

export interface AppState {
  // Onboarding
  onboardingComplete: boolean;
  name: string;
  age: string;
  height: string;
  weight: string;
  units: 'metric' | 'imperial';

  // Q&A answers (replaces photos)
  looksAnswers: Record<string, string>;
  bodyAnswers: Record<string, string>;

  // Goal
  goalMode: 'describe' | 'photo';
  goalText: string;
  goalPhoto?: string;

  // Selections
  aspects: Aspect[];
  theme: 'dark' | 'light';
  accentColor: string;
  companion: CompanionKind;
  companionName: string;

  // Progress
  xp: number;
  streakDays: number;
  lastTestAt?: string;
  aspectProgress: Record<string, AspectProgress>;

  // Task completions: key = `${YYYY-MM-DD}-${aspectId}-${taskId}`
  taskCompletions: Record<string, boolean>;

  // Custom tasks added by user (per aspect)
  customTasks: Record<string, CustomTask[]>;
  // Hidden built-in tasks: key = `${aspectId}-${taskId}`
  hiddenTasks: Record<string, boolean>;
  // Edited built-in task titles: key = `${aspectId}-${taskId}`
  taskTitleEdits: Record<string, string>;
  // Edited builtin task times: key = `${aspectId}-${taskId}`
  taskTimeEdits: Record<string, string>;
  // Alarm enabled: key = `${aspectId}-${taskId}`
  taskAlarms: Record<string, boolean>;
  // Priority: key = `${aspectId}-${taskId}`, value = 'high' | 'med' | 'low'
  taskPriorities: Record<string, 'high' | 'med' | 'low'>;

  // Challenges
  activeChallenge: { id: string; startDate: string } | null;
  declinedChallengeIds: string[];
  challengeDailyCompletions: Record<string, boolean>;

  // Companion change cooldown
  lastCompanionChangeAt: string | null;

  // Step goal
  stepGoal: number;
  setStepGoal: (n: number) => void;

  // Money tracker
  moneyEntries: MoneyEntry[];
  addMoneyEntry: (entry: MoneyEntry) => void;
  removeMoneyEntry: (id: string) => void;

  // Actions
  setName: (v: string) => void;
  setAge: (v: string) => void;
  setHeight: (v: string) => void;
  setWeight: (v: string) => void;
  setUnits: (v: 'metric' | 'imperial') => void;
  setLooksAnswer: (qId: string, option: string) => void;
  setBodyAnswer: (qId: string, option: string) => void;
  setGoalMode: (v: 'describe' | 'photo') => void;
  setGoalText: (v: string) => void;
  setGoalPhoto: (v: string) => void;
  toggleAspect: (a: Aspect) => void;
  setTheme: (v: 'dark' | 'light') => void;
  setAccentColor: (v: string) => void;
  setCompanion: (v: CompanionKind) => void;
  setCompanionName: (v: string) => void;
  completeOnboarding: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  levelUp: (aspect: string) => void;
  toggleTask: (date: string, aspectId: string, taskId: string) => void;
  isTaskDone: (date: string, aspectId: string, taskId: string) => boolean;
  addCustomTask: (aspectId: string, task: CustomTask) => void;
  removeCustomTask: (aspectId: string, taskId: string) => void;
  editCustomTask: (aspectId: string, taskId: string, title: string) => void;
  hideBuiltinTask: (aspectId: string, taskId: string) => void;
  editBuiltinTaskTitle: (aspectId: string, taskId: string, title: string) => void;
  setTaskTimeEdit: (aspectId: string, taskId: string, time: string) => void;
  setTaskAlarm: (aspectId: string, taskId: string, enabled: boolean) => void;
  setTaskPriority: (aspectId: string, taskId: string, priority: 'high' | 'med' | 'low' | null) => void;
  setActiveChallenge: (id: string) => void;
  declineChallenge: (id: string) => void;
  clearActiveChallenge: () => void;
  markChallengeDay: (date: string) => void;
  updateCustomTask: (aspectId: string, taskId: string, updates: Partial<Omit<CustomTask, 'id'>>) => void;
  resetApp: () => void;
}

const DEFAULT_COMPANION_NAMES: Record<CompanionKind, string> = {
  cat: 'Mochi',
  dog: 'Bolt',
  lion: 'Rex',
  tiger: 'Kaia',
  horse: 'Saga',
  unicorn: 'Lumen',
  parrot: 'Echo',
  elephant: 'Juno',
  owl: 'Atlas',
  fox: 'Ember',
};

const STORAGE_KEY = 'ascend_v2';

function stripFunctions(state: AppState): string {
  return JSON.stringify(state, (_, v) => (typeof v === 'function' ? undefined : v));
}

async function persist(state: AppState) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, stripFunctions(state));
  } catch {}
}

const VALID_ASPECTS = new Set<string>(['facial', 'physical', 'mental', 'spiritual', 'money', 'knowledge']);

const ASPECT_MIGRATIONS: Record<string, string> = {
  looks: 'facial',
  learning: 'knowledge',
};

function migrateAspects(aspects: string[]): Aspect[] {
  const seen = new Set<string>();
  const result: Aspect[] = [];
  for (const id of aspects) {
    const migrated = ASPECT_MIGRATIONS[id] ?? id;
    if (VALID_ASPECTS.has(migrated) && !seen.has(migrated)) {
      seen.add(migrated);
      result.push(migrated as Aspect);
    }
  }
  return result;
}

export async function loadState(): Promise<Partial<AppState> | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as Partial<AppState>;
    if (state.aspects) {
      state.aspects = migrateAspects(state.aspects as string[]);
    }
    return state;
  } catch {
    return null;
  }
}

const defaults: Omit<AppState,
  'setName' | 'setAge' | 'setHeight' | 'setWeight' | 'setUnits' |
  'setLooksAnswer' | 'setBodyAnswer' | 'setGoalMode' | 'setGoalText' | 'setGoalPhoto' |
  'toggleAspect' | 'setTheme' | 'setCompanion' | 'setCompanionName' |
  'completeOnboarding' | 'addXP' | 'incrementStreak' | 'levelUp' | 'resetApp' |
  'toggleTask' | 'isTaskDone' |
  'addCustomTask' | 'removeCustomTask' | 'editCustomTask' |
  'hideBuiltinTask' | 'editBuiltinTaskTitle' | 'setAccentColor' |
  'setTaskTimeEdit' | 'setTaskAlarm' | 'setTaskPriority' |
  'setActiveChallenge' | 'declineChallenge' | 'clearActiveChallenge' | 'markChallengeDay' | 'updateCustomTask' |
  'addMoneyEntry' | 'removeMoneyEntry' | 'setStepGoal'
> = {
  onboardingComplete: false,
  name: '',
  age: '',
  height: '',
  weight: '',
  units: 'metric',
  looksAnswers: {},
  bodyAnswers: {},
  goalMode: 'describe',
  goalText: '',
  goalPhoto: undefined,
  aspects: [],
  theme: 'dark',
  accentColor: '#C9B8F5',
  companion: 'cat',
  companionName: DEFAULT_COMPANION_NAMES.cat,
  xp: 0,
  streakDays: 0,
  lastTestAt: undefined,
  aspectProgress: {},
  taskCompletions: {},
  customTasks: {},
  hiddenTasks: {},
  taskTitleEdits: {},
  taskTimeEdits: {},
  taskAlarms: {},
  taskPriorities: {},
  activeChallenge: null,
  declinedChallengeIds: [],
  challengeDailyCompletions: {},
  lastCompanionChangeAt: null,
  stepGoal: 10000,
  moneyEntries: [],
};

export const useStore = create<AppState>((set, get) => ({
  ...defaults,

  setName: (v) => set(s => { const n = { ...s, name: v }; persist(n); return n; }),
  setAge: (v) => set(s => { const n = { ...s, age: v }; persist(n); return n; }),
  setHeight: (v) => set(s => { const n = { ...s, height: v }; persist(n); return n; }),
  setWeight: (v) => set(s => { const n = { ...s, weight: v }; persist(n); return n; }),
  setUnits: (v) => set(s => { const n = { ...s, units: v }; persist(n); return n; }),

  setLooksAnswer: (qId, option) => set(s => {
    const n = { ...s, looksAnswers: { ...s.looksAnswers, [qId]: option } };
    persist(n); return n;
  }),
  setBodyAnswer: (qId, option) => set(s => {
    const n = { ...s, bodyAnswers: { ...s.bodyAnswers, [qId]: option } };
    persist(n); return n;
  }),

  setGoalMode: (v) => set(s => { const n = { ...s, goalMode: v }; persist(n); return n; }),
  setGoalText: (v) => set(s => { const n = { ...s, goalText: v }; persist(n); return n; }),
  setGoalPhoto: (v) => set(s => { const n = { ...s, goalPhoto: v }; persist(n); return n; }),

  toggleAspect: (a) => set(s => {
    const exists = s.aspects.includes(a);
    const aspects = exists ? s.aspects.filter(x => x !== a) : [...s.aspects, a];
    const n = { ...s, aspects };
    persist(n); return n;
  }),

  setTheme: (v) => set(s => { const n = { ...s, theme: v }; persist(n); return n; }),
  setAccentColor: (v) => set(s => { const n = { ...s, accentColor: v }; persist(n); return n; }),

  setCompanion: (v) => set(s => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const n = { ...s, companion: v, companionName: DEFAULT_COMPANION_NAMES[v], lastCompanionChangeAt: today };
    persist(n); return n;
  }),
  setCompanionName: (v) => set(s => { const n = { ...s, companionName: v }; persist(n); return n; }),

  completeOnboarding: () => set(s => {
    const n = { ...s, onboardingComplete: true };
    persist(n); return n;
  }),

  addXP: (amount) => set(s => { const n = { ...s, xp: s.xp + amount }; persist(n); return n; }),

  incrementStreak: () => set(s => {
    const n = { ...s, streakDays: s.streakDays + 1 };
    persist(n); return n;
  }),

  toggleTask: (date, aspectId, taskId) => set(s => {
    const key = `${date}-${aspectId}-${taskId}`;
    const wasDone = s.taskCompletions[key] ?? false;
    const taskCompletions = { ...s.taskCompletions, [key]: !wasDone };
    // Award XP when completing (not un-completing)
    const xp = !wasDone ? s.xp + 10 : Math.max(0, s.xp - 10);
    const prev = s.aspectProgress[aspectId] || { level: 1, xp: 0, completedRoutines: [] };
    const aspectXp = !wasDone ? prev.xp + 10 : Math.max(0, prev.xp - 10);
    const n = {
      ...s,
      taskCompletions,
      xp,
      aspectProgress: {
        ...s.aspectProgress,
        [aspectId]: { ...prev, xp: aspectXp },
      },
    };
    persist(n); return n;
  }),

  isTaskDone: (date, aspectId, taskId): boolean => {
    const key = `${date}-${aspectId}-${taskId}`;
    return get().taskCompletions[key] ?? false;
  },

  levelUp: (aspect) => set(s => {
    const prev = s.aspectProgress[aspect] || { level: 1, xp: 0, completedRoutines: [] };
    const n = {
      ...s,
      aspectProgress: {
        ...s.aspectProgress,
        [aspect]: { ...prev, level: prev.level + 1, xp: 0 },
      },
    };
    persist(n); return n;
  }),

  addCustomTask: (aspectId, task) => set(s => {
    const existing = s.customTasks[aspectId] ?? [];
    const n = { ...s, customTasks: { ...s.customTasks, [aspectId]: [...existing, task] } };
    persist(n); return n;
  }),

  removeCustomTask: (aspectId, taskId) => set(s => {
    const existing = s.customTasks[aspectId] ?? [];
    const n = { ...s, customTasks: { ...s.customTasks, [aspectId]: existing.filter(t => t.id !== taskId) } };
    persist(n); return n;
  }),

  editCustomTask: (aspectId, taskId, title) => set(s => {
    const existing = s.customTasks[aspectId] ?? [];
    const n = { ...s, customTasks: { ...s.customTasks, [aspectId]: existing.map(t => t.id === taskId ? { ...t, title } : t) } };
    persist(n); return n;
  }),

  hideBuiltinTask: (aspectId, taskId) => set(s => {
    const key = `${aspectId}-${taskId}`;
    const n = { ...s, hiddenTasks: { ...s.hiddenTasks, [key]: true } };
    persist(n); return n;
  }),

  editBuiltinTaskTitle: (aspectId, taskId, title) => set(s => {
    const key = `${aspectId}-${taskId}`;
    const n = { ...s, taskTitleEdits: { ...s.taskTitleEdits, [key]: title } };
    persist(n); return n;
  }),

  setTaskTimeEdit: (aspectId, taskId, time) => set(s => {
    const key = `${aspectId}-${taskId}`;
    const n = { ...s, taskTimeEdits: { ...s.taskTimeEdits, [key]: time } };
    persist(n); return n;
  }),

  setTaskAlarm: (aspectId, taskId, enabled) => set(s => {
    const key = `${aspectId}-${taskId}`;
    const n = { ...s, taskAlarms: { ...s.taskAlarms, [key]: enabled } };
    persist(n); return n;
  }),

  setTaskPriority: (aspectId, taskId, priority) => set(s => {
    const key = `${aspectId}-${taskId}`;
    const updated = { ...s.taskPriorities };
    if (priority === null) delete updated[key];
    else updated[key] = priority;
    const n = { ...s, taskPriorities: updated };
    persist(n); return n;
  }),

  setActiveChallenge: (id) => set(s => {
    const d = new Date();
    const startDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const n = { ...s, activeChallenge: { id, startDate } };
    persist(n); return n;
  }),

  declineChallenge: (id) => set(s => {
    const n = { ...s, declinedChallengeIds: [...s.declinedChallengeIds, id] };
    persist(n); return n;
  }),

  clearActiveChallenge: () => set(s => {
    const n = { ...s, activeChallenge: null };
    persist(n); return n;
  }),

  markChallengeDay: (date) => set(s => {
    if (!s.activeChallenge) return s;
    const key = `${s.activeChallenge.id}-${date}`;
    const n = { ...s, challengeDailyCompletions: { ...s.challengeDailyCompletions, [key]: true } };
    persist(n); return n;
  }),

  updateCustomTask: (aspectId, taskId, updates) => set(s => {
    const existing = s.customTasks[aspectId] ?? [];
    const updated = existing.map(t => t.id === taskId ? { ...t, ...updates } : t);
    const n = { ...s, customTasks: { ...s.customTasks, [aspectId]: updated } };
    persist(n); return n;
  }),

  setStepGoal: (n) => set(s => {
    const ns = { ...s, stepGoal: n };
    persist(ns); return ns;
  }),

  addMoneyEntry: (entry) => set(s => {
    const n = { ...s, moneyEntries: [entry, ...s.moneyEntries] };
    persist(n); return n;
  }),

  removeMoneyEntry: (id) => set(s => {
    const n = { ...s, moneyEntries: s.moneyEntries.filter(e => e.id !== id) };
    persist(n); return n;
  }),

  resetApp: () => {
    SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
    set({ ...defaults, taskCompletions: {} });
  },
}));

export { DEFAULT_COMPANION_NAMES };
