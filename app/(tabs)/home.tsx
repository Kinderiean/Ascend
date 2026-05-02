import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';
import { generateTasksForAspect } from '../../lib/taskEngine';
import { CHALLENGES } from '../../lib/challenges';
import { Colors, Fonts, FontSize, Spacing, Radii, AspectColors } from '../../theme/tokens';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import BarProgress from '../../components/BarProgress';
import Companion from '../../components/Companion';
import { ASPECT_META } from '../../components/AspectCard';

function localDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TODAY = localDateStr();

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const C = useColors();
  const {
    name, companion, companionName, aspects, xp, streakDays,
    aspectProgress, looksAnswers, bodyAnswers, goalText, taskCompletions,
    activeChallenge, declinedChallengeIds, challengeDailyCompletions,
    setActiveChallenge, declineChallenge, clearActiveChallenge, markChallengeDay, addXP,
  } = useStore();

  const weekXP = Math.min(xp, 840);

  // Challenges
  const activeChallengeData = activeChallenge
    ? CHALLENGES.find(c => c.id === activeChallenge.id) ?? null
    : null;

  const daysElapsed = useMemo(() => {
    if (!activeChallenge) return 0;
    const start = new Date(activeChallenge.startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [activeChallenge]);

  const doneToday = activeChallenge
    ? (challengeDailyCompletions[`${activeChallenge.id}-${TODAY}`] ?? false)
    : false;

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!activeChallenge || doneToday) { setTimeLeft(''); return; }
    function tick() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeChallenge, doneToday]);

  const suggestedChallenge = useMemo(() => {
    if (activeChallenge) return null;
    const available = CHALLENGES.filter(c => !declinedChallengeIds.includes(c.id));
    if (available.length === 0) return null;
    // Stable pick per day based on date
    const idx = new Date().getDate() % available.length;
    return available[idx];
  }, [activeChallenge, declinedChallengeIds]);

  // Preview of incomplete tasks across all aspects (max 3)
  const previewTasks = aspects.flatMap((id: string) => {
    if (!ASPECT_META[id as keyof typeof ASPECT_META]) return [];
    const tasks = generateTasksForAspect(id, looksAnswers, bodyAnswers, goalText);
    return tasks
      .filter(t => !taskCompletions[`${TODAY}-${id}-${t.id}`])
      .slice(0, 1)
      .map(t => ({ ...t, aspectId: id }));
  }).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={C.bg === Colors.bg ? "light-content" : "dark-content"} backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: 120,
          paddingHorizontal: Spacing['2xl'],
          gap: Spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header pill */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: C.card,
          borderRadius: Radii.card,
          paddingVertical: 14,
          paddingHorizontal: 18,
          marginBottom: Spacing.xs,
        }}>
          <Text style={{
            fontFamily: Fonts.sansBold,
            fontSize: 16,
            letterSpacing: 0.04 * 16,
            color: C.cardInk,
            textTransform: 'uppercase',
          }}>ASCEND®</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Chip label={`LV ${Math.max(1, Math.floor((xp ?? 0) / 500) + 1)}`} variant="dark" size="sm" />
            <TouchableOpacity
              onPress={() => router.push('/settings' as any)}
              accessibilityLabel="Open settings"
              activeOpacity={0.75}
              style={{
                width: 32, height: 32, borderRadius: 16,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(13,14,16,0.06)',
              }}
            >
              <Text style={{ fontFamily: Fonts.sans, fontSize: 16, color: C.cardInk }}>⚙︎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome */}
        <Card tone="dark" style={{ gap: Spacing.xs }}>
          <Text style={{
            fontFamily: Fonts.monoMedium,
            fontSize: FontSize.monoSm,
            color: C.mutedAlt,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>Welcome back</Text>
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayMd,
            color: C.cardAltInk,
            lineHeight: FontSize.displayMd * 1.1,
          }}>{name ? `${name}, let's level up.` : "Let's level up."}</Text>
        </Card>

        {/* Progress card */}
        <Card tone="cream" style={{ gap: Spacing.base }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{
                fontFamily: Fonts.monoMedium,
                fontSize: FontSize.monoSm,
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 4,
              }}>Your progress</Text>
              <Text style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.bodyMd,
                color: 'rgba(13,14,16,0.6)',
              }}>Stay on track this week</Text>
            </View>
            <Chip label="TODAY" variant="dark" size="sm" />
          </View>
          <BarProgress value={weekXP} total={840} />
          <View style={{ flexDirection: 'row', gap: Spacing['2xl'] }}>
            <View>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>Streak</Text>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.numMd, color: C.cardInk, letterSpacing: -0.02 * FontSize.numMd }}>{streakDays}</Text>
            </View>
            <View>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>XP this wk</Text>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.numMd, color: C.cardInk, letterSpacing: -0.02 * FontSize.numMd }}>{weekXP}</Text>
            </View>
          </View>
        </Card>

        {/* ── Challenge card ── */}
        {activeChallengeData && (
          <Card tone="dark" style={{ gap: Spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <Text style={{ fontSize: 18 }}>{activeChallengeData.icon}</Text>
                <View>
                  <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2 }}>Active challenge</Text>
                  <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardAltInk }}>{activeChallengeData.title}</Text>
                </View>
              </View>
              <Chip label={`${activeChallengeData.category}`} variant="dark" size="sm" />
            </View>
            {/* Progress bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base }}>
              <BarProgress value={daysElapsed} total={activeChallengeData.durationDays} />
              <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.5)', flexShrink: 0 }}>
                {daysElapsed}/{activeChallengeData.durationDays}d
              </Text>
            </View>

            {/* Daily tick + timer row */}
            {daysElapsed < activeChallengeData.durationDays && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(245,244,239,0.04)', borderRadius: 14,
                paddingVertical: 10, paddingHorizontal: 14,
                borderWidth: 1, borderColor: 'rgba(245,244,239,0.08)',
              }}>
                <View>
                  <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 9, color: 'rgba(245,244,239,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>
                    Today's check-in
                  </Text>
                  {doneToday ? (
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: '#4CBB73' }}>✓ Done for today</Text>
                  ) : (
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: 'rgba(245,244,239,0.9)' }}>
                      {timeLeft ? `${timeLeft} remaining` : 'Not done yet'}
                    </Text>
                  )}
                </View>
                {!doneToday ? (
                  <TouchableOpacity
                    onPress={() => markChallengeDay(TODAY)}
                    style={{
                      paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radii.pill,
                      backgroundColor: 'rgba(76,187,115,0.18)',
                      borderWidth: 1, borderColor: 'rgba(76,187,115,0.4)',
                    }}
                  >
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.label, color: '#4CBB73', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Mark done
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: 'rgba(76,187,115,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 16, color: '#4CBB73' }}>✓</Text>
                  </View>
                )}
              </View>
            )}

            {/* Bottom action row */}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {daysElapsed >= activeChallengeData.durationDays ? (
                <TouchableOpacity
                  onPress={() => { addXP(activeChallengeData.xpReward); clearActiveChallenge(); }}
                  style={{ flex: 1, backgroundColor: '#4CBB73', borderRadius: Radii.pill, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: '#0D0E10', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Claim +{activeChallengeData.xpReward} XP
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(245,244,239,0.45)', flex: 1 }}>
                  +{activeChallengeData.xpReward} XP on completion
                </Text>
              )}
              <TouchableOpacity
                onPress={() => clearActiveChallenge()}
                style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radii.pill, borderWidth: 1, borderColor: 'rgba(245,244,239,0.12)' }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: 'rgba(200,16,46,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Abandon</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {suggestedChallenge && (
          <Card tone="dark" style={{ gap: Spacing.sm }}>
            <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.45)', textTransform: 'uppercase', letterSpacing: 2 }}>Today's Challenge</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base }}>
              <Text style={{ fontSize: 22 }}>{suggestedChallenge.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyLg, color: C.cardAltInk }}>{suggestedChallenge.title}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(245,244,239,0.55)', lineHeight: FontSize.bodyMd * 1.5, marginTop: 4 }}>{suggestedChallenge.description}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Chip label={`${suggestedChallenge.durationDays} days`} variant="dark" size="sm" />
              <Chip label={`+${suggestedChallenge.xpReward} XP`} variant="dark" size="sm" />
              <Chip label={suggestedChallenge.category} variant="dark" size="sm" />
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity
                onPress={() => setActiveChallenge(suggestedChallenge.id)}
                style={{ flex: 1, backgroundColor: 'rgba(201,184,245,0.15)', borderRadius: Radii.pill, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,184,245,0.3)' }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: '#C9B8F5', textTransform: 'uppercase', letterSpacing: 0.8 }}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => declineChallenge(suggestedChallenge.id)}
                style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: Radii.pill, borderWidth: 1, borderColor: 'rgba(245,244,239,0.1)' }}
              >
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyMd, color: 'rgba(245,244,239,0.4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Skip</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Active aspects — tappable */}
        {aspects.length > 0 && (
          <View style={{ gap: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: 'rgba(245,244,239,0.5)', textTransform: 'uppercase', letterSpacing: 2 }}>Your aspects</Text>
              <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(245,244,239,0.4)' }}>{aspects.length} active</Text>
            </View>
            {aspects.map((id: string) => {
              const prog = aspectProgress[id] || { level: 1, xp: 0, completedRoutines: [] };
              const meta = ASPECT_META[id as keyof typeof ASPECT_META];
              if (!meta) return null;
              const color = AspectColors[id as keyof typeof AspectColors] ?? '#C9B8F5';
              const tasks = generateTasksForAspect(id, looksAnswers, bodyAnswers, goalText);
              const doneTasks = tasks.filter(t => taskCompletions[`${TODAY}-${id}-${t.id}`]).length;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => router.push(`/aspect/${id}` as any)}
                  activeOpacity={0.85}
                >
                  <Card tone="cream" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.bodyMd, color: C.cardInk }}>{prog.level}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>{meta.name}</Text>
                        <Text style={{ fontFamily: Fonts.mono, fontSize: FontSize.monoSm, color: C.muted }}>{doneTasks}/{tasks.length}</Text>
                      </View>
                      <BarProgress value={prog.xp} total={500} accent={color} height={4} segments={14} />
                    </View>
                    <Text style={{ color: C.muted, fontSize: 18 }}>›</Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {aspects.length === 0 && (
          <Card tone="dark" style={{ alignItems: 'center', gap: Spacing.base }}>
            <Text style={{ fontFamily: Fonts.serif, fontSize: FontSize.displayMd, color: C.cardAltInk, textAlign: 'center' }}>
              Pick your first aspect.
            </Text>
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt, textAlign: 'center' }}>
              Head to the Aspects tab to get started.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
