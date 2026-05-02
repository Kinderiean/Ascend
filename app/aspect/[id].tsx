import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Linking, Switch,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';
import type { CustomTask } from '../../lib/store';
import { generateTasksForAspect, Task } from '../../lib/taskEngine';
import { getTodaysWorkout, getWeeklySchedule, WorkoutDay } from '../../lib/workoutPlan';
import { AspectColors, Colors, Fonts, FontSize, Radii, Spacing } from '../../theme/tokens';
import { ASPECT_META } from '../../components/AspectCard';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import BarProgress from '../../components/BarProgress';
import PillButton from '../../components/PillButton';
import { Aspect, MoneyEntry } from '../../lib/store';
import { BOOKS } from '../../lib/books';
import { MEDITATIONS } from '../../lib/meditations';
import { Pedometer } from 'expo-sensors';

function localDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TODAY = localDateStr();
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type TimeSlot = 'morning' | 'afternoon' | 'evening';

function parseHour(time: string): number {
  const lower = time.toLowerCase();
  if (lower === 'anytime' || lower === '—') return 8;
  const m = time.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (!m) return 8;
  let h = parseInt(m[1]);
  const ap = m[3]?.toLowerCase();
  if (ap === 'pm' && h !== 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  return h;
}

function getTimeSlot(time: string): TimeSlot {
  const h = parseHour(time);
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

const SLOT_META: Record<TimeSlot, { label: string; icon: string; color: string }> = {
  morning:   { label: 'Morning',   icon: '☀', color: '#FFB347' },
  afternoon: { label: 'Afternoon', icon: '⚡', color: '#5AC8FA' },
  evening:   { label: 'Evening',   icon: '🌙', color: '#AF52DE' },
};

export default function AspectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const [showFullWorkout, setShowFullWorkout] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ id: string; isCustom: boolean } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const [newTaskSlot, setNewTaskSlot] = useState<TimeSlot>('morning');
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAlarm, setEditAlarm] = useState(false);

  // Step tracking state
  const [steps, setSteps] = useState(0);
  const [stepsAvail, setStepsAvail] = useState<boolean | null>(null);
  const [stepGoalModalOpen, setStepGoalModalOpen] = useState(false);
  const [stepGoalDraft, setStepGoalDraft] = useState('');

  // Money tracker state
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyType, setMoneyType] = useState<'income' | 'expense'>('expense');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyCategory, setMoneyCategory] = useState('Food');
  const [moneyNote, setMoneyNote] = useState('');

  const MONEY_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Other'];

  const {
    looksAnswers, bodyAnswers, goalText,
    aspectProgress, toggleTask, taskCompletions,
    customTasks, hiddenTasks, taskTitleEdits, taskTimeEdits, taskAlarms, taskPriorities, accentColor,
    addCustomTask, removeCustomTask, editCustomTask,
    hideBuiltinTask, editBuiltinTaskTitle,
    setTaskTimeEdit, setTaskAlarm, setTaskPriority, updateCustomTask,
    moneyEntries, addMoneyEntry, removeMoneyEntry,
    stepGoal, setStepGoal,
  } = useStore();

  const accent = accentColor || Colors.accent;
  const aspectId = id as Aspect;

  useEffect(() => {
    if (aspectId !== 'physical') return;
    let sub: any;
    Pedometer.isAvailableAsync().then(avail => {
      setStepsAvail(avail);
      if (!avail) return;
      Pedometer.requestPermissionsAsync().then(({ granted }) => {
        if (!granted) { setStepsAvail(false); return; }
        const start = new Date(); start.setHours(0, 0, 0, 0);
        Pedometer.getStepCountAsync(start, new Date()).then(r => setSteps(r.steps));
        sub = Pedometer.watchStepCount(r => setSteps(r.steps));
      });
    });
    return () => sub?.remove();
  }, [aspectId]);
  const meta = ASPECT_META[aspectId];
  const color = AspectColors[aspectId] ?? accent;
  const prog = aspectProgress[aspectId] ?? { level: 1, xp: 0, completedRoutines: [] };

  const builtinTasks = useMemo(
    () => generateTasksForAspect(aspectId, looksAnswers, bodyAnswers, goalText),
    [aspectId, looksAnswers, bodyAnswers, goalText],
  );

  const visibleBuiltinTasks: Task[] = builtinTasks
    .filter(t => !hiddenTasks[`${aspectId}-${t.id}`])
    .map(t => {
      const key = `${aspectId}-${t.id}`;
      const titleEd = taskTitleEdits[key];
      const timeEd = taskTimeEdits?.[key];
      return { ...t, title: titleEd ?? t.title, time: timeEd ?? t.time };
    });

  const userCustomTasks: CustomTask[] = customTasks[aspectId] ?? [];

  const trainingLevel = bodyAnswers.training ?? 'Beginner (<1yr)';
  const todayWorkout = useMemo(() => getTodaysWorkout(trainingLevel), [trainingLevel]);
  const weekSchedule = useMemo(() => getWeeklySchedule(trainingLevel), [trainingLevel]);

  const allTaskCount = visibleBuiltinTasks.length + userCustomTasks.length;
  const doneCount = [
    ...visibleBuiltinTasks.map(t => `${TODAY}-${aspectId}-${t.id}`),
    ...userCustomTasks.map(t => `${TODAY}-${aspectId}-custom-${t.id}`),
  ].filter(k => taskCompletions[k]).length;

  const todayName = DAY_NAMES[new Date().getDay()];

  const PRIORITY_ORDER: Record<string, number> = { high: 0, med: 1, low: 2 };

  // Group tasks by time slot, sorted high priority first
  const tasksBySlot = useMemo(() => {
    const groups: Record<TimeSlot, Array<{ task: Task | CustomTask; isCustom: boolean }>> = {
      morning: [], afternoon: [], evening: [],
    };
    visibleBuiltinTasks.forEach(t => {
      const slot = getTimeSlot((t as Task).time ?? 'morning');
      groups[slot].push({ task: t, isCustom: false });
    });
    userCustomTasks.forEach(ct => {
      const slot = getTimeSlot(ct.time ?? 'morning');
      groups[slot].push({ task: ct, isCustom: true });
    });
    (Object.keys(groups) as TimeSlot[]).forEach(slot => {
      groups[slot].sort((a, b) => {
        const aId = a.isCustom ? (a.task as CustomTask).id : (a.task as Task).id;
        const bId = b.isCustom ? (b.task as CustomTask).id : (b.task as Task).id;
        const aPri = PRIORITY_ORDER[taskPriorities[`${aspectId}-${aId}`] ?? ''] ?? 3;
        const bPri = PRIORITY_ORDER[taskPriorities[`${aspectId}-${bId}`] ?? ''] ?? 3;
        return aPri - bPri;
      });
    });
    return groups;
  }, [visibleBuiltinTasks, userCustomTasks, taskPriorities, aspectId]);

  function openEditModal(taskId: string, currentTitle: string, isCustom: boolean, currentTime?: string) {
    const key = `${aspectId}-${taskId}`;
    setEditTitle(currentTitle);
    setEditTime(currentTime ?? '');
    setEditAlarm(taskAlarms[key] ?? false);
    setEditModal({ id: taskId, isCustom });
  }

  async function scheduleAlarm(taskId: string, timeStr: string) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Enable notifications in Settings to use alarms.');
      return;
    }
    const lower = timeStr.toLowerCase().trim();
    const m = lower.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
    if (!m) return;
    let hour = parseInt(m[1]);
    const minute = m[2] ? parseInt(m[2]) : 0;
    const ap = m[3];
    if (ap === 'pm' && hour !== 12) hour += 12;
    if (ap === 'am' && hour === 12) hour = 0;

    await Notifications.cancelScheduledNotificationAsync(`task-${aspectId}-${taskId}`).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: `task-${aspectId}-${taskId}`,
      content: {
        title: editTitle || 'Task reminder',
        body: `Time for your ${editTitle} task`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  async function confirmEdit() {
    if (!editModal || !editTitle.trim()) return;
    const key = `${aspectId}-${editModal.id}`;

    if (editModal.isCustom) {
      updateCustomTask(aspectId, editModal.id, {
        title: editTitle.trim(),
        time: editTime.trim() || undefined,
        alarmEnabled: editAlarm,
      });
    } else {
      editBuiltinTaskTitle(aspectId, editModal.id, editTitle.trim());
      if (editTime.trim()) setTaskTimeEdit(aspectId, editModal.id, editTime.trim());
    }
    setTaskAlarm(aspectId, editModal.id, editAlarm);

    if (editAlarm && editTime.trim()) {
      await scheduleAlarm(editModal.id, editTime.trim());
    } else if (!editAlarm) {
      await Notifications.cancelScheduledNotificationAsync(`task-${aspectId}-${editModal.id}`).catch(() => {});
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModal(null);
  }

  function confirmDelete(taskId: string, isCustom: boolean) {
    Alert.alert('Remove task', 'Remove this task from your routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          if (isCustom) removeCustomTask(aspectId, taskId);
          else hideBuiltinTask(aspectId, taskId);
        },
      },
    ]);
  }

  function confirmAddTask() {
    if (!newTaskTitle.trim()) return;
    const task: CustomTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      time: newTaskTime.trim() || (newTaskSlot === 'morning' ? '7 AM' : newTaskSlot === 'afternoon' ? '1 PM' : '8 PM'),
      duration: newTaskDuration.trim() || '—',
    };
    addCustomTask(aspectId, task);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewTaskTitle(''); setNewTaskTime(''); setNewTaskDuration('');
    setAddModalOpen(false);
  }

  const orderedSlots: TimeSlot[] = ['morning', 'afternoon', 'evening'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={C.bg === "#0D0E10" ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing['2xl'],
          gap: Spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.xs }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 22, color: 'rgba(245,244,239,0.7)' }}>‹</Text>
          </TouchableOpacity>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardAltInk, flex: 1 }}>
            {meta?.name}
          </Text>
          <Chip label={`LV ${prog.level}`} variant="accent" size="sm" />
        </View>

        {/* Progress card */}
        <Card tone="cream" style={{ gap: Spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Progress to LV {prog.level + 1}
            </Text>
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: C.cardInk }}>
              {prog.xp} / 500 XP
            </Text>
          </View>
          <BarProgress value={prog.xp} total={500} accent={color} />
          <View style={{ flexDirection: 'row', gap: Spacing.base, alignItems: 'center' }}>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(13,14,16,0.6)' }}>
              {doneCount} of {allTaskCount} tasks done today
            </Text>
            {doneCount === allTaskCount && allTaskCount > 0 && (
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: Colors.ok }}>✓ All done!</Text>
            )}
          </View>
          {doneCount === allTaskCount && allTaskCount > 0 && (
            <View style={{
              backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: 10,
              paddingVertical: 8, paddingHorizontal: 12,
              borderLeftWidth: 3, borderLeftColor: Colors.ok,
            }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(13,14,16,0.65)', lineHeight: FontSize.bodyMd * 1.5 }}>
                Fresh tasks unlock at midnight. See you tomorrow.
              </Text>
            </View>
          )}
        </Card>

        {/* Today's Routine header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 }}>
          <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2 }}>
            Today's routine · {todayName}
          </Text>
          <TouchableOpacity onPress={() => setAddModalOpen(true)}>
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: color }}>+ Add task</Text>
          </TouchableOpacity>
        </View>

        {allTaskCount === 0 && (
          <Card tone="dark">
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt }}>
              Complete onboarding answers to get personalized tasks, or tap + Add task.
            </Text>
          </Card>
        )}

        {/* Grouped by time of day */}
        {orderedSlots.map(slot => {
          const items = tasksBySlot[slot];
          if (items.length === 0) return null;
          const slotMeta = SLOT_META[slot];
          return (
            <View key={slot} style={{ gap: Spacing.sm }}>
              {/* Slot header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: 2 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: slotMeta.color }} />
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: slotMeta.color }}>
                  {slotMeta.label}
                </Text>
                <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.35)' }}>
                  {items.length} task{items.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {items.map(({ task, isCustom }) => {
                const t = task as Task;
                const ct = task as CustomTask;
                const taskId = isCustom ? ct.id : t.id;
                const title = isCustom ? ct.title : t.title;
                const detail = isCustom ? undefined : t.detail;
                const time = isCustom ? ct.time : t.time;
                const duration = isCustom ? ct.duration : t.duration;
                const category = isCustom ? ct.category : t.category;
                const completionKey = isCustom
                  ? `${TODAY}-${aspectId}-custom-${ct.id}`
                  : `${TODAY}-${aspectId}-${t.id}`;
                const done = !!taskCompletions[completionKey];

                const priorityKey = `${aspectId}-${taskId}`;
                const priority = taskPriorities[priorityKey] ?? null;
                return (
                  <TaskRow
                    key={taskId}
                    taskId={taskId}
                    title={title}
                    detail={detail}
                    time={time ?? 'Anytime'}
                    duration={duration ?? '—'}
                    category={category}
                    done={done}
                    priority={priority}
                    onToggle={() => {
                      if (!done) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      if (isCustom) toggleTask(TODAY, aspectId, `custom-${ct.id}`);
                      else toggleTask(TODAY, aspectId, t.id);
                    }}
                    onPriorityChange={() => {
                      const next: Record<string | 'none', 'high' | 'med' | 'low' | null> = {
                        none: 'high', high: 'med', med: 'low', low: null,
                      };
                      setTaskPriority(aspectId, taskId, next[priority ?? 'none']);
                    }}
                    onEdit={() => openEditModal(taskId, title, isCustom, time ?? undefined)}
                    onDelete={() => confirmDelete(taskId, isCustom)}
                    color={color}
                    isCustom={isCustom}
                    slotColor={slotMeta.color}
                  />
                );
              })}
            </View>
          );
        })}

        {/* Workout plan — physical only */}
        {aspectId === 'physical' && (
          <>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 2 }}>
                Today's workout · {todayWorkout.label}
              </Text>
              <WorkoutCard day={todayWorkout} color={color} highlight defaultOpen />
            </View>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
              <TouchableOpacity
                onPress={() => setShowFullWorkout(v => !v)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}
              >
                <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Full week schedule
                </Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: accent }}>
                  {showFullWorkout ? 'Hide ↑' : 'Show all ↓'}
                </Text>
              </TouchableOpacity>
              {showFullWorkout && weekSchedule.map((day, i) => (
                <WorkoutCard key={i} day={day} color={color} />
              ))}
            </View>
          </>
        )}

        {/* Step tracking — physical only */}
        {aspectId === 'physical' && (
          <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2 }}>
                Daily Steps
              </Text>
              <TouchableOpacity onPress={() => { setStepGoalDraft(String(stepGoal)); setStepGoalModalOpen(true); }}>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: accent }}>Goal: {stepGoal.toLocaleString('en-IN')} ▾</Text>
              </TouchableOpacity>
            </View>
            {stepsAvail === false ? (
              <Card>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(13,14,16,0.4)', textAlign: 'center' }}>
                  Steps not available on this device
                </Text>
              </Card>
            ) : (
              <Card style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.numXl, color: color, fontVariant: ['tabular-nums'] }}>
                    {steps.toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: 11, color: 'rgba(13,14,16,0.4)' }}>
                    {Math.round((steps / stepGoal) * 100)}% of goal
                  </Text>
                </View>
                <BarProgress value={steps} total={stepGoal} accent={color} />
              </Card>
            )}
          </View>
        )}

        {/* Books library — knowledge only */}
        {aspectId === 'knowledge' && (
          <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 2 }}>
              Study library · {BOOKS.length} books
            </Text>
            {BOOKS.map(book => (
              <BookCard key={book.id} book={book} color={color} />
            ))}
          </View>
        )}

        {/* Meditation library — spiritual only */}
        {aspectId === 'spiritual' && (
          <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 2 }}>
              Meditation library · 10 styles
            </Text>
            {MEDITATIONS.map(med => (
              <MeditationCard key={med.id} meditation={med} color={color} />
            ))}
          </View>
        )}

        {/* Money tracker — money aspect only */}
        {aspectId === 'money' && (() => {
          const totalIncome = moneyEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
          const totalExpense = moneyEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
          const balance = totalIncome - totalExpense;
          return (
            <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 2 }}>
                Income & Expenses
              </Text>

              {/* Stats row */}
              <Card style={{ flexDirection: 'row', padding: 0, overflow: 'hidden' }}>
                {[
                  { label: 'Income', value: totalIncome, sign: '+', col: '#4CBB73' },
                  { label: 'Spent', value: totalExpense, sign: '-', col: '#B5423A' },
                  { label: 'Balance', value: Math.abs(balance), sign: balance >= 0 ? '' : '-', col: balance >= 0 ? '#C9B8F5' : '#B5423A' },
                ].map((stat, i) => (
                  <View key={stat.label} style={{
                    flex: 1, padding: 14, alignItems: 'center',
                    borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: 'rgba(13,14,16,0.08)',
                  }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 18, color: stat.col, fontVariant: ['tabular-nums'] }}>
                      {stat.sign}₹{stat.value.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: 9, color: 'rgba(13,14,16,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{stat.label}</Text>
                  </View>
                ))}
              </Card>

              {/* Transaction log */}
              {moneyEntries.length > 0 && (
                <View style={{ gap: 6 }}>
                  {moneyEntries.map(entry => (
                    <Card key={entry.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 13, color: 'rgba(13,14,16,0.85)' }}>
                          {entry.note || entry.category}
                        </Text>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(13,14,16,0.45)', marginTop: 2 }}>
                          {entry.date} · {entry.category}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 15, color: entry.type === 'income' ? '#4CBB73' : '#B5423A' }}>
                        {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity onPress={() => removeMoneyEntry(entry.id)} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 14, color: 'rgba(13,14,16,0.3)' }}>✕</Text>
                      </TouchableOpacity>
                    </Card>
                  ))}
                </View>
              )}

              {/* Add button */}
              <TouchableOpacity
                onPress={() => {
                  setMoneyAmount(''); setMoneyNote(''); setMoneyType('expense'); setMoneyCategory('Food');
                  setMoneyModalOpen(true);
                }}
                style={{ backgroundColor: `${color}18`, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: `${color}40` }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: color, textTransform: 'uppercase', letterSpacing: 1 }}>
                  + Add Transaction
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        {/* Level test CTA */}
        <Card tone="dark" style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
          <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.mutedAlt, textTransform: 'uppercase', letterSpacing: 2 }}>
            Ready?
          </Text>
          <Text style={{ fontFamily: Fonts.serif, fontSize: FontSize.displayMd, color: C.cardAltInk, lineHeight: FontSize.displayMd * 1.1 }}>
            Take the LV {prog.level + 1} challenge.
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt, lineHeight: FontSize.bodyMd * 1.6 }}>
            {prog.xp < 400 ? `${400 - prog.xp} XP needed to unlock.` : "You're ready. Prove the routine happened."}
          </Text>
          <PillButton
            label={prog.xp >= 400 ? `Take LV ${prog.level + 1} test` : `${prog.xp} / 400 XP`}
            onPress={() => {}}
            tone={prog.xp >= 400 ? 'accent' : 'ghost'}
            disabled={prog.xp < 400}
          />
        </Card>
      </ScrollView>

      {/* Step Goal Modal */}
      <Modal visible={stepGoalModalOpen} animationType="slide" transparent onRequestClose={() => setStepGoalModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={() => setStepGoalModalOpen(false)} />
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['2xl'], gap: Spacing.base }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>Daily Step Goal</Text>
            <TextInput
              value={stepGoalDraft}
              onChangeText={setStepGoalDraft}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor="rgba(13,14,16,0.3)"
              autoFocus
              style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: 12, padding: 14, fontFamily: Fonts.sans, fontSize: 20, color: C.cardInk, textAlign: 'center' }}
            />
            <TouchableOpacity
              onPress={() => { const n = parseInt(stepGoalDraft); if (n > 0) setStepGoal(n); setStepGoalModalOpen(false); }}
              style={{ backgroundColor: color, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: Fonts.sansBold, fontSize: 15, color: '#FFF' }}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Money Modal */}
      <Modal visible={moneyModalOpen} animationType="slide" transparent onRequestClose={() => setMoneyModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={() => setMoneyModalOpen(false)} />
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['2xl'], gap: Spacing.base }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>Add Transaction</Text>

            {/* Income / Expense toggle */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['income', 'expense'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setMoneyType(t)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                    backgroundColor: moneyType === t ? (t === 'income' ? '#4CBB73' : '#B5423A') : 'rgba(13,14,16,0.08)',
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 13, color: moneyType === t ? '#FFF' : C.cardInk, textTransform: 'capitalize' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <TextInput
              value={moneyAmount}
              onChangeText={setMoneyAmount}
              placeholder="Amount (₹)"
              placeholderTextColor="rgba(13,14,16,0.3)"
              keyboardType="numeric"
              style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: 12, padding: 14, fontFamily: Fonts.sans, fontSize: 16, color: C.cardInk }}
            />

            {/* Category chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MONEY_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setMoneyCategory(cat)}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999,
                    backgroundColor: moneyCategory === cat ? color + '33' : 'rgba(13,14,16,0.08)',
                    borderWidth: 1, borderColor: moneyCategory === cat ? color : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 12, color: moneyCategory === cat ? color : 'rgba(13,14,16,0.55)' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <TextInput
              value={moneyNote}
              onChangeText={setMoneyNote}
              placeholder="Note (optional)"
              placeholderTextColor="rgba(13,14,16,0.3)"
              style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: 12, padding: 14, fontFamily: Fonts.sans, fontSize: 14, color: C.cardInk }}
            />

            {/* Save */}
            <TouchableOpacity
              onPress={() => {
                const amt = parseFloat(moneyAmount);
                if (!amt || isNaN(amt) || amt <= 0) return;
                const d = new Date();
                const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                addMoneyEntry({ id: `${Date.now()}`, date, type: moneyType, amount: amt, category: moneyCategory, note: moneyNote.trim() });
                setMoneyModalOpen(false);
              }}
              style={{ backgroundColor: color, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: Fonts.sansBold, fontSize: 15, color: '#FFF' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Task Modal */}
      <Modal visible={addModalOpen} animationType="slide" transparent onRequestClose={() => setAddModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={() => setAddModalOpen(false)} />
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['2xl'], gap: Spacing.base }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>Add custom task</Text>

            {/* Slot picker */}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(Object.keys(SLOT_META) as TimeSlot[]).map(slot => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setNewTaskSlot(slot)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: Radii.pill,
                    alignItems: 'center',
                    backgroundColor: newTaskSlot === slot ? C.cardInk : 'rgba(13,14,16,0.06)',
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: newTaskSlot === slot ? C.card : C.muted }}>
                    {SLOT_META[slot].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Task title"
              placeholderTextColor="rgba(13,14,16,0.4)"
              style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: Radii.input, padding: 14, fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk }}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TextInput
                value={newTaskTime}
                onChangeText={setNewTaskTime}
                placeholder="Time (e.g. 7 AM)"
                placeholderTextColor="rgba(13,14,16,0.4)"
                style={{ flex: 1, backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: Radii.input, padding: 14, fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk }}
              />
              <TextInput
                value={newTaskDuration}
                onChangeText={setNewTaskDuration}
                placeholder="Duration"
                placeholderTextColor="rgba(13,14,16,0.4)"
                style={{ flex: 1, backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: Radii.input, padding: 14, fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk }}
              />
            </View>
            <TouchableOpacity
              onPress={confirmAddTask}
              style={{ backgroundColor: C.cardInk, borderRadius: Radii.pill, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: C.card, textTransform: 'uppercase', letterSpacing: 1 }}>Add task</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={!!editModal} animationType="slide" transparent onRequestClose={() => setEditModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={() => setEditModal(null)} />
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['2xl'], gap: Spacing.base }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>Edit task</Text>

            {/* Title */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>Title</Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                placeholderTextColor="rgba(13,14,16,0.4)"
                style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: Radii.input, padding: 14, fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk }}
                autoFocus
              />
            </View>

            {/* Time */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>Time</Text>
              <TextInput
                value={editTime}
                onChangeText={setEditTime}
                placeholder="e.g. 7:00 AM, 2:30 PM"
                placeholderTextColor="rgba(13,14,16,0.35)"
                style={{ backgroundColor: 'rgba(13,14,16,0.06)', borderRadius: Radii.input, padding: 14, fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk }}
              />
            </View>

            {/* Alarm toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(13,14,16,0.04)', borderRadius: Radii.input, paddingVertical: 14, paddingHorizontal: 14 }}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: C.cardInk }}>Daily alarm</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: C.muted }}>Notify me at the set time each day</Text>
              </View>
              <Switch
                value={editAlarm}
                onValueChange={setEditAlarm}
                trackColor={{ false: 'rgba(13,14,16,0.15)', true: accent }}
                thumbColor={C.card}
              />
            </View>

            <TouchableOpacity
              onPress={confirmEdit}
              style={{ backgroundColor: C.cardInk, borderRadius: Radii.pill, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: C.card, textTransform: 'uppercase', letterSpacing: 1 }}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  high: { label: '● High', color: '#B5423A' },
  med:  { label: '● Med',  color: '#E0A852' },
  low:  { label: '● Low',  color: '#52A8E0' },
};

function getUrgencyLabel(timeStr: string): { label: string; color: string } | null {
  const lower = timeStr.toLowerCase().trim();
  if (lower === 'anytime' || lower === '—') return null;
  const hour = parseHour(timeStr);
  const now = new Date();
  const taskMins = hour * 60;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const diff = taskMins - nowMins;
  if (diff > 0 && diff <= 120) {
    const label = diff >= 60
      ? `in ${Math.floor(diff / 60)}h ${diff % 60 > 0 ? `${diff % 60}m` : ''}`
      : `in ${diff}m`;
    return { label: label.trim(), color: '#E0A852' };
  }
  if (diff <= 0 && diff >= -30) return { label: 'now', color: '#4CBB73' };
  if (diff < -30) return { label: 'overdue', color: '#B5423A' };
  return null;
}

function TaskRow({
  taskId, title, detail, time, duration, category, done, priority,
  onToggle, onPriorityChange, onEdit, onDelete, color, isCustom, slotColor,
}: {
  taskId: string; title: string; detail?: string; time: string; duration: string;
  category?: string; done: boolean; priority: 'high' | 'med' | 'low' | null;
  onToggle: () => void; onPriorityChange: () => void;
  onEdit: () => void; onDelete: () => void;
  color: string; isCustom?: boolean; slotColor?: string;
}) {
  const C = useColors();
  const priMeta = priority ? PRIORITY_META[priority] : null;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'stretch',
      backgroundColor: C.card, borderRadius: Radii.row, overflow: 'hidden',
    }}>
      {/* Slot color bar */}
      <View style={{ width: 3, backgroundColor: slotColor ?? color, opacity: 0.6 }} />

      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={{
          flex: 1, flexDirection: 'row', alignItems: 'flex-start',
          padding: Spacing.base, gap: Spacing.base,
          opacity: done ? 0.65 : 1,
        }}
      >
        {/* Checkbox */}
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          borderWidth: done ? 0 : 1.8, borderColor: color,
          backgroundColor: done ? color : 'transparent',
          alignItems: 'center', justifyContent: 'center',
          marginTop: 1, flexShrink: 0,
        }}>
          {done && <Text style={{ color: C.cardInk, fontSize: 12, fontWeight: '700' }}>✓</Text>}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {(() => {
            const urgency = !done ? getUrgencyLabel(time) : null;
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: detail ? 4 : 0 }}>
                <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {time}
                </Text>
                {duration !== '—' && (
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: C.muted }}>· {duration}</Text>
                )}
                {urgency && (
                  <View style={{ backgroundColor: `${urgency.color}22`, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: urgency.color, textTransform: 'uppercase', letterSpacing: 0.8 }}>{urgency.label}</Text>
                  </View>
                )}
                {category && (
                  <View style={{ backgroundColor: `${color}22`, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: 0.8 }}>{category}</Text>
                  </View>
                )}
                {isCustom && (
                  <View style={{ backgroundColor: 'rgba(13,14,16,0.07)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Custom</Text>
                  </View>
                )}
              </View>
            );
          })()}
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardInk, textDecorationLine: done ? 'line-through' : 'none' }}>
            {title}
          </Text>
          {done && (
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(13,14,16,0.4)', marginTop: 2 }}>
              ↩ tap to undo
            </Text>
          )}
          {detail && !done && (
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(13,14,16,0.55)', marginTop: 3, lineHeight: FontSize.bodyMd * 1.55 }}>
              {detail}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={{ justifyContent: 'center' }}>
        {/* Priority toggle */}
        <TouchableOpacity
          onPress={onPriorityChange}
          style={{ paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 10, color: priMeta ? priMeta.color : 'rgba(13,14,16,0.25)', fontFamily: Fonts.sansSemiBold }}>
            {priMeta ? priMeta.label : '○ Pri'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEdit}
          style={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, color: C.muted }}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 13, color: 'rgba(200,16,46,0.55)' }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Workout card ───────────────────────────────────────────────────────────────

function WorkoutCard({ day, color, highlight, defaultOpen }: {
  day: WorkoutDay; color: string; highlight?: boolean; defaultOpen?: boolean;
}) {
  const C = useColors();
  const [expanded, setExpanded] = useState(defaultOpen ?? false);

  return (
    <Card tone={highlight ? 'cream' : 'dark'} noPad style={{ overflow: 'hidden' }}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.85}
        style={{ padding: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.base }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: day.isRest ? 'rgba(245,244,239,0.25)' : color }} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: highlight ? C.cardInk : C.cardAltInk }}>
              {day.label}
            </Text>
            <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: highlight ? C.muted : C.mutedAlt }}>
              · {highlight ? DAY_NAMES[new Date().getDay()] : day.dayName}
            </Text>
            {highlight && (
              <View style={{ backgroundColor: `${color}28`, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: 0.6 }}>Today</Text>
              </View>
            )}
          </View>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: highlight ? C.muted : C.mutedAlt }}>{day.focus}</Text>
        </View>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: highlight ? C.muted : C.mutedAlt }}>
          {expanded ? '↑' : '↓'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: highlight ? 'rgba(13,14,16,0.08)' : 'rgba(245,244,239,0.08)' }}>
          {day.isRest && day.cardioNote && (
            <View style={{ padding: Spacing.base }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: highlight ? 'rgba(13,14,16,0.6)' : C.mutedAlt, lineHeight: FontSize.bodyMd * 1.6 }}>
                {day.cardioNote}
              </Text>
            </View>
          )}
          {!day.isRest && day.warmup && day.warmup.length > 0 && (
            <View style={{ paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.sm }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
                Warmup · 5 min
              </Text>
              {day.warmup.map((w, i) => (
                <Text key={`w-${i}`} style={{ fontFamily: Fonts.sans, fontSize: 12, color: highlight ? 'rgba(13,14,16,0.7)' : 'rgba(245,244,239,0.7)', marginBottom: 2 }}>
                  · {w.name}{w.reps ? ` — ${w.reps}` : w.durationSec ? ` — ${w.durationSec}s` : ''}
                </Text>
              ))}
            </View>
          )}
          {day.exercises.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: 4 }}>
                {['Exercise', 'Sets', 'Reps', 'Rest'].map(h => (
                  <Text key={h} style={{ fontFamily: Fonts.monoMedium, fontSize: 9, color: highlight ? C.muted : C.mutedAlt, textTransform: 'uppercase', letterSpacing: 1, flex: h === 'Exercise' ? 3 : 1 }}>{h}</Text>
                ))}
              </View>
              {day.exercises.map((ex, i) => (
                <View key={i} style={{ flexDirection: 'row', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: 4, backgroundColor: i % 2 === 0 ? (highlight ? 'rgba(13,14,16,0.04)' : 'rgba(245,244,239,0.04)') : 'transparent' }}>
                  <View style={{ flex: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: highlight ? C.cardInk : C.cardAltInk }}>{ex.name}</Text>
                      {ex.tag && (
                        <View style={{ backgroundColor: `${color}1A`, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 8, color: color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{ex.tag}</Text>
                        </View>
                      )}
                    </View>
                    {ex.note && <Text style={{ fontFamily: Fonts.sans, fontSize: 10, color: highlight ? C.muted : C.mutedAlt, marginTop: 1, lineHeight: 14 }}>{ex.note}</Text>}
                  </View>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.bodyMd, color: highlight ? C.cardInk : C.cardAltInk, flex: 1 }}>{ex.sets}</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.bodyMd, color: highlight ? C.cardInk : C.cardAltInk, flex: 1 }}>{ex.reps}</Text>
                  <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.bodyMd, color: highlight ? C.muted : C.mutedAlt, flex: 1 }}>{ex.rest}</Text>
                </View>
              ))}
            </>
          )}
          {!day.isRest && day.cooldown && day.cooldown.length > 0 && (
            <View style={{ paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.base }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6, marginTop: Spacing.sm }}>
                Cooldown stretches · 5 min
              </Text>
              {day.cooldown.map((c, i) => (
                <Text key={`c-${i}`} style={{ fontFamily: Fonts.sans, fontSize: 12, color: highlight ? 'rgba(13,14,16,0.7)' : 'rgba(245,244,239,0.7)', marginBottom: 2 }}>
                  · {c.name} — {c.durationSec}s{c.notes ? ` (${c.notes})` : ''}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

// ── Book card ─────────────────────────────────────────────────────────────────

function BookCard({ book, color }: { book: (typeof BOOKS)[number]; color: string }) {
  const C = useColors();
  const [expanded, setExpanded] = useState(false);
  const bookRouter = useRouter();

  function openBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (book.isFreeFull) {
      bookRouter.push(`/book-reader?id=${book.id}` as any);
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(book.searchQuery + ' free pdf read online')}`;
      Linking.openURL(searchUrl).catch(() => {
        Alert.alert('Could not open', 'Check your internet connection and try again.');
      });
    }
  }

  return (
    <Card tone="dark" noPad style={{ overflow: 'hidden' }}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.85}
        style={{ padding: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.base }}
      >
        <View style={{ width: 36, height: 50, borderRadius: 4, backgroundColor: `${color}30`, borderLeftWidth: 3, borderLeftColor: color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Text style={{ fontFamily: Fonts.sansBold, fontSize: 10, color: color, textAlign: 'center' }}>
            {book.title.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardAltInk, flex: 1 }}>{book.title}</Text>
            <View style={{ backgroundColor: `${color}22`, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 9, color: color, textTransform: 'uppercase', letterSpacing: 0.6 }}>{book.category}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: C.mutedAlt }}>{book.author}</Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt, fontStyle: 'italic', marginTop: 2 }}>{book.tagline}</Text>
        </View>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt }}>{expanded ? '↑' : '↓'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(245,244,239,0.08)', padding: Spacing.base, gap: Spacing.base }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt, lineHeight: FontSize.bodyMd * 1.65 }}>
            {book.summary}
          </Text>
          <View style={{ gap: Spacing.sm }}>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: color, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Key lessons
            </Text>
            {book.keyLessons.map((lesson, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' }}>
                <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyMd, color: color, marginTop: 1 }}>{i + 1}.</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt, flex: 1, lineHeight: FontSize.bodyMd * 1.6 }}>{lesson}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={openBook}
            style={{ backgroundColor: `${color}18`, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: `${color}40` }}
          >
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: color, textTransform: 'uppercase', letterSpacing: 1 }}>
              {book.isFreeFull ? 'Read in app →' : 'Search free PDF →'}
            </Text>
          </TouchableOpacity>
          {!book.isFreeFull && (
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(245,244,239,0.3)', textAlign: 'center' }}>
              Results open in browser — choose any free source
            </Text>
          )}
        </View>
      )}
    </Card>
  );
}

// ── Meditation card ────────────────────────────────────────────────────────────

function MeditationCard({ meditation, color }: { meditation: (typeof MEDITATIONS)[number]; color: string }) {
  const C = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={{ gap: Spacing.sm }}>
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.85}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: C.cardInk }}>{meditation.title}</Text>
          <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(13,14,16,0.45)', textTransform: 'uppercase', letterSpacing: 1 }}>{meditation.duration}</Text>
        </View>
        <Text style={{ fontFamily: Fonts.sans, fontSize: 16, color: color }}>{expanded ? '↑' : '↓'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ gap: Spacing.sm }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.cardInk, lineHeight: FontSize.bodyMd * 1.6 }}>
            {meditation.description}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: color, textTransform: 'uppercase', letterSpacing: 0.8 }}>Benefit</Text>
            <Text style={{ flex: 1, fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(13,14,16,0.6)', lineHeight: 16 }}>{meditation.benefit}</Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL(meditation.youtubeSearchUrl).catch(() => {})}
            style={{ backgroundColor: `${color}18`, borderRadius: Radii.pill, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: `${color}40` }}
          >
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: color, textTransform: 'uppercase', letterSpacing: 1 }}>
              Watch on YouTube →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}
